using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Tokens;
using SalaApp.Api.Auth;
using SalaApp.Api.Data;
using SalaApp.Api.Hubs;
using SalaApp.Api.Repositories;
using SalaApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "AllowFrontend";

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IServerRepository, ServerRepository>();
builder.Services.AddScoped<IServerService, ServerService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IChannelRepository, ChannelRepository>();
builder.Services.AddScoped<IChannelService, ChannelService>();
builder.Services.AddScoped<IServerMemberRepository, ServerMemberRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IFriendRequestRepository, FriendRequestRepository>();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddHttpClient<ISupabaseStorageService, SupabaseStorageService>();

// Singletons: presença é estado em memória compartilhado entre todas as conexões do
// processo; o provider de user id é sem estado. Ambos precisam viver além do escopo de
// uma única request/conexão.
builder.Services.AddSingleton<IPresenceTracker, PresenceTracker>();
builder.Services.AddSingleton<IUserIdProvider, SupabaseUserIdProvider>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins(builder.Configuration["Frontend:Origin"] ?? "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              // O cliente JS do SignalR manda withCredentials: true por padrão nas
              // requisições de negotiate/transporte; como a origem já é explícita
              // (WithOrigins, não AllowAnyOrigin), isso é compatível com CORS.
              .AllowCredentials());
});

// Autenticação: valida os JWTs que o Supabase Auth já emite (o backend não emite nem
// gerencia login/senha). O Supabase não publica um discovery document OpenID Connect
// completo, só o JWKS, então a resolução de chave é feita manualmente via
// ConfigurationManager<JsonWebKeySet> (com cache/refresh automático).
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseAudience = builder.Configuration["Supabase:Audience"] ?? "authenticated";
var jwksAddress = $"{supabaseUrl}/auth/v1/.well-known/jwks.json";
var jwksConfigManager = new ConfigurationManager<JsonWebKeySet>(
    jwksAddress, new SupabaseJwksRetriever(), new HttpDocumentRetriever());

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Mantém os nomes de claim originais do Supabase (sub, email, user_metadata, ...)
        // em vez do remapeamento padrão do .NET para ClaimTypes.*.
        options.MapInboundClaims = false;
        options.Events = new JwtBearerEvents
        {
            // O navegador não consegue mandar header Authorization no handshake de
            // WebSocket, então o cliente SignalR manda o token via query string
            // (accessTokenFactory). Só aceita esse fallback pro path do Hub.
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hubs/chat"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },
        };
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            ValidateAudience = true,
            ValidAudience = supabaseAudience,
            ValidateLifetime = true,
            IssuerSigningKeyResolver = (_, _, kid, _) =>
            {
                var jwks = jwksConfigManager.GetConfigurationAsync(CancellationToken.None)
                    .GetAwaiter().GetResult();
                return kid is null ? jwks.Keys : jwks.Keys.Where(k => k.Kid == kid);
            },
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Sem UseHttpsRedirection(): atrás do proxy do Fly.io (e de qualquer PaaS que termina
// TLS na borda), o container só recebe HTTP puro internamente — esse middleware acharia
// que toda requisição é HTTP e entraria em loop de redirect. O "force_https" do fly.toml
// já garante HTTPS pros clientes externos.

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseMiddleware<SupabaseUserProvisioningMiddleware>();
app.UseAuthorization();

// Endpoint público (sem [Authorize]) só pro health check do Fly.io — em Production não
// sobra nenhuma outra rota anônima (Swagger só é mapeado em Development).
app.MapGet("/health", () => Results.Ok("ok"));

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.Run();
