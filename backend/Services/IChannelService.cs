using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IChannelService
{
    /// <summary>
    /// Busca o canal e só devolve se o usuário for membro (ServerMember) do servidor
    /// dono dele. Devolve null tanto se o canal não existe quanto se o usuário não tem
    /// acesso — o chamador não deve distinguir os dois casos.
    /// </summary>
    Task<Channel?> GetChannelIfMemberAsync(Guid channelId, Guid userId);

    /// <summary>
    /// Lista os canais de um servidor, só se o usuário for membro dele. Null se o
    /// servidor não existir ou o usuário não tiver acesso — mesmo tratamento de
    /// GetChannelIfMemberAsync (o chamador não deve distinguir os dois casos).
    /// </summary>
    Task<IEnumerable<Channel>?> GetChannelsForServerAsync(Guid serverId, Guid userId);
}
