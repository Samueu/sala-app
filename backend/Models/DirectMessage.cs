namespace SalaApp.Api.Models;

/// <summary>
/// Uma mensagem dentro de uma Conversation (DM). Entidade separada de Message (que é só
/// para canais) porque DM não tem threads/ParentMessage nem Channel.
/// </summary>
public class DirectMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ConversationId { get; set; }

    public Conversation Conversation { get; set; } = null!;

    public Guid SenderId { get; set; }

    public User Sender { get; set; } = null!;
}
