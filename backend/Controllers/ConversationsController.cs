using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/conversations")]
[Authorize]
public class ConversationsController(IConversationService conversationService, IDirectMessageService directMessageService) : ControllerBase
{
    /// <summary>Lista as conversas do usuário autenticado, mais recente primeiro.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ConversationSummaryDto>>> GetConversations()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var conversations = await conversationService.GetForUserAsync(userId.Value);
        var dtos = conversations.Select(c => new ConversationSummaryDto(
            c.Conversation.Id,
            c.OtherUser.Id,
            c.OtherUser.Username,
            c.OtherUser.AvatarUrl,
            c.LastMessage?.Content,
            c.LastMessage?.CreatedAt ?? c.Conversation.CreatedAt));

        return Ok(dtos);
    }

    /// <summary>Busca (ou cria) a conversa com esse amigo e devolve o histórico.</summary>
    [HttpGet("{friendId:guid}")]
    public async Task<ActionResult<ConversationDetailDto>> GetOrCreate(Guid friendId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var (error, conversation) = await conversationService.GetOrCreateWithFriendAsync(userId.Value, friendId);
        if (error is not null) return MapError(error.Value);

        var messages = await directMessageService.GetRecentAsync(conversation!.Id);
        var otherUser = conversation.UserAId == userId.Value ? conversation.UserB : conversation.UserA;

        var dto = new ConversationDetailDto(
            conversation.Id,
            otherUser.Id,
            otherUser.Username,
            otherUser.AvatarUrl,
            messages.Select(DirectMessageDto.FromEntity));

        return Ok(dto);
    }

    [HttpPost("{conversationId:guid}/messages")]
    public async Task<ActionResult<DirectMessageDto>> SendMessage(Guid conversationId, SendDirectMessageDto body)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(body.Content))
        {
            return BadRequest("O conteúdo da mensagem não pode ser vazio.");
        }

        var conversation = await conversationService.GetConversationIfParticipantAsync(conversationId, userId.Value);
        if (conversation is null)
        {
            return NotFound("Conversa não encontrada, você não faz parte dela, ou vocês não são mais amigos.");
        }

        var message = await directMessageService.CreateAsync(conversationId, userId.Value, body.Content);
        return Ok(DirectMessageDto.FromEntity(message));
    }

    private static ActionResult MapError(ConversationError error) => error switch
    {
        ConversationError.NotFriends => new ObjectResult("Vocês precisam ser amigos para trocar mensagens diretas.") { StatusCode = StatusCodes.Status403Forbidden },
        ConversationError.CannotMessageSelf => new BadRequestObjectResult("Você não pode iniciar uma conversa consigo mesmo."),
        _ => new ObjectResult("Erro inesperado.") { StatusCode = StatusCodes.Status500InternalServerError },
    };
}
