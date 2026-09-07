using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IConversationService
{
    /// <summary>
    /// Busca a conversa entre o usuário autenticado e o amigo, criando se ainda não
    /// existir. Falha se os dois não forem amigos (reaproveita IFriendService) — essa
    /// checagem roda TODA vez, não só na criação, então revogar a amizade bloqueia
    /// reabrir/ler a conversa também (o histórico continua no banco, só fica
    /// inacessível via API enquanto não forem amigos de novo).
    /// </summary>
    Task<(ConversationError? Error, Conversation? Conversation)> GetOrCreateWithFriendAsync(Guid userId, Guid friendId);

    /// <summary>
    /// Null se a conversa não existe, o usuário não é um dos dois participantes, OU
    /// os dois não são mais amigos — usado como gate de envio (REST e Hub).
    /// </summary>
    Task<Conversation?> GetConversationIfParticipantAsync(Guid conversationId, Guid userId);

    /// <summary>
    /// Conversas do usuário com a outra ponta e a última mensagem já resolvidas do
    /// ponto de vista dele (mesmo padrão de FriendService.GetFriendsAsync). Não filtra
    /// por amizade atual — preserva o histórico de conversas antigas na lista.
    /// </summary>
    Task<IEnumerable<(User OtherUser, Conversation Conversation, DirectMessage? LastMessage)>> GetForUserAsync(Guid userId);
}
