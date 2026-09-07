using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

public class UserService(IUserRepository repository) : IUserService
{
    public Task<User?> GetByIdAsync(Guid id) => repository.GetByIdAsync(id);

    public async Task<User> EnsureProfileAsync(Guid id, string username, string? avatarUrl)
    {
        var existing = await repository.GetByIdAsync(id);
        if (existing is not null && existing.Username == username && existing.AvatarUrl == avatarUrl)
        {
            // Já está em dia, não precisa gravar de novo.
            return existing;
        }

        return await repository.UpsertAsync(id, username, avatarUrl);
    }
}
