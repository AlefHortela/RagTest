import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import * as L from 'leaflet';

// Leaflet's Icon.Default._getIconUrl auto-detects an imagePath via CSS and
// prefixes it to iconUrl/iconRetinaUrl/shadowUrl regardless of what's set below.
// Removing the override makes it use these URLs as-is (standard fix for bundlers).
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const DEFAULT_CENTER: L.LatLngTuple = [-22.61937401305779, -48.788105249404914];
const DEFAULT_ZOOM = 12;

@Component({
  selector: 'app-map-picker',
  template: `<div #mapContainer class="map-container"></div>`,
  styleUrl: './map-picker.css',
})
export class MapPicker implements AfterViewInit, OnDestroy {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Output() positionChange = new EventEmitter<{ latitude: number; longitude: number }>();

  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit(): void {
    const center: L.LatLngTuple =
      this.latitude != null && this.longitude != null ? [this.latitude, this.longitude] : DEFAULT_CENTER;

    this.map = L.map(this.mapContainer.nativeElement).setView(center, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    if (this.latitude != null && this.longitude != null) {
      this.marker = L.marker(center).addTo(this.map);
    }

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      this.setMarker(lat, lng);
      this.positionChange.emit({ latitude: lat, longitude: lng });
    });
  }

  private setMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
