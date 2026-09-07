namespace SalaApp.Api.Models;

/// <summary>
/// Uma solicitação de amizade entre dois usuários. Também representa a amizade em si
/// quando Status é Accepted — não existe uma entidade "Friendship" separada.
/// </summary>
public class FriendRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SenderId { get; set; }

    public User Sender { get; set; } = null!;

    public Guid ReceiverId { get; set; }

    public User Receiver { get; set; } = null!;

    public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
