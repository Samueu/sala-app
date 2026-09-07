using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

public class MessageService(IMessageRepository repository) : IMessageService
{
    public Task<Message> CreateAsync(Guid channelId, Guid authorId, string content, Guid? parentMessageId)
    {
        var message = new Message
        {
            ChannelId = channelId,
            AuthorId = authorId,
            Content = content,
            ParentMessageId = parentMessageId,
        };

        return repository.AddAsync(message);
    }
}
