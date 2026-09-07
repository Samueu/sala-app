using SalaApp.Api.Models;

namespace SalaApp.Api.Dtos;

/// <summary>
/// Formato enxuto de DM — reusado no broadcast SignalR (ReceiveDirectMessage) e nas
/// respostas REST (histórico, envio), mesmo espírito de MessageDto.
/// </summary>
public record DirectMessageDto(
    Guid Id,
    string Content,
    DateTime CreatedAt,
    Guid ConversationId,
    Guid SenderId,
    string? SenderUsername,
    string? SenderAvatarUrl)
{
    public static DirectMessageDto FromEntity(DirectMessage message) => new(
        message.Id,
        message.Content,
        message.CreatedAt,
        message.ConversationId,
        message.SenderId,
        message.Sender?.Username,
        message.Sender?.AvatarUrl);
}
