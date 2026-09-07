using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IFriendRequestRepository
{
    /// <summary>Tracked (sem AsNoTracking) — usado quando o Service vai mutar Status/UpdatedAt em seguida (accept/reject).</summary>
    Task<FriendRequest?> GetByIdAsync(Guid id);

    Task<FriendRequest?> GetPendingBetweenAsync(Guid senderId, Guid receiverId);

    Task<IEnumerable<FriendRequest>> GetPendingReceivedAsync(Guid userId);

    Task<IEnumerable<FriendRequest>> GetPendingSentAsync(Guid userId);

    Task<IEnumerable<FriendRequest>> GetAcceptedForUserAsync(Guid userId);

    /// <summary>Consulta leve (sem Include) — usada no hot path de presença (connect/disconnect do ChatHub).</summary>
    Task<IEnumerable<Guid>> GetFriendIdsAsync(Guid userId);

    Task<FriendRequest?> GetAcceptedBetweenAsync(Guid userIdA, Guid userIdB);

    Task AddAsync(FriendRequest request);

    Task UpdateAsync(FriendRequest request);

    Task RemoveAsync(FriendRequest request);
}
