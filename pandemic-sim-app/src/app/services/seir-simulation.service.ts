import { Injectable } from '@angular/core';
import { SEIRModel, SEIRParameters } from '../models/seir.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeirSimulationService {
  private state: SEIRModel;
  public params!: SEIRParameters;

  private _simulationSubject = new BehaviorSubject<SEIRModel>({
    susceptible: 990,
    exposed: 10,
    infectious: 0,
    recovered: 0
  });

  constructor() {
    this.state = { susceptible: 990, exposed: 10, infectious: 0, recovered: 0 };
    this.setRandomParameters();
  }

  get simulation$(): Observable<SEIRModel> {
    return this._simulationSubject.asObservable();
  }

  public setParameters(params: SEIRParameters): void {
    this.params = params;
  }
  public resetSimulation(): SEIRModel {
    this.state = { susceptible: 990, exposed: 10, infectious: 0, recovered: 0 };
    this._simulationSubject.next(this.state);
    return this.state;
  }
  
  simulateStep(): void {
    const { susceptible, exposed, infectious, recovered } = this.state;
    const { beta, sigma, gamma } = this.params;

    const newExposed = beta * susceptible * infectious / 1000;
    const newInfectious = sigma * exposed;
    const newRecovered = gamma * infectious;

    this.state = {
      susceptible: susceptible - newExposed,
      exposed: exposed + newExposed - newInfectious,
      infectious: infectious + newInfectious - newRecovered,
      recovered: recovered + newRecovered
    };

    this._simulationSubject.next(this.state);
    
  }
  private getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  
  public setRandomParameters(): void {
    this.params = {
      beta: this.getRandomInRange(0.1, 0.5),
      sigma: this.getRandomInRange(0.05, 0.2),
      gamma: this.getRandomInRange(0.02, 0.1),
    };
  }
}