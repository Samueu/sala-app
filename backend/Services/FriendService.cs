using Microsoft.AspNetCore.SignalR;
using SalaApp.Api.Dtos;
using SalaApp.Api.Hubs;
using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

public class FriendService(
    IFriendRequestRepository repository,
    IUserRepository userRepository,
    IPresenceTracker presenceTracker,
    IHubContext<ChatHub> hubContext) : IFriendService
{
    public async Task<(FriendRequestError? Error, FriendRequest? Request)> SendRequestAsync(
        Guid senderId, Guid? receiverId, string? receiverUsername)
    {
        var receiver = receiverId is { } id
            ? await userRepository.GetByIdAsync(id)
            : receiverUsername is not null
                ? await userRepository.GetByUsernameAsync(receiverUsername)
                : null;

        if (receiver is null)
        {
            return (FriendRequestError.ReceiverNotFound, null);
        }

        if (receiver.Id == senderId)
        {
            return (FriendRequestError.CannotFriendSelf, null);
        }

        var existingSameDirection = await repository.GetPendingBetweenAsync(senderId, receiver.Id);
        if (existingSameDirection is not null)
        {
            return (FriendRequestError.AlreadyPending, null);
        }

        // Auto-accept mútuo: o destinatário já tinha te mandado uma solicitação pendente
        // antes de você mandar a sua — em vez de criar uma segunda linha, aceita a
        // existente na hora e notifica os dois como FriendRequestAccepted.
        var reverse = await repository.GetPendingBetweenAsync(receiver.Id, senderId);
        if (reverse is not null)
        {
            var tracked = await repository.GetByIdAsync(reverse.Id)
                ?? throw new InvalidOperationException("Solicitação reversa não encontrada logo após ser lida.");

            tracked.Status = FriendRequestStatus.Accepted;
            tracked.UpdatedAt = DateTime.UtcNow;
            await repository.UpdateAsync(tracked);
            await NotifyAcceptedAsync(tracked);
            return (null, tracked);
        }

        var sender = await userRepository.GetByIdAsync(senderId);
        var request = new FriendRequest { SenderId = senderId, ReceiverId = receiver.Id };
        await repository.AddAsync(request);

        // Preenche as navigations na entidade recém-criada pra montar o DTO do evento sem
        // outro round-trip ao banco (o EF não popula isso sozinho pra um objeto novo).
        request.Sender = sender!;
        request.Receiver = receiver;
        await NotifyReceivedAsync(request);

        return (null, request);
    }

    public async Task<(FriendRequestError? Error, FriendRequest? Request)> AcceptAsync(Guid requestId, Guid userId)
    {
        var request = await repository.GetByIdAsync(requestId);
        if (request is null)
        {
            return (FriendRequestError.RequestNotFound, null);
        }

        if (request.ReceiverId != userId)
        {
            return (FriendRequestError.NotYourRequest, null);
        }

        if (request.Status != FriendRequestStatus.Pending)
        {
            return (FriendRequestError.RequestAlreadyAnswered, null);
        }

        request.Status = FriendRequestStatus.Accepted;
        request.UpdatedAt = DateTime.UtcNow;
        await repository.UpdateAsync(request);
        await NotifyAcceptedAsync(request);

        return (null, request);
    }

    public async Task<(FriendRequestError? Error, FriendRequest? Request)> RejectAsync(Guid requestId, Guid userId)
    {
        var request = await repository.GetByIdAsync(requestId);
        if (request is null)
        {
            return (FriendRequestError.RequestNotFound, null);
        }

        if (request.ReceiverId != userId)
        {
            return (FriendRequestError.NotYourRequest, null);
        }

        if (request.Status != FriendRequestStatus.Pending)
        {
            return (FriendRequestError.RequestAlreadyAnswered, null);
        }

        request.Status = FriendRequestStatus.Rejected;
        request.UpdatedAt = DateTime.UtcNow;
        await repository.UpdateAsync(request);

        // Rejeição não dispara evento SignalR — só os três eventos pedidos
        // (FriendRequestReceived, FriendRequestAccepted, FriendStatusChanged) existem.

        return (null, request);
    }

    public Task<IEnumerable<FriendRequest>> GetPendingReceivedAsync(Guid userId) =>
        repository.GetPendingReceivedAsync(userId);

    public Task<IEnumerable<FriendRequest>> GetPendingSentAsync(Guid userId) =>
        repository.GetPendingSentAsync(userId);

    public async Task<IEnumerable<(User Friend, DateTime FriendsSince, bool IsOnline)>> GetFriendsAsync(Guid userId)
    {
        var accepted = await repository.GetAcceptedForUserAsync(userId);
        return accepted.Select(fr =>
        {
            var friend = fr.SenderId == userId ? fr.Receiver : fr.Sender;
            return (friend, fr.UpdatedAt, presenceTracker.IsOnline(friend.Id));
        });
    }

    public Task<IEnumerable<Guid>> GetFriendIdsAsync(Guid userId) => repository.GetFriendIdsAsync(userId);

    public async Task<FriendRequestError?> RemoveFriendAsync(Guid userId, Guid friendId)
    {
        var request = await repository.GetAcceptedBetweenAsync(userId, friendId);
        if (request is null)
        {
            return FriendRequestError.NotFriends;
        }

        await repository.RemoveAsync(request);
        return null;
    }

    private Task NotifyReceivedAsync(FriendRequest request) =>
        hubContext.Clients.User(request.ReceiverId.ToString())
            .SendAsync("FriendRequestReceived", FriendRequestDto.FromEntity(request));

    private Task NotifyAcceptedAsync(FriendRequest request) =>
        hubContext.Clients.Users([request.SenderId.ToString(), request.ReceiverId.ToString()])
            .SendAsync("FriendRequestAccepted", FriendRequestDto.FromEntity(request));
}
