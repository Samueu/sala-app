namespace SalaApp.Api.Models;

public class Channel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public string? Topic { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ServerId { get; set; }

    public Server Server { get; set; } = null!;

    public ICollection<Message> Messages { get; set; } = [];
}
