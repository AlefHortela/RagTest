import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MapPicker } from '../map-picker/map-picker';
import { OccurrenceService } from '../../core/services/occurrence.service';
import { OccurrenceType } from '../../core/models/occurrence.model';

@Component({
  selector: 'app-occurrence-form',
  imports: [FormsModule, MapPicker],
  templateUrl: './occurrence-form.html',
  styleUrl: './occurrence-form.css',
})
export class OccurrenceForm {
  type: OccurrenceType = 'Acidente';
  title = '';
  description = '';
  occurredAt = '';
  address = '';
  latitude: number | null = null;
  longitude: number | null = null;

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private occurrenceService: OccurrenceService,
    private router: Router,
  ) {}

  onPositionChange(position: { latitude: number; longitude: number }): void {
    this.latitude = position.latitude;
    this.longitude = position.longitude;
  }

  submit(): void {
    this.errorMessage.set(null);
    this.submitting.set(true);

    this.occurrenceService
      .create({
        type: this.type,
        title: this.title,
        description: this.description,
        occurredAt: new Date(this.occurredAt).toISOString(),
        latitude: this.latitude,
        longitude: this.longitude,
        address: this.address || null,
      })
      .subscribe({
        next: (occurrence) => this.router.navigate(['/occurrences', occurrence.id]),
        error: () => {
          this.errorMessage.set('Não foi possível salvar a ocorrência.');
          this.submitting.set(false);
        },
      });
  }
}
