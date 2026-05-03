import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import {
  NovaPoshtaService,
  NpWarehouse,
} from '@app/services/nova-poshta.service';

// Fix Leaflet default marker icons in Angular/webpack
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const iconActive = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'np-marker--active',
});

@Component({
  selector: 'app-np-map-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'np-map-modal.component.html',
  styleUrl: 'np-map-modal.component.scss',
})
export class NpMapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) cityRef!: string;
  @Input({ required: true }) cityName!: string;

  @Output() selected = new EventEmitter<NpWarehouse>();
  @Output() closed = new EventEmitter<void>();

  private readonly np = inject(NovaPoshtaService);

  private map!: L.Map;
  private markerMap = new Map<string, L.Marker>();

  readonly warehouses = signal<NpWarehouse[]>([]);
  readonly filtered = signal<NpWarehouse[]>([]);
  readonly loading = signal(true);
  readonly activeWarehouse = signal<NpWarehouse | null>(null);
  readonly searchQuery = signal('');

  ngOnInit(): void {
    this.np.searchWarehouses(this.cityRef).subscribe(list => {
      this.warehouses.set(list);
      this.filtered.set(list);
      this.loading.set(false);
      this.addMarkers(list);
      this.fitMapToWarehouses(list);
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true }).setView(
      [49.0, 31.0],
      6,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private addMarkers(list: NpWarehouse[]): void {
    list.forEach(w => {
      const lat = parseFloat(w.Latitude);
      const lng = parseFloat(w.Longitude);

      if (!lat || !lng) return;

      const marker = L.marker([lat, lng], { icon: iconDefault })
        .addTo(this.map)
        .bindTooltip(`№${w.Number}`, { permanent: false });

      marker.on('click', () => this.highlightWarehouse(w));
      this.markerMap.set(w.Ref, marker);
    });
  }

  private fitMapToWarehouses(list: NpWarehouse[]): void {
    const coords = list
      .filter(w => w.Latitude && w.Longitude)
      .map(
        w => [parseFloat(w.Latitude), parseFloat(w.Longitude)] as L.LatLngTuple,
      );

    if (coords.length) {
      this.map.fitBounds(L.latLngBounds(coords), { padding: [32, 32] });
    }
  }

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();

    this.searchQuery.set(q);
    const result = q
      ? this.warehouses().filter(w => w.Description.toLowerCase().includes(q))
      : this.warehouses();

    this.filtered.set(result);
  }

  highlightWarehouse(w: NpWarehouse): void {
    const prev = this.activeWarehouse();

    if (prev) this.markerMap.get(prev.Ref)?.setIcon(iconDefault);

    this.activeWarehouse.set(w);
    const marker = this.markerMap.get(w.Ref);

    if (marker) {
      marker.setIcon(iconActive);
      this.map.panTo(marker.getLatLng());
    }
  }

  selectWarehouse(w: NpWarehouse): void {
    this.selected.emit(w);
  }

  close(): void {
    this.closed.emit();
  }
}
