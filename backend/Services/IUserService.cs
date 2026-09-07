using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(Guid id);

    /// <summary>
    /// Garante que existe um perfil local para o usuário autenticado (Id vindo do
    /// Supabase Auth). Cria o perfil se ainda não existir; atualiza Username/AvatarUrl
    /// só se algo mudou em relação ao que já está salvo.
    /// </summary>
    Task<User> EnsureProfileAsync(Guid id, string username, string? avatarUrl);
}
