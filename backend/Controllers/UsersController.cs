using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Dtos;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IUserService service) : ControllerBase
{
    /// <summary>
    /// Devolve o perfil do usuário autenticado. Como o SupabaseUserProvisioningMiddleware
    /// já criou/atualizou o perfil antes de chegar aqui, ele sempre deve existir.
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var id = User.GetUserId();
        if (id is null)
        {
            return Unauthorized();
        }

        var profile = await service.GetByIdAsync(id.Value);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>Atualiza o próprio perfil (nome de exibição e/ou avatar) — campos omitidos não mudam.</summary>
    [HttpPatch("me")]
    public async Task<IActionResult> UpdateMe(UpdateProfileDto body)
    {
        var id = User.GetUserId();
        if (id is null)
        {
            return Unauthorized();
        }

        if (body.Username is not null && string.IsNullOrWhiteSpace(body.Username))
        {
            return BadRequest("O nome de exibição não pode ser vazio.");
        }

        var updated = await service.UpdateProfileAsync(id.Value, body.Username?.Trim(), body.AvatarUrl);
        return updated is null ? NotFound() : Ok(updated);
    }
}
