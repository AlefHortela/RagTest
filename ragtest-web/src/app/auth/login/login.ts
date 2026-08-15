import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    this.errorMessage.set(null);
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigateByUrl('/occurrences'),
      error: () => this.errorMessage.set('Usuário ou senha inválidos.'),
    });
  }
}
