using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

public class ChannelService(IChannelRepository channelRepository, IServerMemberRepository serverMemberRepository)
    : IChannelService
{
    public async Task<Channel?> GetChannelIfMemberAsync(Guid channelId, Guid userId)
    {
        var channel = await channelRepository.GetByIdAsync(channelId);
        if (channel is null)
        {
            return null;
        }

        var isMember = await serverMemberRepository.IsMemberAsync(channel.ServerId, userId);
        return isMember ? channel : null;
    }

    public async Task<IEnumerable<Channel>?> GetChannelsForServerAsync(Guid serverId, Guid userId)
    {
        var isMember = await serverMemberRepository.IsMemberAsync(serverId, userId);
        return isMember ? await channelRepository.GetByServerIdAsync(serverId) : null;
    }
}
