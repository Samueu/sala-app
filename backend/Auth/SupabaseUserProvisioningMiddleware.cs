using System.Text.Json;
using SalaApp.Api.Services;

namespace SalaApp.Api.Auth;

/// <summary>
/// Depois que o token do Supabase é validado, garante que existe um perfil local
/// (tabela Users) pra esse usuário — criando ou atualizando a partir das claims do
/// token. Roda em toda requisição autenticada, antes da autorização.
/// </summary>
public class SupabaseUserProvisioningMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IUserService userService)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var sub = context.User.FindFirst("sub")?.Value;
            if (Guid.TryParse(sub, out var id))
            {
                var email = context.User.FindFirst("email")?.Value;
                var metadata = ParseUserMetadata(context.User.FindFirst("user_metadata")?.Value);

                var username = metadata?.FullName
                    ?? metadata?.Name
                    ?? email?.Split('@').FirstOrDefault()
                    ?? sub!;

                await userService.EnsureProfileAsync(id, username, metadata?.AvatarUrl);
            }
        }

        await next(context);
    }

    private static UserMetadata? ParseUserMetadata(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            return new UserMetadata(
                FullName: root.TryGetProperty("full_name", out var fullName) ? fullName.GetString() : null,
                Name: root.TryGetProperty("name", out var name) ? name.GetString() : null,
                AvatarUrl: root.TryGetProperty("avatar_url", out var avatarUrl) ? avatarUrl.GetString() : null);
        }
        catch (JsonException)
        {
            // Claim mal formada ou ausente — segue sem esses dados, os fallbacks cuidam do resto.
            return null;
        }
    }

    private sealed record UserMetadata(string? FullName, string? Name, string? AvatarUrl);
}
