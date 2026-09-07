using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/friends")]
[Authorize]
public class FriendsController(IFriendService friendService) : ControllerBase
{
    [HttpPost("requests")]
    public async Task<ActionResult<FriendRequestDto>> SendRequest(SendFriendRequestDto body)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        if (body.ReceiverId is null == body.Username is null)
        {
            return BadRequest("Informe exatamente um entre ReceiverId e Username.");
        }

        var (error, request) = await friendService.SendRequestAsync(userId.Value, body.ReceiverId, body.Username);
        if (error is not null)
        {
            return MapSendError(error.Value);
        }

        var dto = FriendRequestDto.FromEntity(request!);
        return CreatedAtAction(nameof(GetPending), null, dto);
    }

    [HttpGet("requests/pending")]
    public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetPending()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var requests = await friendService.GetPendingReceivedAsync(userId.Value);
        return Ok(requests.Select(FriendRequestDto.FromEntity));
    }

    [HttpGet("requests/sent")]
    public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetSent()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var requests = await friendService.GetPendingSentAsync(userId.Value);
        return Ok(requests.Select(FriendRequestDto.FromEntity));
    }

    [HttpPost("requests/{id:guid}/accept")]
    public async Task<ActionResult<FriendRequestDto>> Accept(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var (error, request) = await friendService.AcceptAsync(id, userId.Value);
        return error is not null
            ? MapRespondError(error.Value)
            : Ok(FriendRequestDto.FromEntity(request!));
    }

    [HttpPost("requests/{id:guid}/reject")]
    public async Task<ActionResult<FriendRequestDto>> Reject(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var (error, request) = await friendService.RejectAsync(id, userId.Value);
        return error is not null
            ? MapRespondError(error.Value)
            : Ok(FriendRequestDto.FromEntity(request!));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FriendDto>>> GetFriends()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var friends = await friendService.GetFriendsAsync(userId.Value);
        var dtos = friends.Select(f => new FriendDto(f.Friend.Id, f.Friend.Username, f.Friend.AvatarUrl, f.IsOnline, f.FriendsSince));
        return Ok(dtos);
    }

    [HttpDelete("{friendId:guid}")]
    public async Task<IActionResult> RemoveFriend(Guid friendId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var error = await friendService.RemoveFriendAsync(userId.Value, friendId);
        return error is null ? NoContent() : NotFound("Vocês não são amigos.");
    }

    private static ActionResult MapSendError(FriendRequestError error) => error switch
    {
        FriendRequestError.ReceiverNotFound => new NotFoundObjectResult("Usuário não encontrado."),
        FriendRequestError.CannotFriendSelf => new BadRequestObjectResult("Você não pode enviar uma solicitação de amizade para si mesmo."),
        FriendRequestError.AlreadyPending => new ConflictObjectResult("Você já enviou uma solicitação de amizade para esse usuário."),
        _ => new ObjectResult("Erro inesperado.") { StatusCode = StatusCodes.Status500InternalServerError },
    };

    private static ActionResult MapRespondError(FriendRequestError error) => error switch
    {
        FriendRequestError.RequestNotFound => new NotFoundObjectResult("Solicitação não encontrada."),
        FriendRequestError.NotYourRequest => new ObjectResult("Você não pode responder a esta solicitação.") { StatusCode = StatusCodes.Status403Forbidden },
        FriendRequestError.RequestAlreadyAnswered => new ConflictObjectResult("Essa solicitação já foi respondida."),
        _ => new ObjectResult("Erro inesperado.") { StatusCode = StatusCodes.Status500InternalServerError },
    };
}
