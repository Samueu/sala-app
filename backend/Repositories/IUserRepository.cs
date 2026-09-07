using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User> UpsertAsync(Guid id, string username, string? avatarUrl);

    /// <summary>Patch parcial: só sobrescreve os campos não-nulos. Null se o usuário não existir.</summary>
    Task<User?> UpdateProfileAsync(Guid id, string? username, string? avatarUrl);
}
