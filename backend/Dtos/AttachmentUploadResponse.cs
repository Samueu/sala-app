namespace SalaApp.Api.Dtos;

public record AttachmentUploadResponse(string Url, string FileName, long SizeBytes, string ContentType);
