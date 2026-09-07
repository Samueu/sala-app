using SalaApp.Api.Models;

namespace SalaApp.Api.Dtos;

/// <summary>
/// Formato enxuto de uma solicitação de amizade — usado nas respostas REST (criar,
/// listar pending recebidas/enviadas, aceitar, rejeitar) e reaproveitado nos eventos
/// SignalR FriendRequestReceived/FriendRequestAccepted.
/// </summary>
public record FriendRequestDto(
    Guid Id,
    Guid SenderId,
    string? SenderUsername,
    string? SenderAvatarUrl,
    Guid ReceiverId,
    string? ReceiverUsername,
    string? ReceiverAvatarUrl,
    FriendRequestStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt)
{
    public static FriendRequestDto FromEntity(FriendRequest request) => new(
        request.Id,
        request.SenderId,
        request.Sender?.Username,
        request.Sender?.AvatarUrl,
        request.ReceiverId,
        request.Receiver?.Username,
        request.Receiver?.AvatarUrl,
        request.Status,
        request.CreatedAt,
        request.UpdatedAt);
}
