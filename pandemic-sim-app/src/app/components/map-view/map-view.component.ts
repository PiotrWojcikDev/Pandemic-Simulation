import { Component } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { SeirSimulationService } from '../../services/seir-simulation.service';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css'
})
export class MapViewComponent {
  private map!: L.Map;
  private markers: L.LayerGroup = L.layerGroup();
  private simulationSubscription!: Subscription;

  private lat: number = 50.8848733;
  private lng: number = 20.5837406;

  constructor(private seirService: SeirSimulationService) {}

  ngOnInit(): void {
    this.map = L.map('map', {
      center: [this.lat, this.lng], // Ślichowice, Kielce
      minZoom: 16,
      maxZoom: 16,
      zoom: 16,
      dragging: false, 
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.markers.addTo(this.map);

    this.simulationSubscription = this.seirService.simulation$.subscribe(state => {
      this.updateMap(state);
    });
  }

  private updateMap(state: { susceptible: number; exposed: number; infectious: number; recovered: number }): void {
    this.markers.clearLayers();

    this.addPoints(state.susceptible, 'blue');
    this.addPoints(state.exposed, 'orange');
    this.addPoints(state.infectious, 'red');
    this.addPoints(state.recovered, 'green');
  }

  private addPoints(count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const lat = this.lat + (Math.random() - 0.5) * 0.005; 
      const lng = this.lng + (Math.random() - 0.5) * 0.02; 

      const circle = L.circle([lat, lng], {
        radius: 2,
        color,
        fillColor: color,
        fillOpacity: 0.8,
      });

      this.markers.addLayer(circle);
    }
  }

  ngOnDestroy(): void {
    this.simulationSubscription?.unsubscribe();
    this.map?.remove();
  }
}
