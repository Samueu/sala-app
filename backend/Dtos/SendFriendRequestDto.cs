namespace SalaApp.Api.Dtos;

/// <summary>
/// Corpo de POST /api/friends/requests — exatamente um dos dois campos deve vir
/// preenchido (validado no Controller, sem DataAnnotations, seguindo o padrão do projeto).
/// </summary>
public record SendFriendRequestDto(Guid? ReceiverId, string? Username);
