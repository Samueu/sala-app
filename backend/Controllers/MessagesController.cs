using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/channels/{channelId:guid}/messages")]
[Authorize]
public class MessagesController(IChannelService channelService, IMessageService messageService) : ControllerBase
{
    /// <summary>
    /// Histórico do canal: últimas 50 mensagens-raiz + todas as respostas delas,
    /// mais antiga primeiro.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetForChannel(Guid channelId)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var channel = await channelService.GetChannelIfMemberAsync(channelId, userId.Value);
        if (channel is null)
        {
            return NotFound("Canal não encontrado ou você não tem acesso a ele.");
        }

        var messages = await messageService.GetRecentAsync(channelId);
        var dtos = messages.Select(m => new MessageDto(
            m.Id, m.Content, m.CreatedAt, m.ChannelId, m.AuthorId,
            m.Author?.Username, m.Author?.AvatarUrl, m.ParentMessageId));

        return Ok(dtos);
    }
}
