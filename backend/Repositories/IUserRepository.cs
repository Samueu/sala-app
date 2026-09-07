using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User> UpsertAsync(Guid id, string username, string? avatarUrl);
}
