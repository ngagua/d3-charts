import { Component, ElementRef, Input, OnChanges, OnInit } from '@angular/core'
import {
    Department,
    MappedForGroupedData,
    USSpendingDataElement,
} from '../../models/models'
import * as d3 from 'd3'

@Component({
    selector: 'grouped-bar-chart',
    standalone: true,
    imports: [],
    template: ` <svg></svg>`,
    styleUrl: './grouped-bar-chart.component.scss',
})
export class GroupedBarChartComponent implements OnInit, OnChanges {
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

    ngOnInit(): void {
        this.svg = this.host.select('svg')
        this.setDimensions()
        this.setElements()
        this.updateChart()
    }

    updateChart() {
        this.setParams()
        this.setXAxes()
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
            .text('US Spending by Department.')
            .attr(
                'transform',
                `translate(${this.left + 0.5 * this.innerWidth}, ${this.top - 5})`
            )
            .attr('text-anchor', 'middle')
            .attr('font-size', '1.5rem')
            .attr('font-weight', 'bold')
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
        this.draw()
    }

    setParams(): void {
        if (!this.data) return
        const ids = this.data?.map((d) => d?.year + '')

        const maxValue = d3.max(this.data, (d) => d3.max(d.data, (e) => e.expense))

        this.x.domain(ids).range([0, this.innerWidth])
        this.y.domain([0, maxValue as number]).range([this.innerHeight, 0])

        const colorDomain = this.selected
        const colorRange = d3.schemeCategory10
        this.colors = d3.scaleOrdinal().domain(colorDomain).range(colorRange)
    }

    setXAxes(): void {
        const updateXAxis = (xAxisContainer: any) => {
            xAxisContainer.call(this.xAxes)

            xAxisContainer
                .selectAll('.tick text')
                .text((d: string) => d)
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

    draw(): void {
        const bars = this.dataContainer
            .selectAll('rect')
            .data(this.data, (d: any) => d?.year)

        bars.enter()
            .append('g')
            .attr('class', 'bar-group')
            .selectAll('rect')
            .data((d: any) => d.data.sort((a: any, b: any) => b.expense - a.expense))
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .on('mouseover', (event: MouseEvent, d: any) => {
                this.setToolTip(event, d)
            })
            .attr('x', (d: any) => this.x(d.year))
            .attr('y', (d: any) => this.y(d.expense))
            .attr('width', this.x.bandwidth())
            .attr('height', (d: any) => this.innerHeight - this.y(d.expense))
            .attr('fill', (d: any) => this.colors(d.department))

        bars.exit().remove()
    }

    setToolTip(event: MouseEvent, data: USSpendingDataElement) {
        const tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`)
        tooltip.html(
            `
                <p><strong>Department:</strong> ${data.department}</p>
                <p><strong>Spending:</strong> ${d3.format('$,.0f')(+data.expense)}</p>
                <p><strong>Year:</strong> ${data.year}</p>`
        )
        d3.select(event.target as any).on('mouseout', () => tooltip.remove())
    }
}
