import { Component, ElementRef, Input } from '@angular/core'
import { Department, MappedForGroupedData } from '../../models/models'
import * as d3 from 'd3'

@Component({
    selector: 'grouped-bar-chart',
    standalone: true,
    imports: [],
    templateUrl: './grouped-bar-chart.component.html',
    styleUrl: './grouped-bar-chart.component.scss',
})
export class GroupedBarChartComponent {
    @Input() data: MappedForGroupedData[] | null | undefined
    host: any
    svg: any
    dataContainer: any
    xAxesContainer: any
    yAxesContainer: any
    xAxes: any
    yAxes: any

    rectWidth = 20
    padding = 3
    dimensions!: DOMRect
    innerWidth = 0
    innerHeight = 0

    left = 60
    right = 20
    bottom = 80
    top = 15
    dataIsFiltered = false
    sortedBySalary = false
    colors: any
    selected = [
        Department.DepartmentOfDefenseMilitaryPrograms,
        Department.DepartmentOfEducation,
        Department.DepartmentOfHealthAndHumanServices,
        Department.DepartmentOfHomelandSecurity,
    ]
    x = d3.scaleBand().paddingInner(0.2).paddingOuter(0.2)
    y = d3.scaleLinear()

    constructor(element: ElementRef) {
        this.host = d3.select(element.nativeElement)
    }
}
