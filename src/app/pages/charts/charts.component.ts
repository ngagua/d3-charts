import { Component, inject, OnInit } from '@angular/core'
import { AsyncPipe, NgIf } from '@angular/common'
import { BarChartComponent } from '../../charts/bar-chart/bar-chart.component'
import { ChartComponent } from '../../charts/chart/chart.component'
import { LineChartComponent } from '../../charts/line-chart/line-chart.component'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatOptionModule } from '@angular/material/core'
import { MatSelectChange, MatSelectModule } from '@angular/material/select'
import { ApiService } from '../../services/api.service'
import * as d3 from 'd3'
import {
    Browser,
    MappedForGroupedData,
    MappedForLineChart,
    PieData,
    USSpendingData,
    USSpendingDataElement,
} from '../../models/models'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { convert, mapDataToInterfaces } from '../../helpers/helper'
import { PieChartComponent } from '../../charts/pie-chart/pie-chart.component'
import { Router } from '@angular/router'
import { URLS } from '../../models/enum'
import { GroupedBarChartComponent } from '../../charts/grouped-bar-chart/grouped-bar-chart.component'

@Component({
    selector: 'app-charts',
    standalone: true,
    imports: [
        AsyncPipe,
        BarChartComponent,
        ChartComponent,
        LineChartComponent,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        PieChartComponent,
        NgIf,
        GroupedBarChartComponent,
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
    usSpending$ = this.apiService.getSpending().pipe(takeUntilDestroyed())
    usSpending: USSpendingData[] = []
    mappedData: USSpendingDataElement[] = []
    mappedForBar: USSpendingDataElement[] = []
    mappedForGrouped: MappedForGroupedData[] = []
    mappedForLine: MappedForLineChart[] = []
    years: string[] = []
    departments: string[] = []

    ngOnInit(): void {
        this.usSpending$.subscribe((data: USSpendingData[]) => {
            this.usSpending = data
            this.mappedData = this.mapUSSpendingData(data)
            this.years = [...new Set(this.mappedData.map((item) => item.year))]
            this.departments = [
                ...new Set(this.mappedData.map((item) => item.department)),
            ]
            this.filterByYear(this.years[0])
            this.filterByDepartment(this.departments[0])
            this.mappedForGrouped = mapDataToInterfaces(this.mappedData)

            this.mappedForLine = this.mappedData.reduce((acc: any, curr) => {
                const existingYear: any = acc.find((item: any) => item.year === curr.year)

                if (existingYear) {
                    existingYear[curr.department] =
                        (existingYear[curr.department] || 0) + curr.expense
                } else {
                    const newObj: any = { year: curr.year }
                    newObj[curr.department] = curr.expense
                    acc.push(newObj)
                }

                return acc
            }, [])
        })
    }

    setPieData(event: MatSelectChange | string): void {
        const valueAttr = typeof event === 'string' ? event : event.value
        this.pieData = convert(
            this.browserData,
            'Browser market shares. ',
            valueAttr,
            'name',
            'name'
        )
    }

    filterByYear(event: MatSelectChange | string): void {
        const valueAttr = typeof event === 'string' ? event : event.value
        const filteredData = this.mappedData.filter((item) => item.year === valueAttr)

        this.pieData = convert(
            filteredData,
            'US Spending by Department. ',
            'expense',
            'department',
            'department'
        )
    }

    filterByDepartment(event: MatSelectChange | string): void {
        const valueAttr = typeof event === 'string' ? event : event.value
        this.mappedForBar = this.mappedData.filter(
            (item) => item.department === valueAttr
        )
    }

    mapUSSpendingData(data: USSpendingData[]): USSpendingDataElement[] {
        const mappedData: USSpendingDataElement[] = []

        data.forEach((item) => {
            const department = item['Department']

            Object.keys(item).forEach((key) => {
                if (key !== 'Department') {
                    const year = key
                    const expense = item[key]
                    mappedData.push({
                        department,
                        year,
                        expense: +expense,
                    })
                }
            })
        })

        return mappedData
    }
}
