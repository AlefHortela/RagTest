using Microsoft.AspNetCore.Mvc;
using RagTest.Api.DTOs;
using RagTest.Api.Services;

namespace RagTest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var token = await authService.LoginAsync(request.Username, request.Password, ct);
        if (token is null)
            return Unauthorized();

        return Ok(new LoginResponse(token));
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterRequest request, CancellationToken ct)
    {
        await authService.RegisterAsync(request.Username, request.Password, ct);
        return NoContent();
    }
}
