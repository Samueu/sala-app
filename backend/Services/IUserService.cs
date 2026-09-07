using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(Guid id);

    Task<User?> GetByUsernameAsync(string username);

    /// <summary>
    /// Garante que existe um perfil local para o usuário autenticado (Id vindo do
    /// Supabase Auth). Só cria o perfil na primeira vez (a partir das claims do JWT) —
    /// se já existir, devolve como está, sem sobrescrever. Ver comentário na
    /// implementação para o motivo de não sincronizar em toda request.
    /// </summary>
    Task<User> EnsureProfileAsync(Guid id, string username, string? avatarUrl);

    /// <summary>Patch parcial do próprio perfil (PATCH /api/users/me). Null se o usuário não existir.</summary>
    Task<User?> UpdateProfileAsync(Guid id, string? username, string? avatarUrl);
}
