using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class ServerRepository(AppDbContext context) : IServerRepository
{
    public async Task<IEnumerable<Server>> GetAllAsync() =>
        await context.Servers.AsNoTracking().ToListAsync();

    public async Task<Server?> GetByIdAsync(Guid id) =>
        await context.Servers.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);

    public async Task<Server> AddAsync(Server server)
    {
        context.Servers.Add(server);
        await context.SaveChangesAsync();
        return server;
    }

    public async Task<bool> UpdateAsync(Server server)
    {
        var existing = await context.Servers.FirstOrDefaultAsync(s => s.Id == server.Id);
        if (existing is null)
        {
            return false;
        }

        existing.Name = server.Name;
        existing.IconUrl = server.IconUrl;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await context.Servers.FirstOrDefaultAsync(s => s.Id == id);
        if (existing is null)
        {
            return false;
        }

        context.Servers.Remove(existing);
        await context.SaveChangesAsync();
        return true;
    }
}
