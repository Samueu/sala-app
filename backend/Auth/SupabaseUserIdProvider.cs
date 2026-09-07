using Microsoft.AspNetCore.SignalR;

namespace SalaApp.Api.Auth;

/// <summary>
/// Faz o Clients.User(id) do SignalR funcionar com o esquema de claims do Supabase.
/// Sem isso, o SignalR usaria ClaimTypes.NameIdentifier por padrão, que não existe
/// nas claims do Supabase (MapInboundClaims = false, claim usado é "sub").
/// </summary>
public class SupabaseUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection) =>
        connection.User?.GetUserId()?.ToString();
}
