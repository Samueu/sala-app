using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalaApp.Api.Auth;
using SalaApp.Api.Models;
using SalaApp.Api.Services;

namespace SalaApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ServersController(IServerService service) : ControllerBase
{
    /// <summary>Só os servidores em que o usuário autenticado é membro.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Server>>> GetAll()
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await service.GetForUserAsync(userId.Value));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Server>> GetById(Guid id)
    {
        var server = await service.GetByIdAsync(id);
        return server is null ? NotFound() : Ok(server);
    }

    [HttpPost]
    public async Task<ActionResult<Server>> Create(Server server)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        // O dono vem do token, não do corpo — evita que o cliente crie um servidor
        // "em nome" de outro usuário.
        var created = await service.CreateAsync(server, userId.Value);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, Server server)
    {
        if (id != server.Id)
        {
            return BadRequest("O id da rota não bate com o id do corpo da requisição.");
        }

        var updated = await service.UpdateAsync(server);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
