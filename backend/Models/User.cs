namespace SalaApp.Api.Models;

/// <summary>
/// Perfil do usuário. O Id não é gerado localmente — ele espelha o
/// auth.uid() do Supabase Auth, que é quem cuida de fato da autenticação.
/// </summary>
public class User
{
    public Guid Id { get; set; }

    public required string Username { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ServerMember> Memberships { get; set; } = [];

    public ICollection<Message> Messages { get; set; } = [];
}
