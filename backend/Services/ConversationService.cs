using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

public class ConversationService(IConversationRepository repository, IFriendService friendService) : IConversationService
{
    public async Task<(ConversationError? Error, Conversation? Conversation)> GetOrCreateWithFriendAsync(Guid userId, Guid friendId)
    {
        if (friendId == userId)
        {
            return (ConversationError.CannotMessageSelf, null);
        }

        if (!await friendService.AreFriendsAsync(userId, friendId))
        {
            return (ConversationError.NotFriends, null);
        }

        var existing = await repository.GetBetweenAsync(userId, friendId);
        if (existing is not null)
        {
            return (null, existing);
        }

        try
        {
            var created = await repository.AddAsync(new Conversation { UserAId = userId, UserBId = friendId });
            // AddAsync não inclui as navigations — recarrega já com UserA/UserB
            // populados pra montar a resposta (o Controller precisa do "outro usuário").
            return (null, await repository.GetByIdAsync(created.Id));
        }
        catch (DbUpdateException)
        {
            // Corrida rara: outra requisição criou a mesma conversa entre a checagem
            // acima e este insert (ex.: os dois lados abrindo a DM ao mesmo tempo). O
            // índice único (UserAId, UserBId) rejeita a segunda inserção — relê a que
            // já existe em vez de propagar o erro.
            return (null, await repository.GetBetweenAsync(userId, friendId));
        }
    }

    public async Task<Conversation?> GetConversationIfParticipantAsync(Guid conversationId, Guid userId)
    {
        var conversation = await repository.GetByIdAsync(conversationId);
        if (conversation is null || (conversation.UserAId != userId && conversation.UserBId != userId))
        {
            return null;
        }

        var otherUserId = conversation.UserAId == userId ? conversation.UserBId : conversation.UserAId;
        return await friendService.AreFriendsAsync(userId, otherUserId) ? conversation : null;
    }

    public async Task<IEnumerable<(User OtherUser, Conversation Conversation, DirectMessage? LastMessage)>> GetForUserAsync(Guid userId)
    {
        var conversations = await repository.GetForUserAsync(userId);
        return conversations
            .Select(c =>
            {
                var other = c.UserAId == userId ? c.UserB : c.UserA;
                var lastMessage = c.Messages.FirstOrDefault();
                return (OtherUser: other, Conversation: c, LastMessage: lastMessage);
            })
            .OrderByDescending(t => t.LastMessage?.CreatedAt ?? t.Conversation.CreatedAt);
    }
}
