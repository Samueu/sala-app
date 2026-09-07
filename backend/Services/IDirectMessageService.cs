using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IDirectMessageService
{
    /// <summary>
    /// Cria e persiste a mensagem, e notifica os dois participantes via SignalR
    /// (evento ReceiveDirectMessage) — chamado tanto pelo POST REST quanto pelo
    /// ChatHub.SendDirectMessage, então o broadcast só existe aqui, uma vez só.
    /// </summary>
    Task<DirectMessage> CreateAsync(Guid conversationId, Guid senderId, string content);

    Task<IEnumerable<DirectMessage>> GetRecentAsync(Guid conversationId, int take = 50);
}
