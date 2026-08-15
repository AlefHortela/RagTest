import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Occurrence } from '../../core/models/occurrence.model';

const DEFAULT_CENTER: L.LatLngTuple = [-22.61937401305779, -48.788105249404914];
const DEFAULT_ZOOM = 9;

const TYPE_COLORS: Record<string, string> = {
  Acidente: '#dc2626',
  Assalto: '#7c3aed',
  Outro: '#0891b2',
};

@Component({
  selector: 'app-occurrence-map',
  template: `
    <div #mapContainer class="map-container"></div>
    <div class="legend">
      @for (entry of legendEntries; track entry.label) {
        <span class="legend-item">
          <span class="dot" [style.background]="entry.color"></span>
          {{ entry.label }}
        </span>
      }
    </div>
  `,
  styleUrl: './occurrence-map.css',
})
export class OccurrenceMap implements AfterViewInit, OnChanges, OnDestroy {
  @Input() occurrences: Occurrence[] = [];

  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;

  readonly legendEntries = Object.entries(TYPE_COLORS).map(([label, color]) => ({ label, color }));

  private map?: L.Map;
  private markers: L.CircleMarker[] = [];
  private viewInitialized = false;

  constructor(
    private router: Router,
    private zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.viewInitialized = true;
    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['occurrences'] && this.viewInitialized) {
      this.renderMarkers();
    }
  }

  private renderMarkers(): void {
    if (!this.map) return;

    for (const marker of this.markers) marker.remove();
    this.markers = [];

    const located = this.occurrences.filter((o) => o.latitude != null && o.longitude != null);

    for (const occurrence of located) {
      const color = TYPE_COLORS[occurrence.type] ?? '#6b7280';
      const marker = L.circleMarker([occurrence.latitude!, occurrence.longitude!], {
        radius: 7,
        color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 1,
      }).addTo(this.map);

      marker.bindPopup(() => this.buildPopup(occurrence));
      this.markers.push(marker);
    }

    if (located.length > 0) {
      const bounds = L.latLngBounds(located.map((o) => [o.latitude!, o.longitude!] as L.LatLngTuple));
      this.map.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  private buildPopup(occurrence: Occurrence): HTMLElement {
    const container = document.createElement('div');
    container.className = 'occ-popup';

    const title = document.createElement('strong');
    title.textContent = occurrence.title;

    const meta = document.createElement('div');
    meta.style.margin = '0.25rem 0 0.5rem';
    meta.style.color = '#555';
    meta.style.fontSize = '0.85rem';
    const date = new DatePipe('en-US').transform(occurrence.occurredAt, 'dd/MM/yyyy HH:mm');
    meta.textContent = `${occurrence.type} — ${date}`;

    const link = document.createElement('a');
    link.href = `/occurrences/${occurrence.id}`;
    link.textContent = 'Ver detalhes';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      this.zone.run(() => this.router.navigate(['/occurrences', occurrence.id]));
    });

    container.append(title, meta, link);
    return container;
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
