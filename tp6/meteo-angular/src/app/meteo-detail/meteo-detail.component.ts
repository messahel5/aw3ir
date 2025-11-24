import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MeteoService } from '../services/meteo.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-meteo-detail',
  templateUrl: './meteo-detail.component.html',
  styleUrls: ['./meteo-detail.component.css']
})
export class MeteoDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  meteo: any = null;
  forecast: any = null;
  map: L.Map | null = null;
  marker: L.Marker | null = null;

  constructor(
    private route: ActivatedRoute,
    private meteoService: MeteoService
  ) { }

  ngOnInit(): void {
    this.getMeteo();
  }

  ngAfterViewInit(): void {
    // créer la carte vide (sera centrée quand nous aurons les coords)
    this.map = L.map('map', { center: [48.8534, 2.3488], zoom: 5, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  getMeteo(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) return;

    this.meteo = null;
    this.forecast = null;

    this.meteoService.getMeteo(name)
      .then(response => {
        this.meteo = response;
        const lat = Number(this.meteo.coord.lat);
        const lon = Number(this.meteo.coord.lon);
        // positionner la carte et le marqueur
        if (this.map) {
          this.map.setView([lat, lon], 10);
          if (this.marker) {
            this.marker.setLatLng([lat, lon]);
          } else {
            this.marker = L.marker([lat, lon]).addTo(this.map);
          }
        }
      })
      .catch(err => {
        this.meteo = err;
      });

    this.meteoService.getForecast(name)
      .then(f => this.forecast = f)
      .catch(err => console.warn('Forecast non disponible', err));
  }

  formatTime(ts: number): string {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  dailyForecasts(): any[] {
    if (!this.forecast || !this.forecast.list) return [];
    const map: { [k:string]: any } = {};
    this.forecast.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const day = date.toISOString().slice(0,10);
      if (!map[day]) map[day] = item;
    });
    return Object.keys(map).map(k => map[k]);
  }
}
