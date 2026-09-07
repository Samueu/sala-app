namespace SalaApp.Api.Models;

public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ChannelId { get; set; }

    public Channel Channel { get; set; } = null!;

    public Guid AuthorId { get; set; }

    public User Author { get; set; } = null!;

    /// <summary>
    /// Mensagem-pai, quando esta é uma resposta em thread (ver ThreadPanel.tsx no frontend).
    /// Nulo para mensagens de nível raiz do canal.
    /// </summary>
    public Guid? ParentMessageId { get; set; }

    public Message? ParentMessage { get; set; }

    public ICollection<Message> Replies { get; set; } = [];
}
