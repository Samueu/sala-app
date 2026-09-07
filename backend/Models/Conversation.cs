namespace SalaApp.Api.Models;

/// <summary>
/// Uma conversa direta (DM) 1-para-1 entre dois usuários. UserAId é sempre o menor Guid
/// dos dois (comparação via Guid.CompareTo) e UserBId o maior — normalização que garante
/// no máximo uma linha por par de usuários, independente de quem "começou" a conversa.
/// Ver ConversationRepository para a lógica de normalização/get-or-create.
/// </summary>
public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserAId { get; set; }

    public User UserA { get; set; } = null!;

    public Guid UserBId { get; set; }

    public User UserB { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<DirectMessage> Messages { get; set; } = [];
}
