using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User> UpsertAsync(Guid id, string username, string? avatarUrl);
}
