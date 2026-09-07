using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class FriendRequestRepository(AppDbContext context) : IFriendRequestRepository
{
    public async Task<FriendRequest?> GetByIdAsync(Guid id) =>
        await context.FriendRequests
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .FirstOrDefaultAsync(fr => fr.Id == id);

    public async Task<FriendRequest?> GetPendingBetweenAsync(Guid senderId, Guid receiverId) =>
        await context.FriendRequests.AsNoTracking()
            .FirstOrDefaultAsync(fr =>
                fr.SenderId == senderId &&
                fr.ReceiverId == receiverId &&
                fr.Status == FriendRequestStatus.Pending);

    public async Task<IEnumerable<FriendRequest>> GetPendingReceivedAsync(Guid userId) =>
        await context.FriendRequests.AsNoTracking()
            .Include(fr => fr.Sender)
            .Where(fr => fr.ReceiverId == userId && fr.Status == FriendRequestStatus.Pending)
            .ToListAsync();

    public async Task<IEnumerable<FriendRequest>> GetPendingSentAsync(Guid userId) =>
        await context.FriendRequests.AsNoTracking()
            .Include(fr => fr.Receiver)
            .Where(fr => fr.SenderId == userId && fr.Status == FriendRequestStatus.Pending)
            .ToListAsync();

    public async Task<IEnumerable<FriendRequest>> GetAcceptedForUserAsync(Guid userId) =>
        await context.FriendRequests.AsNoTracking()
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .Where(fr =>
                (fr.SenderId == userId || fr.ReceiverId == userId) &&
                fr.Status == FriendRequestStatus.Accepted)
            .ToListAsync();

    public async Task<IEnumerable<Guid>> GetFriendIdsAsync(Guid userId)
    {
        var rows = await context.FriendRequests.AsNoTracking()
            .Where(fr =>
                (fr.SenderId == userId || fr.ReceiverId == userId) &&
                fr.Status == FriendRequestStatus.Accepted)
            .Select(fr => new { fr.SenderId, fr.ReceiverId })
            .ToListAsync();

        return rows.Select(r => r.SenderId == userId ? r.ReceiverId : r.SenderId);
    }

    public async Task<FriendRequest?> GetAcceptedBetweenAsync(Guid userIdA, Guid userIdB) =>
        await context.FriendRequests
            .FirstOrDefaultAsync(fr =>
                fr.Status == FriendRequestStatus.Accepted &&
                ((fr.SenderId == userIdA && fr.ReceiverId == userIdB) ||
                 (fr.SenderId == userIdB && fr.ReceiverId == userIdA)));

    public async Task AddAsync(FriendRequest request)
    {
        context.FriendRequests.Add(request);
        await context.SaveChangesAsync();
    }

    public Task UpdateAsync(FriendRequest request) => context.SaveChangesAsync();

    public async Task RemoveAsync(FriendRequest request)
    {
        context.FriendRequests.Remove(request);
        await context.SaveChangesAsync();
    }
}
