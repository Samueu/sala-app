using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Hubs;

[Authorize]
public class ChatHub(IChannelService channelService, IMessageService messageService, IUserService userService)
    : Hub
{
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

    private Guid GetUserId() =>
        Context.User?.GetUserId() ?? throw new HubException("Usuário não autenticado.");

    private static string GroupName(Guid channelId) => $"channel:{channelId}";
}
