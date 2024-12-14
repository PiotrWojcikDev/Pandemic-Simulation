import { Component, OnInit } from '@angular/core';
import { SeirSimulationService } from '../../services/seir-simulation.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { FormsModule } from '@angular/forms'; 
import { NgChartsModule } from 'ng2-charts';
import { interval, Subscription, take } from 'rxjs';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ChartViewComponent } from '../chart-view/chart-view.component';
import { MapViewComponent } from '../map-view/map-view.component';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [
    FormsModule, 
    NgChartsModule,
    CommonModule, 
    ChartViewComponent,
    MapViewComponent
  ],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.css'
})
export class SimulationComponent implements OnInit {
  private _simulationIntervalSubscription: Subscription | undefined;

  public isSimulationRunning: boolean = false;
  public isSimulationPaused: boolean = false;
  @ViewChild(ChartViewComponent) chartView!: ChartViewComponent;

  public simulationView: string = 'map-view'; 

  public beta!: number;  
  public sigma!: number ; 
  public gamma!: number; 
  public chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { label: 'Podatni (S)', data: [], backgroundColor: 'blue', borderColor: 'blue' },
      { label: 'Eksponowani (E)', data: [], backgroundColor: 'orange', borderColor: 'orange' },
      { label: 'Zakaźni (I)', data: [], backgroundColor: 'red', borderColor: 'red' },
      { label: 'Ozdrowiali (R)', data: [], backgroundColor: 'green', borderColor: 'green' }
    ]
  };


   public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Kroki symulacji', // Etykieta osi X
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Liczba osób', // Etykieta osi Y
        },
        min: 0, 
        max: 1000,
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
      },
    },
  };

  private _simulationSubscription: Subscription | undefined;
  private simulationSteps: number = 300;
  initialState: { susceptible: number; exposed: number; infectious: number; recovered: number } = {
    susceptible: 990,
    exposed: 10,
    infectious: 0,
    recovered: 0
  };

  constructor(
    public seirService: SeirSimulationService,
  ) {}

  ngOnInit(): void {
    this.initialState = { ...this.seirService.resetSimulation() };
  }

  toggleSimulationView(): void {
    this.simulationView = this.simulationView === 'chart-view' ? "map-view" : 'chart-view';
  }

  startSimulation(): void {
    this.isSimulationRunning = true;
    this.isSimulationPaused = false;

    this.beta = this.seirService.params.beta;
    this.sigma  = this.seirService.params.sigma; 
    this.gamma = this.seirService.params.gamma; 

    this.updateParameters();
  
    if (!this._simulationSubscription) {
      this._simulationSubscription = this.seirService.simulation$.subscribe(state => {
        this.chartData.datasets[0].data.push(state.susceptible);
        this.chartData.datasets[1].data.push(state.exposed);
        this.chartData.datasets[2].data.push(state.infectious);
        this.chartData.datasets[3].data.push(state.recovered);
        this.chartData.labels!.push(this.chartData.labels!.length + 1);
        this.chartView?.updateChart();
      });
    }
  
    if (!this._simulationIntervalSubscription) {
      this._simulationIntervalSubscription = interval(100)
        .subscribe(() => this.seirService.simulateStep());
    }
  }
  updateParameters(): void {
    this.seirService.setParameters({
      beta: this.beta,
      sigma: this.sigma,
      gamma: this.gamma,
    });
    console.log(this.seirService.params)
  }

  stopSimulation(): void {
    this.isSimulationPaused = true;
    this._simulationIntervalSubscription?.unsubscribe();
    this._simulationIntervalSubscription = undefined;
  }

  resetSimulation(): void {
    this.isSimulationRunning = false;
    this.isSimulationPaused = false;
  
    this._simulationIntervalSubscription?.unsubscribe();
    this._simulationIntervalSubscription = undefined;
  
    this._simulationSubscription?.unsubscribe();
    this._simulationSubscription = undefined;
  
    this.seirService.setRandomParameters();
    this.seirService.resetSimulation();
  
    this.chartData.labels = [];
    this.chartData.datasets.forEach(dataset => dataset.data = []);
    this.chartView?.updateChart();
  }
  
  ngOnDestroy(): void {
    this._simulationSubscription?.unsubscribe();
    this._simulationIntervalSubscription?.unsubscribe();
  }
}