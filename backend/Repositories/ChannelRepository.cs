using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class ChannelRepository(AppDbContext context) : IChannelRepository
{
    public async Task<Channel?> GetByIdAsync(Guid id) =>
        await context.Channels.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
}
