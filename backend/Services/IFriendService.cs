using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IFriendService
{
    Task<(FriendRequestError? Error, FriendRequest? Request)> SendRequestAsync(
        Guid senderId, Guid? receiverId, string? receiverUsername);

    Task<(FriendRequestError? Error, FriendRequest? Request)> AcceptAsync(Guid requestId, Guid userId);

    Task<(FriendRequestError? Error, FriendRequest? Request)> RejectAsync(Guid requestId, Guid userId);

    Task<IEnumerable<FriendRequest>> GetPendingReceivedAsync(Guid userId);

    Task<IEnumerable<FriendRequest>> GetPendingSentAsync(Guid userId);

    Task<IEnumerable<(User Friend, DateTime FriendsSince, bool IsOnline)>> GetFriendsAsync(Guid userId);

    /// <summary>Só os ids dos amigos, sem carregar User — usado pelo ChatHub no connect/disconnect.</summary>
    Task<IEnumerable<Guid>> GetFriendIdsAsync(Guid userId);

    Task<FriendRequestError?> RemoveFriendAsync(Guid userId, Guid friendId);

    /// <summary>Usado pelo ConversationService pra checar se dois usuários podem abrir/enviar DM.</summary>
    Task<bool> AreFriendsAsync(Guid userIdA, Guid userIdB);
}
