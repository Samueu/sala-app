using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IMessageService
{
    Task<Message> CreateAsync(Guid channelId, Guid authorId, string content, Guid? parentMessageId);
}
