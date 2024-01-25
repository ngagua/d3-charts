import { Component, inject, OnInit } from '@angular/core'
import { AsyncPipe, NgIf } from '@angular/common'
import { Chart2Component } from '../../charts/chart2/chart2.component'
import { ChartComponent } from '../../charts/chart/chart.component'
import { LineChartComponent } from '../../charts/line-chart/line-chart.component'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatOptionModule } from '@angular/material/core'
import { MatSelectChange, MatSelectModule } from '@angular/material/select'
import { ApiService } from '../../services/api.service'
import * as d3 from 'd3'
import { Browser, PieData } from '../../models/models'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { PieHelper } from '../../helpers/helper'
import { PieChartComponent } from '../../charts/pie-chart/pie-chart.component'
import { Router } from '@angular/router'
import { URLS } from '../../models/enum'

@Component({
    selector: 'app-charts',
    standalone: true,
    imports: [
        AsyncPipe,
        Chart2Component,
        ChartComponent,
        LineChartComponent,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        PieChartComponent,
        NgIf,
    ],
    providers: [ApiService],
    templateUrl: './charts.component.html',
    styleUrl: './charts.component.scss',
})
export class ChartsComponent implements OnInit {
    router = inject(Router)
    apiService = inject(ApiService)
    test = d3.selector('body')
    data = [125, 100, 50, 75, 300, 200]
    url = this.router.url.split('/charts/')[1]
    browserData: Browser[] = []
    pieData: PieData = {
        title: '',
        data: [],
    }
    urls = URLS
    data$ = this.apiService.getEmployees()
    covidData$ = this.apiService.getCovidData()
    browserData$ = this.apiService.getBrowsers().pipe(takeUntilDestroyed())

    ngOnInit(): void {
        console.log(this.url)
        this.browserData$.subscribe((data: Browser[]) => {
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
