namespace SalaApp.Api.Dtos;

/// <summary>
/// Formato enxuto de mensagem pro broadcast via SignalR — evita serializar o grafo
/// inteiro do EF (Message.Channel.Messages...) ou expor o User inteiro.
/// </summary>
public record MessageDto(
    Guid Id,
    string Content,
    DateTime CreatedAt,
    Guid ChannelId,
    Guid AuthorId,
    string? AuthorUsername,
    string? AuthorAvatarUrl,
    Guid? ParentMessageId);
