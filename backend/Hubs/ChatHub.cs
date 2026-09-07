using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Hubs;

[Authorize]
public class ChatHub(
    IChannelService channelService,
    IMessageService messageService,
    IConversationService conversationService,
    IDirectMessageService directMessageService,
    IUserService userService,
    IPresenceTracker presenceTracker,
    IFriendService friendService)
    : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (presenceTracker.AddConnection(userId, Context.ConnectionId))
        {
            // Primeira conexão desse usuário: ele estava offline, agora está online.
            var friendIds = await friendService.GetFriendIdsAsync(userId);
            await Clients.Users(friendIds.Select(id => id.ToString()).ToList())
                .SendAsync("FriendStatusChanged", new FriendStatusChangedDto(userId, true));
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (presenceTracker.RemoveConnection(userId, Context.ConnectionId))
        {
            // Essa era a última conexão desse usuário: ficou offline.
            var friendIds = await friendService.GetFriendIdsAsync(userId);
            await Clients.Users(friendIds.Select(id => id.ToString()).ToList())
                .SendAsync("FriendStatusChanged", new FriendStatusChangedDto(userId, false));
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinChannel(Guid channelId)
    {
        var userId = GetUserId();
        _ = await channelService.GetChannelIfMemberAsync(channelId, userId)
            ?? throw new HubException("Canal não encontrado ou você não tem acesso a ele.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(channelId));
    }

    public async Task LeaveChannel(Guid channelId)
    {
        // Sair de um grupo não expõe nada, então não precisa checar membership aqui.
        // Ao desconectar, o SignalR já remove a conexão de todos os grupos sozinho.
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(channelId));
    }

    public async Task SendMessage(Guid channelId, string content, Guid? parentMessageId)
    {
        var userId = GetUserId();
        _ = await channelService.GetChannelIfMemberAsync(channelId, userId)
            ?? throw new HubException("Canal não encontrado ou você não tem acesso a ele.");

        var message = await messageService.CreateAsync(channelId, userId, content, parentMessageId);

        // O perfil já foi criado/atualizado pelo SupabaseUserProvisioningMiddleware
        // antes desta chamada chegar aqui.
        var author = await userService.GetByIdAsync(userId);

        var dto = new MessageDto(
            message.Id,
            message.Content,
            message.CreatedAt,
            message.ChannelId,
            message.AuthorId,
            author?.Username,
            author?.AvatarUrl,
            message.ParentMessageId);

        await Clients.Group(GroupName(channelId)).SendAsync("ReceiveMessage", dto);
    }

    public async Task JoinConversation(Guid conversationId)
    {
        var userId = GetUserId();
        _ = await conversationService.GetConversationIfParticipantAsync(conversationId, userId)
            ?? throw new HubException("Conversa não encontrada, você não faz parte dela, ou vocês não são mais amigos.");

        await Groups.AddToGroupAsync(Context.ConnectionId, ConversationGroupName(conversationId));
    }

    public async Task LeaveConversation(Guid conversationId) =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConversationGroupName(conversationId));

    /// <summary>
    /// Espelha SendMessage (canal) pra paridade de API, mas o frontend usa só o POST
    /// REST (ConversationsController.SendMessage) pra enviar de fato. Os dois caminhos
    /// chamam IDirectMessageService.CreateAsync, que já persiste E notifica via SignalR
    /// — este método não faz broadcast de novo, só delega.
    /// </summary>
    public async Task SendDirectMessage(Guid conversationId, string content)
    {
        var userId = GetUserId();
        _ = await conversationService.GetConversationIfParticipantAsync(conversationId, userId)
            ?? throw new HubException("Conversa não encontrada, você não faz parte dela, ou vocês não são mais amigos.");

        await directMessageService.CreateAsync(conversationId, userId, content);
    }

    private Guid GetUserId() =>
        Context.User?.GetUserId() ?? throw new HubException("Usuário não autenticado.");

    private static string GroupName(Guid channelId) => $"channel:{channelId}";

    private static string ConversationGroupName(Guid conversationId) => $"conversation:{conversationId}";
}
