using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

public class UserService(IUserRepository repository) : IUserService
{
    public Task<User?> GetByIdAsync(Guid id) => repository.GetByIdAsync(id);

    public Task<User?> GetByUsernameAsync(string username) => repository.GetByUsernameAsync(username);

    public async Task<User> EnsureProfileAsync(Guid id, string username, string? avatarUrl)
    {
        var existing = await repository.GetByIdAsync(id);
        if (existing is not null)
        {
            // Só popula Username/AvatarUrl na criação (primeiro login). Depois disso, o
            // perfil passa a ser "dono" do usuário — editável via PATCH /api/users/me
            // (UpdateProfileAsync). Esse método roda em TODA requisição autenticada
            // (SupabaseUserProvisioningMiddleware), então se continuasse sincronizando
            // com o user_metadata do JWT a cada request, qualquer alteração feita pelo
            // usuário seria revertida silenciosamente na próxima requisição.
            return existing;
        }

        return await repository.UpsertAsync(id, username, avatarUrl);
    }

    public Task<User?> UpdateProfileAsync(Guid id, string? username, string? avatarUrl) =>
        repository.UpdateProfileAsync(id, username, avatarUrl);
}
