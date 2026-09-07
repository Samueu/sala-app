using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<User?> GetByIdAsync(Guid id) =>
        await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);

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
}
