using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
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
}
