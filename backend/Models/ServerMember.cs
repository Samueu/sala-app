namespace SalaApp.Api.Models;

/// <summary>
/// Entidade de junção entre Server e User, com o papel do usuário naquele servidor.
/// </summary>
public class ServerMember
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ServerId { get; set; }

    public Server Server { get; set; } = null!;

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public ServerMemberRole Role { get; set; } = ServerMemberRole.Member;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
