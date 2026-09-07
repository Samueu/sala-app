using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class MessageRepository(AppDbContext context) : IMessageRepository
{
    public async Task<Message> AddAsync(Message message)
    {
        context.Messages.Add(message);
        await context.SaveChangesAsync();
        return message;
    }

    public async Task<IEnumerable<Message>> GetRecentForChannelAsync(Guid channelId, int take)
    {
        var roots = await context.Messages.AsNoTracking()
            .Include(m => m.Author)
            .Where(m => m.ChannelId == channelId && m.ParentMessageId == null)
            .OrderByDescending(m => m.CreatedAt)
            .Take(take)
            .ToListAsync();

        var rootIds = roots.Select(m => m.Id).ToList();

        var replies = await context.Messages.AsNoTracking()
            .Include(m => m.Author)
            .Where(m => m.ParentMessageId != null && rootIds.Contains(m.ParentMessageId!.Value))
            .ToListAsync();

        return roots.Concat(replies).OrderBy(m => m.CreatedAt);
    }
}
