using Livekit.Server.Sdk.Dotnet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/voice")]
[Authorize]
public class VoiceController(IChannelService channelService, IUserService userService, IConfiguration configuration)
    : ControllerBase
{
    /// <summary>
    /// Gera um token de acesso do LiveKit pro usuário autenticado entrar na sala de
    /// voz correspondente ao canal — mesma checagem de membership do ChatHub, então
    /// só quem participa do servidor consegue um token pra essa sala.
    /// </summary>
    [HttpGet("token")]
    public async Task<IActionResult> GetToken([FromQuery] Guid channelId)
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

        var apiKey = configuration["LiveKit:ApiKey"];
        var apiSecret = configuration["LiveKit:ApiSecret"];
        if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "LiveKit não está configurado.");
        }

        var author = await userService.GetByIdAsync(userId.Value);
        var roomName = channelId.ToString();

        var jwt = new AccessToken(apiKey, apiSecret)
            .WithIdentity(userId.Value.ToString())
            .WithName(author?.Username ?? userId.Value.ToString())
            .WithGrants(new VideoGrants
            {
                RoomJoin = true,
                Room = roomName,
                CanPublish = true,
                CanSubscribe = true,
                CanPublishData = true,
            })
            .ToJwt();

        var url = configuration["LiveKit:Url"] ?? string.Empty;
        return Ok(new VoiceTokenResponse(jwt, url, roomName));
    }
}
