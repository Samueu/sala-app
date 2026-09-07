using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class DirectMessageRepository(AppDbContext context) : IDirectMessageRepository
{
    public async Task<DirectMessage> AddAsync(DirectMessage message)
    {
        context.DirectMessages.Add(message);
        await context.SaveChangesAsync();
        return message;
    }

    public async Task<IEnumerable<DirectMessage>> GetRecentForConversationAsync(Guid conversationId, int take)
    {
        var recent = await context.DirectMessages.AsNoTracking()
            .Include(dm => dm.Sender)
            .Where(dm => dm.ConversationId == conversationId)
            .OrderByDescending(dm => dm.CreatedAt)
            .Take(take)
            .ToListAsync();

        return recent.OrderBy(dm => dm.CreatedAt);
    }
}
