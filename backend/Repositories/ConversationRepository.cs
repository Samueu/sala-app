using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class ConversationRepository(AppDbContext context) : IConversationRepository
{
    public async Task<Conversation?> GetByIdAsync(Guid id) =>
        await context.Conversations.AsNoTracking()
            .Include(c => c.UserA)
            .Include(c => c.UserB)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Conversation?> GetBetweenAsync(Guid userIdA, Guid userIdB)
    {
        var (a, b) = Normalize(userIdA, userIdB);
        return await context.Conversations.AsNoTracking()
            .Include(c => c.UserA)
            .Include(c => c.UserB)
            .FirstOrDefaultAsync(c => c.UserAId == a && c.UserBId == b);
    }

    public async Task<IEnumerable<Conversation>> GetForUserAsync(Guid userId) =>
        await context.Conversations.AsNoTracking()
            .Include(c => c.UserA)
            .Include(c => c.UserB)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
            .Where(c => c.UserAId == userId || c.UserBId == userId)
            .ToListAsync();

    public async Task<Conversation> AddAsync(Conversation conversation)
    {
        (conversation.UserAId, conversation.UserBId) = Normalize(conversation.UserAId, conversation.UserBId);
        context.Conversations.Add(conversation);
        await context.SaveChangesAsync();
        return conversation;
    }

    /// <summary>
    /// Ordena o par pelo Guid (CompareTo) — garante que a conversa entre A e B seja
    /// sempre armazenada/consultada com a mesma combinação UserAId/UserBId, não importa
    /// quem "começou".
    /// </summary>
    private static (Guid A, Guid B) Normalize(Guid userIdA, Guid userIdB) =>
        userIdA.CompareTo(userIdB) <= 0 ? (userIdA, userIdB) : (userIdB, userIdA);
}
