namespace SalaApp.Api.Models;

/// <summary>
/// Representa um servidor (guild) do chat, equivalente ao item exibido em
/// frontend/app/components/ServerList.tsx.
/// </summary>
public class Server
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public string? IconUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid OwnerId { get; set; }

    public User Owner { get; set; } = null!;

    public ICollection<Channel> Channels { get; set; } = [];

    public ICollection<ServerMember> Members { get; set; } = [];
}
