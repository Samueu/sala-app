namespace SalaApp.Api.Dtos;

/// <summary>Um item de GET /api/conversations — a conversa do ponto de vista do usuário autenticado.</summary>
public record ConversationSummaryDto(
    Guid Id,
    Guid FriendId,
    string FriendUsername,
    string? FriendAvatarUrl,
    string? LastMessageContent,
    DateTime LastMessageAt);
