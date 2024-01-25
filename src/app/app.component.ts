import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterOutlet } from '@angular/router'
import * as d3 from 'd3'
import { ChartComponent } from './charts/chart/chart.component'
import { Chart2Component } from './charts/chart2/chart2.component'
import { ApiService } from './services/api.service'
import { HttpClientModule } from '@angular/common/http'
import { LineChartComponent } from './charts/line-chart/line-chart.component'
import { PieChartComponent } from './charts/pie-chart/pie-chart.component'
import { Browser, PieData } from './models/models'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatSelectChange, MatSelectModule } from '@angular/material/select'
import { PieHelper } from './helpers/helper'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        ChartComponent,
        Chart2Component,
        HttpClientModule,
        LineChartComponent,
        PieChartComponent,
        MatInputModule,
        MatSelectModule,
    ],
    providers: [ApiService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    apiService = inject(ApiService)
    test = d3.selector('body')
    data = [125, 100, 50, 75, 300, 200]
    browserData: Browser[] = []
    pieData: PieData = {
        title: '',
        data: [],
    }
    data$ = this.apiService.getEmployees()
    covidData$ = this.apiService.getCovidData()
    browserData$ = this.apiService.getBrowsers().pipe(takeUntilDestroyed())

    ngOnInit(): void {
        this.browserData$.subscribe((data) => {
            this.browserData = data
            this.setPieData('now')
        })
    }

    setPieData(event: MatSelectChange | string): void {
        const valueAttr = typeof event === 'string' ? event : event.value
        this.pieData = PieHelper.convert(
            this.browserData,
            'Browser market shares. ',
            valueAttr,
            'name',
            'name'
        )
    }
}
