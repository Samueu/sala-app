namespace SalaApp.Api.Dtos;

/// <summary>Um item da lista de amigos, com status de presença.</summary>
public record FriendDto(
    Guid UserId,
    string Username,
    string? AvatarUrl,
    bool IsOnline,
    DateTime FriendsSince);
