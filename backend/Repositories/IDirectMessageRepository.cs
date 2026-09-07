using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IDirectMessageRepository
{
    Task<DirectMessage> AddAsync(DirectMessage message);

    /// <summary>As últimas `take` mensagens da conversa, mais antiga primeiro. Inclui o Sender.</summary>
    Task<IEnumerable<DirectMessage>> GetRecentForConversationAsync(Guid conversationId, int take);
}
