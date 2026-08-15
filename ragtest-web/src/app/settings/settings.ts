import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  attachmentsPath = '';

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: (settings) => {
        this.attachmentsPath = settings.attachmentsPath;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    this.saving.set(true);
    this.saved.set(false);
    this.errorMessage.set(null);

    this.settingsService.update({ attachmentsPath: this.attachmentsPath }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Não foi possível salvar as configurações.');
      },
    });
  }
}
