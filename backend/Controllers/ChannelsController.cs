using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Models;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/servers/{serverId:guid}/channels")]
[Authorize]
public class ChannelsController(IChannelService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Channel>>> GetForServer(Guid serverId)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var channels = await service.GetChannelsForServerAsync(serverId, userId.Value);
        return channels is null
            ? NotFound("Servidor não encontrado ou você não tem acesso a ele.")
            : Ok(channels);
    }
}
