import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import type { GeoJSONSource, Map as MapboxMap, Marker } from 'mapbox-gl/esm';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-mapbox-tracking-map',
  standalone: true,
  template: `<div #map class="map"></div>@if(error){<div class="map-error">{{error}}</div>}`,
  styles: [
    `:host{position:absolute;inset:0;z-index:0;display:block}.map{width:100%;height:100%}.map-error{position:absolute;z-index:2;left:16px;right:16px;top:68px;padding:10px 12px;border-radius:12px;background:#fff1f2;color:#9f1239;font-size:12px;box-shadow:0 3px 14px rgba(0,0,0,.18)}`,
  ],
})
export class MapboxTrackingMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('map', { static: true }) mapElement!: ElementRef<HTMLDivElement>;
  @Input() driverLatitude?: number;
  @Input() driverLongitude?: number;
  @Input() siteLatitude?: number;
  @Input() siteLongitude?: number;

  error = '';
  private map?: MapboxMap;
  private driverMarker?: Marker;
  private siteMarker?: Marker;
  private mapbox?: typeof import('mapbox-gl/esm');
  private resizeObserver?: ResizeObserver;
  private ready = false;

  async ngAfterViewInit(): Promise<void> {
    if (!environment.mapboxAccessToken) { this.error = 'Mapbox access token is not configured.'; return; }
    const mapboxgl = await import('mapbox-gl/esm');
    this.mapbox = mapboxgl;
    this.map = new mapboxgl.Map({ accessToken: environment.mapboxAccessToken, container: this.mapElement.nativeElement, style: rasterStreetStyle(environment.mapboxAccessToken), projection: 'mercator', center: [this.driverLongitude ?? -98.5795, this.driverLatitude ?? 39.8283], zoom: 14 });
    this.resizeObserver = new ResizeObserver(() => this.map?.resize());
    this.resizeObserver.observe(this.mapElement.nativeElement);
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    this.map.on('load', () => { this.map!.setProjection('mercator'); this.ready = true; this.render(); });
    this.map.on('idle', () => { this.error = ''; });
    this.map.on('error', event => { const message = event.error?.message || 'Mapbox could not be loaded.'; if (!/abort|cancel/i.test(message)) this.error = message; });
  }

  ngOnChanges(changes: SimpleChanges): void { if (this.ready && Object.keys(changes).length) this.render(); }
  ngOnDestroy(): void { this.resizeObserver?.disconnect(); this.map?.remove(); }

  private render(): void {
    if (!this.map || !this.ready || this.driverLatitude == null || this.driverLongitude == null || this.siteLatitude == null || this.siteLongitude == null) return;
    const driver: [number, number] = [Number(this.driverLongitude), Number(this.driverLatitude)];
    const site: [number, number] = [Number(this.siteLongitude), Number(this.siteLatitude)];
    if (!this.driverMarker) this.driverMarker = new this.mapbox!.Marker({ element: markerElement('D', 'driver') }).setLngLat(driver).setPopup(new this.mapbox!.Popup({ offset: 24 }).setText('Driver location')).addTo(this.map);
    else this.driverMarker.setLngLat(driver);
    if (!this.siteMarker) this.siteMarker = new this.mapbox!.Marker({ element: markerElement('S', 'site') }).setLngLat(site).setPopup(new this.mapbox!.Popup({ offset: 24 }).setText('Delivery site')).addTo(this.map);
    else this.siteMarker.setLngLat(site);

    const data: any = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [driver, site] } };
    const source = this.map.getSource('driver-route') as GeoJSONSource | undefined;
    if (source) source.setData(data);
    else {
      this.map.addSource('driver-route', { type: 'geojson', data });
      this.map.addLayer({ id: 'driver-route', type: 'line', source: 'driver-route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#e31b23', 'line-opacity': 0.8, 'line-width': 4 } });
    }
    this.map.fitBounds(new this.mapbox!.LngLatBounds(driver, site), { padding: 60, maxZoom: 15, duration: 500 });
  }
}

function markerElement(label: string, kind: 'driver' | 'site'): HTMLDivElement {
  const element = document.createElement('div');
  element.className = `tracking-pin tracking-pin--${kind}`;
  element.style.cssText = `display:grid;width:34px;height:34px;place-items:center;border:3px solid #fff;border-radius:50%;background:${kind === 'driver' ? '#e31b23' : '#16a34a'};color:#fff;font:800 14px/1 system-ui;box-shadow:0 3px 10px rgba(0,0,0,.35)`;
  element.textContent = label;
  element.setAttribute('aria-label', kind === 'driver' ? 'Driver location' : 'Delivery site');
  return element;
}

function rasterStreetStyle(token: string): any {
  return {
    version: 8,
    sources: {
      'mapbox-streets': {
        type: 'raster',
        tiles: [`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${encodeURIComponent(token)}`],
        tileSize: 512,
        attribution: '© Mapbox © OpenStreetMap',
      },
    },
    layers: [{ id: 'mapbox-streets', type: 'raster', source: 'mapbox-streets' }],
  };
}
