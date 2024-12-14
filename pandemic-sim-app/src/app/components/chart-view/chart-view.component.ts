import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './chart-view.component.html',
  styleUrl: './chart-view.component.css'
})
export class ChartViewComponent {
  @Input() chartData!: ChartData<'line'>;
  @Input() chartOptions!: ChartConfiguration<'line'>['options'];

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  updateChart(): void {
    this.chart?.update();
  }
}
