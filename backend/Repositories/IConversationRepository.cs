using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id);

    /// <summary>Busca a conversa entre dois usuários (ordem não importa — normaliza internamente).</summary>
    Task<Conversation?> GetBetweenAsync(Guid userIdA, Guid userIdB);

    /// <summary>Todas as conversas de um usuário, com a outra ponta e a última mensagem (se houver) já carregadas.</summary>
    Task<IEnumerable<Conversation>> GetForUserAsync(Guid userId);

    Task<Conversation> AddAsync(Conversation conversation);
}
