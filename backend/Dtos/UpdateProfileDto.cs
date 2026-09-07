namespace SalaApp.Api.Dtos;

/// <summary>
/// Corpo de PATCH /api/users/me — campos opcionais, só os informados (não-nulos) são
/// atualizados.
/// </summary>
public record UpdateProfileDto(string? Username, string? AvatarUrl);
