using Microsoft.AspNetCore.SignalR;
using SalaApp.Api.Dtos;
using SalaApp.Api.Hubs;
using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

public class DirectMessageService(
    IDirectMessageRepository repository,
    IConversationRepository conversationRepository,
    IUserRepository userRepository,
    IHubContext<ChatHub> hubContext) : IDirectMessageService
{
    public async Task<DirectMessage> CreateAsync(Guid conversationId, Guid senderId, string content)
    {
        var message = new DirectMessage
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Content = content,
        };

        await repository.AddAsync(message);

        // Popula a navigation manualmente — mesmo motivo do FriendService: o EF não
        // preenche isso sozinho num insert, e o DTO do evento precisa do username/avatar.
        message.Sender = await userRepository.GetByIdAsync(senderId) ?? message.Sender;

        var conversation = await conversationRepository.GetByIdAsync(conversationId)
            ?? throw new InvalidOperationException("Conversa não encontrada logo após enviar mensagem.");

        var recipientId = conversation.UserAId == senderId ? conversation.UserBId : conversation.UserAId;
        var dto = DirectMessageDto.FromEntity(message);

        // Manda pra Users, não pro grupo "conversation:{id}": ao contrário de um canal
        // (onde só importa quem tem ele aberto), o destinatário de uma DM precisa saber
        // de mensagem nova mesmo estando em outra tela — Clients.Users entrega em TODAS
        // as conexões do usuário, tenha ele entrado no grupo ou não. Isso também cobre
        // as outras abas/dispositivos do próprio remetente.
        await hubContext.Clients.Users([senderId.ToString(), recipientId.ToString()])
            .SendAsync("ReceiveDirectMessage", dto);

        return message;
    }

    public Task<IEnumerable<DirectMessage>> GetRecentAsync(Guid conversationId, int take = 50) =>
        repository.GetRecentForConversationAsync(conversationId, take);
}
