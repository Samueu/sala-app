namespace SalaApp.Api.Dtos;

/// <summary>Resposta de GET /api/conversations/{friendId}: conversa + histórico.</summary>
public record ConversationDetailDto(
    Guid Id,
    Guid FriendId,
    string FriendUsername,
    string? FriendAvatarUrl,
    IEnumerable<DirectMessageDto> Messages);
