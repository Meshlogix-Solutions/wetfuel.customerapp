import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import type { GeoJSONSource, Map as MapboxMap, Marker } from 'mapbox-gl/esm';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-mapbox-tracking-map',
  standalone: true,
  template: `<div #map class="map"></div><svg class="route-overlay" aria-hidden="true"><polyline #routeLine /></svg>@if(error){<div class="map-error">{{error}}</div>}`,
  styles: [
    `:host{position:absolute;inset:0;z-index:0;display:block}.map{width:100%;height:100%}.route-overlay{position:absolute;inset:0;z-index:1;width:100%;height:100%;pointer-events:none;overflow:hidden}.route-overlay polyline{fill:none;stroke:#e31b23;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 2px #fff)}.map-error{position:absolute;z-index:2;left:16px;right:16px;top:68px;padding:10px 12px;border-radius:12px;background:#fff1f2;color:#9f1239;font-size:12px;box-shadow:0 3px 14px rgba(0,0,0,.18)}`,
  ],
})
export class MapboxTrackingMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('map', { static: true }) mapElement!: ElementRef<HTMLDivElement>;
  @ViewChild('routeLine', { static: true }) routeLine!: ElementRef<SVGPolylineElement>;
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
  private routeCoordinates: [number, number][] = [];
  private routeRequest?: AbortController;
  private lastRouteKey = '';

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngAfterViewInit(): Promise<void> {
    if (!environment.mapboxAccessToken) { this.error = 'Mapbox access token is not configured.'; return; }
    const mapboxgl = await import('mapbox-gl/esm');
    this.mapbox = mapboxgl;
    this.map = new mapboxgl.Map({ accessToken: environment.mapboxAccessToken, container: this.mapElement.nativeElement, style: rasterStreetStyle(environment.mapboxAccessToken), projection: 'mercator', center: [this.driverLongitude ?? -98.5795, this.driverLatitude ?? 39.8283], zoom: 14 });
    this.resizeObserver = new ResizeObserver(() => this.map?.resize());
    this.resizeObserver.observe(this.mapElement.nativeElement);
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    this.map.on('load', () => { this.map!.setProjection('mercator'); this.ready = true; this.render(); });
    this.map.on('render', () => this.updateRouteOverlay());
    this.map.on('error', event => { const message = event.error?.message || 'Mapbox could not be loaded.'; if (!/abort|cancel/i.test(message)) { this.error = message; this.cdr.detectChanges(); } });
  }

  ngOnChanges(changes: SimpleChanges): void { if (this.ready && Object.keys(changes).length) this.render(); }
  ngOnDestroy(): void { this.routeRequest?.abort(); this.resizeObserver?.disconnect(); this.map?.remove(); }

  private render(): void {
    if (!this.map || !this.ready || this.driverLatitude == null || this.driverLongitude == null || this.siteLatitude == null || this.siteLongitude == null) return;
    const driver: [number, number] = [Number(this.driverLongitude), Number(this.driverLatitude)];
    const site: [number, number] = [Number(this.siteLongitude), Number(this.siteLatitude)];
    if (!this.driverMarker) this.driverMarker = new this.mapbox!.Marker({ element: markerElement('driver') }).setLngLat(driver).setPopup(new this.mapbox!.Popup({ offset: 24 }).setText('Fuel truck location')).addTo(this.map);
    else this.driverMarker.setLngLat(driver);
    if (!this.siteMarker) this.siteMarker = new this.mapbox!.Marker({ element: markerElement('site') }).setLngLat(site).setPopup(new this.mapbox!.Popup({ offset: 24 }).setText('Customer delivery site')).addTo(this.map);
    else this.siteMarker.setLngLat(site);

    this.map.fitBounds(new this.mapbox!.LngLatBounds(driver, site), { padding: 60, maxZoom: 15, duration: 500 });
    void this.loadRoute(driver, site);
  }

  private async loadRoute(driver: [number, number], site: [number, number]): Promise<void> {
    const routeKey = `${driver.join(',')};${site.join(',')}`;
    if (routeKey === this.lastRouteKey) return;
    this.lastRouteKey = routeKey;
    this.routeRequest?.abort();
    const controller = new AbortController();
    this.routeRequest = controller;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${routeKey}?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${encodeURIComponent(environment.mapboxAccessToken)}`;
    try {
      const response = await fetch(url, { signal:controller.signal });
      if (!response.ok) throw new Error(`Directions request failed (${response.status}).`);
      const result = await response.json() as any;
      const route = result.routes?.[0];
      if (!route?.geometry?.coordinates?.length) throw new Error('No driving route was found to the delivery site.');
      this.routeCoordinates = route.geometry.coordinates;
      const data: any = { type:'Feature', properties:{}, geometry:route.geometry };
      const source = this.map?.getSource('driver-route') as GeoJSONSource | undefined;
      if (source) source.setData(data);
      else if (this.map) {
        this.map.addSource('driver-route', { type:'geojson', data });
        this.map.addLayer({ id:'driver-route-outline', type:'line', source:'driver-route', layout:{ 'line-cap':'round', 'line-join':'round' }, paint:{ 'line-color':'#fff', 'line-width':9, 'line-opacity':.9 } });
        this.map.addLayer({ id:'driver-route', type:'line', source:'driver-route', layout:{ 'line-cap':'round', 'line-join':'round' }, paint:{ 'line-color':'#e31b23', 'line-width':6 } });
      }
      this.error = '';
      this.updateRouteOverlay();
      this.cdr.detectChanges();
    } catch (error) {
      if ((error as Error).name !== 'AbortError') { this.error = (error as Error).message; this.cdr.detectChanges(); }
    }
  }

  private updateRouteOverlay(): void {
    if (!this.map || !this.routeCoordinates.length) return;
    this.routeLine.nativeElement.setAttribute('points', this.routeCoordinates.map(coordinate => {
      const point = this.map!.project(coordinate);
      return `${point.x},${point.y}`;
    }).join(' '));
  }
}

function markerElement(kind: 'driver' | 'site'): HTMLDivElement {
  const element = document.createElement('div');
  element.className = `tracking-pin tracking-pin--${kind}`;
  element.style.cssText = `z-index:5;display:grid;width:46px;height:46px;place-items:center;border:3px solid #fff;border-radius:50%;background:${kind === 'driver' ? '#e31b23' : '#16a34a'};color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.38)`;
  element.innerHTML = kind === 'driver' ? fuelTruckSvg : customerSiteSvg;
  element.setAttribute('aria-label', kind === 'driver' ? 'Fuel truck current location' : 'Customer delivery site');
  element.setAttribute('role', 'img');
  return element;
}

const fuelTruckSvg = `<svg viewBox="0 0 32 32" width="29" height="29" aria-hidden="true"><path fill="currentColor" d="M3 8h15a2 2 0 0 1 2 2v11H9.5a4 4 0 0 0-7 0H2V9a1 1 0 0 1 1-1Zm18 5h4.2l4.8 5v3h-1.5a4 4 0 0 0-7 0H21v-8Zm2 2v3h4.1l-2.9-3H23Z"/><circle cx="6" cy="23" r="3" fill="currentColor"/><circle cx="25" cy="23" r="3" fill="currentColor"/><path d="M6 11h10v6H6z" fill="none" stroke="#e31b23" stroke-width="1.5"/><path d="M8 12.5h6M8 15h6" stroke="#e31b23" stroke-width="1.2"/></svg>`;
const customerSiteSvg = `<svg viewBox="0 0 32 32" width="27" height="27" aria-hidden="true"><path fill="currentColor" d="M16 3 3 13v16h10v-9h6v9h10V13L16 3Zm7 18h-4v-5h-6v5H9v-6.9l7-5.4 7 5.4V21Z"/><path fill="currentColor" d="M11 14h3v3h-3zm7 0h3v3h-3z"/></svg>`;

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
