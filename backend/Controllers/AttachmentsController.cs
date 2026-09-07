using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/attachments")]
[Authorize]
public class AttachmentsController(IChannelService channelService, ISupabaseStorageService storageService)
    : ControllerBase
{
    private const long MaxFileSizeBytes = 25 * 1024 * 1024; // 25 MB

    /// <summary>
    /// Sobe um arquivo pro Supabase Storage e devolve a URL pública — o cliente decide
    /// como anexar isso numa mensagem (não persiste nada em Message aqui).
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> Upload([FromQuery] Guid channelId, IFormFile? file)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        if (file is null || file.Length == 0)
        {
            return BadRequest("Arquivo vazio ou ausente.");
        }

        var channel = await channelService.GetChannelIfMemberAsync(channelId, userId.Value);
        if (channel is null)
        {
            return NotFound("Canal não encontrado ou você não tem acesso a ele.");
        }

        var extension = Path.GetExtension(file.FileName);
        var objectPath = $"{channelId}/{Guid.NewGuid()}{extension}";

        string url;
        try
        {
            await using var stream = file.OpenReadStream();
            url = await storageService.UploadAsync(objectPath, stream, file.ContentType);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }

        return Ok(new AttachmentUploadResponse(url, file.FileName, file.Length, file.ContentType));
    }
}
