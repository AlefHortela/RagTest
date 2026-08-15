namespace RagTest.Api.DTOs;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token);
public record RegisterRequest(string Username, string Password);
