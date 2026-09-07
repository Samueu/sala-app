using System.Security.Claims;

namespace SalaApp.Api.Auth;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Extrai o Id do usuário autenticado a partir do claim "sub" do JWT do Supabase
    /// Auth. Null se não estiver presente ou não for um Guid válido.
    /// </summary>
    public static Guid? GetUserId(this ClaimsPrincipal principal)
    {
        var sub = principal.FindFirst("sub")?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
