namespace SalaApp.Api.Dtos;

/// <summary>Payload do evento SignalR FriendStatusChanged.</summary>
public record FriendStatusChangedDto(Guid UserId, bool IsOnline);
