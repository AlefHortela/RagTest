import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OccurrenceService } from '../../core/services/occurrence.service';
import { Occurrence } from '../../core/models/occurrence.model';
import { OccurrenceMap } from '../occurrence-map/occurrence-map';

type ViewMode = 'list' | 'map';

@Component({
  selector: 'app-occurrence-list',
  imports: [RouterLink, DatePipe, OccurrenceMap],
  templateUrl: './occurrence-list.html',
  styleUrl: './occurrence-list.css',
})
export class OccurrenceList implements OnInit {
  readonly occurrences = signal<Occurrence[]>([]);
  readonly loading = signal(true);
  readonly view = signal<ViewMode>('list');

  constructor(private occurrenceService: OccurrenceService) {}

  ngOnInit(): void {
    this.occurrenceService.list().subscribe({
      next: (data) => {
        this.occurrences.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setView(view: ViewMode): void {
    this.view.set(view);
  }
}
