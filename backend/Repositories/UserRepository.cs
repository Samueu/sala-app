using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<User?> GetByIdAsync(Guid id) =>
        await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);

    // Comparação case-insensitive pra melhor UX ao adicionar amigo por username. Não há
    // índice único em Username hoje, então em tese pode haver colisão de capitalização
    // (ex: "Ana" e "ana") — fora do escopo deste método corrigir isso.
    public async Task<User?> GetByUsernameAsync(string username) =>
        await context.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

    public async Task<User> UpsertAsync(Guid id, string username, string? avatarUrl)
    {
        var existing = await context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (existing is null)
        {
            existing = new User { Id = id, Username = username, AvatarUrl = avatarUrl };
            context.Users.Add(existing);
        }
        else
        {
            existing.Username = username;
            existing.AvatarUrl = avatarUrl;
        }

        await context.SaveChangesAsync();
        return existing;
    }

    public async Task<User?> UpdateProfileAsync(Guid id, string? username, string? avatarUrl)
    {
        var existing = await context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (existing is null)
        {
            return null;
        }

        if (username is not null)
        {
            existing.Username = username;
        }

        if (avatarUrl is not null)
        {
            existing.AvatarUrl = avatarUrl;
        }

        await context.SaveChangesAsync();
        return existing;
    }
}
