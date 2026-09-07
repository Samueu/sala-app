namespace SalaApp.Api.Dtos;

/// <summary>
/// Tudo que o cliente LiveKit precisa pra conectar numa sala de voz: o token de
/// acesso, a URL do servidor e o nome da sala (== o Guid do Channel).
/// </summary>
public record VoiceTokenResponse(string Token, string Url, string RoomName);
