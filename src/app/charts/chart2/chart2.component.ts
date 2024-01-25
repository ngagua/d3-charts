import { Component, ElementRef, Input, OnChanges, OnInit } from '@angular/core'
import * as d3 from 'd3'
import { Employee } from '../../models/models'

@Component({
    selector: 'app-chart2',
    standalone: true,
    template: ` <svg></svg>`,
    styleUrl: './chart2.component.scss',
    imports: [],
})
export class Chart2Component implements OnInit, OnChanges {
    @Input() data: Employee[] | null | undefined
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
    sortedBySalary = true
    x = d3.scaleBand().paddingInner(0.2).paddingOuter(0.2)
    y = d3.scaleLinear()

    constructor(element: ElementRef) {
        this.host = d3.select(element.nativeElement)
    }

    get barsData() {
        // return this.dataIsFiltered
        //     ? this.data?.filter((d: Employee, i) => i < 12)
        //     : this.data

        return this.sortedBySalary
            ? this.data?.sort(
                  (a: Employee, b: Employee) => +b.employee_salary - +a.employee_salary
              )
            : this.data?.sort((a: Employee, b: Employee) =>
                  a.employee_name.localeCompare(b.employee_name)
              )
    }

    ngOnInit(): void {
        this.svg = this.host.select('svg').on('click', () => {
            this.dataChanged()
        })
        this.setDimensions()
        this.setElements()
    }

    dataChanged() {
        this.dataIsFiltered = !this.dataIsFiltered
        this.sortedBySalary = !this.sortedBySalary
        this.updateChart()
    }

    updateChart() {
        this.setParams()
        this.setXAxes()
        this.setLabels()
        this.draw()
    }

    setElements(): void {
        this.xAxesContainer = this.svg
            .append('g')
            .attr('class', 'xAxis-container')
            .attr('transform', `translate(${this.left}, ${this.top + this.innerHeight})`)

        this.yAxesContainer = this.svg
            .append('g')
            .attr('class', 'yAxis-container')
            .attr('transform', `translate(${this.left}, ${this.top})`)
        this.dataContainer = this.svg
            .append('g')
            .attr('class', 'data-container')
            .attr('transform', `translate(${this.left}, ${this.top})`)

        this.svg
            .append('g')
            .attr('class', 'title-container')
            .attr('transform', `translate(15, ${this.top - 5})`)
            .append('text')
            .attr('class', 'label')
            .text('Employee Salary')
            .attr(
                'transform',
                `translate(${this.left + 0.5 * this.innerWidth}, ${this.top - 5})`
            )
            .attr('text-anchor', 'middle')
    }

    setDimensions(): void {
        this.dimensions = this.svg.node().getBoundingClientRect()
        this.innerWidth = this.dimensions.width - this.left - this.right
        this.innerHeight = this.dimensions.height - this.top - this.bottom
    }

    ngOnChanges(): void {
        if (!this.svg) return
        this.setParams()
        this.setXAxes()
        this.setLabels()
        this.draw()
    }

    setLabels(): void {
        // this.xAxesContainer
        //     .selectAll('.tick text')
        //     .text((d: string) => {
        //         return this.getEmployeeName(d)
        //     })
        //     .attr('transform', 'translate(-9, 2)rotate(-45)')
        //     .attr('text-anchor', 'end')
    }

    setParams(): void {
        if (!this.barsData || !this.data) return
        const ids = this.barsData?.map((d: Employee) => d?.id)
        const max_salary =
            1.3 * Math.max(...this.data?.map((d: Employee) => d?.employee_salary))

        this.x.domain(ids).range([0, this.innerWidth])
        this.y.domain([0, max_salary]).range([this.innerHeight, 0])
    }

    draw(): void {
        const bars = this.dataContainer
            .selectAll('rect')
            .data(this.barsData || [], (d: Employee) => d?.id)

        bars.enter()
            .append('rect')
            .merge(bars)
            .transition()
            .duration(500)
            .attr('x', (d: Employee, i: number) => this.x(d?.id))
            .attr('width', this.x.bandwidth())
            .attr(
                'height',
                (d: Employee) => this.innerHeight - this.y(d?.employee_salary)
            )
            .style('fill', 'blue')
            .attr('y', (d: Employee) => this.y(d?.employee_salary))

        bars.exit().remove()
    }

    setXAxes(): void {
        const updateXAxis = (xAxisContainer: any) => {
            xAxisContainer.call(this.xAxes)

            xAxisContainer
                .selectAll('.tick text')
                .text((d: string) => this.getEmployeeName(d))
                .attr('transform', 'translate(-9, 2)rotate(-45)')
                .attr('text-anchor', 'end')
        }
        this.xAxes = d3.axisBottom(this.x).tickSizeOuter(0)
        this.xAxesContainer.transition().duration(500).call(updateXAxis)

        this.yAxes = d3
            .axisLeft(this.y)
            .tickSizeOuter(0)
            .tickSizeInner(-this.innerWidth)
            .tickFormat(d3.format('$~s'))
        this.yAxesContainer.call(this.yAxes)

        this.yAxesContainer.selectAll('.tick line').attr('stroke', '#ddd')
    }

    getEmployeeName(id: string) {
        return this.data?.find((d: Employee) => d.id === id)?.employee_name
    }
}
