import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OccurrenceService } from '../../core/services/occurrence.service';
import { Occurrence } from '../../core/models/occurrence.model';

@Component({
  selector: 'app-occurrence-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './occurrence-detail.html',
  styleUrl: './occurrence-detail.css',
})
export class OccurrenceDetail implements OnInit {
  readonly occurrence = signal<Occurrence | null>(null);
  readonly uploading = signal(false);
  readonly uploadError = signal<string | null>(null);

  private occurrenceId!: string;

  constructor(
    private route: ActivatedRoute,
    private occurrenceService: OccurrenceService,
  ) {}

  ngOnInit(): void {
    this.occurrenceId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  private load(): void {
    this.occurrenceService.get(this.occurrenceId).subscribe((occurrence) => this.occurrence.set(occurrence));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    this.occurrenceService.uploadAttachment(this.occurrenceId, file).subscribe({
      next: () => {
        this.uploading.set(false);
        input.value = '';
        this.load();
      },
      error: () => {
        this.uploading.set(false);
        this.uploadError.set('Falha ao enviar o arquivo.');
      },
    });
  }
}
