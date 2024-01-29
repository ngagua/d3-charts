import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core'
import * as d3 from 'd3'
import { Department, MappedForLineChart } from '../../models/models'

@Component({
    selector: 'line-chart',
    standalone: true,
    template: ` <svg></svg>`,
    styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnInit, OnChanges {
    @Input() data: MappedForLineChart[] | null | undefined
    host: any
    svg: any
    legendContainer: any
    dataContainer: any
    xAxesContainer: any
    yAxesContainer: any
    xAxes: any
    yAxes: any
    title: any
    line: any

    dimensions!: DOMRect
    innerWidth = 0
    innerHeight = 0

    left = 90
    right = 20
    top = 60
    bottom = 120

    xScale: any
    yScale: any
    colors: any

    timeParse = d3.timeParse('%Y')
    niceData = d3.timeFormat('%Y-%B')

    selected = [
        Department.DepartmentOfDefenseMilitaryPrograms,
        Department.DepartmentOfEducation,
        Department.DepartmentOfHealthAndHumanServices,
        Department.DepartmentOfHomelandSecurity,
    ]
    active = [true, true, true, true]

    constructor(private elementRef: ElementRef) {
        this.host = d3.select(this.elementRef.nativeElement)
    }

    get lineData(): any {
        if (!this.data) return []
        return this.selected
            ?.filter((d, i) => this.active[i])
            ?.map((d) => ({
                name: d,
                data: this.data
                    ?.map((p) => ({
                        x: p.year,
                        y: p[d as keyof MappedForLineChart],
                        department: d,
                    }))
                    ?.filter((d) => d.y !== null)
                    ?.sort((a, b) => (a.x && b.x && a.x < b.x ? -1 : 1)),
            }))
    }

    ngOnInit(): void {
        this.svg = this.host.select('svg')
        this.setDimensions()
        this.setElements()
        this.updateChart()
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.svg) return
        this.updateChart()
    }

    setDimensions(): void {
        this.dimensions = this.svg.node().getBoundingClientRect()

        this.innerWidth = this.dimensions.width - this.left - this.right
        this.innerHeight = this.dimensions.height - this.top - this.bottom

        this.svg.attr('viewBox', [0, 0, this.dimensions.width, this.dimensions.height])
    }

    setElements(): void {
        this.xAxesContainer = this.svg
            .append('g')
            .attr('class', 'x-axes-container')
            .attr('transform', `translate(${this.left}, ${this.top + this.innerHeight})`)

        this.yAxesContainer = this.svg
            .append('g')
            .attr('class', 'y-axes-container')
            .attr('transform', `translate(${this.left}, ${this.top})`)

        this.title = this.svg
            .append('g')
            .attr('class', 'title-container')

            .append('text')
            .attr('class', 'label')
            .attr('font-size', '1.5rem')
            .attr('font-weight', 'bold')
            .style('text-anchor', 'middle')
            .style('text-anchor', 'middle')

        this.dataContainer = this.svg
            .append('g')
            .attr('class', 'data-container')
            .attr('transform', `translate(${this.left}, ${this.top})`)

        this.legendContainer = this.svg
            .append('g')
            .attr('class', 'legend-container')
            .attr(
                'transform',
                `translate(${this.left}, ${this.dimensions.height - 0.5 * this.bottom + 10})`
            )

        const titleWidth = this.title.node().getBBox()
        this.title.attr(
            'transform',
            `translate(${this.left + 0.5 * this.innerWidth}, ${this.top - 15})`
        )
    }

    setParams(): void {
        const data = this.lineData
        const parsedDates = !this.data ? [] : this.data?.map((d) => +d.year)

        const maxValues = data?.map((series: any) => d3.max(series.data, (d: any) => d.y))

        //domains
        const xDomain = !!parsedDates ? (d3.extent(parsedDates) as any) : [0, 2022]
        const yDomain = !this.data ? [0, 100] : [0, d3.max(maxValues) as any]
        const colorDomain = this.selected

        //ranges
        const xRange = [0, this.innerWidth]
        const yRange = [this.innerHeight, 0]
        const colorRange = d3.schemeCategory10

        //scales
        this.xScale = d3.scaleLinear().domain(xDomain).range(xRange)
        this.yScale = d3.scaleLinear().domain(yDomain).range(yRange)
        this.colors = d3.scaleOrdinal().domain(colorDomain).range(colorRange)

        this.line = d3
            .line()
            .x((d: any) => this.xScale(d.x))
            .y((d: any) => this.yScale(+d.y))
    }

    setLabels(): void {
        this.title.text('US Spending by Department.')
    }

    setAxes(): void {
        this.xAxes = d3
            .axisBottom(this.xScale)
            .tickFormat(d3.format('') as any)
            .tickSizeOuter(0)

        this.xAxesContainer.transition().duration(500).call(this.xAxes)

        this.yAxes = d3
            .axisLeft(this.yScale)
            .ticks(8)
            .tickSizeOuter(0)
            .tickFormat((d) => (+d > 0 ? `${d3.format('$,.0f')(+d / 10e5)} M` : '0'))
            .tickSizeInner(-this.innerWidth)

        this.yAxesContainer.transition().duration(500).call(this.yAxes)

        this.yAxesContainer
            .selectAll('.tick:not(:nth-child(2)) line')
            .style('stroke', '#ddd')
            .style('stroke-dasharray', '2,2')
    }

    setLegend(): void {
        const generatedLegendItems = (selection: any) => {
            selection
                .append('circle')
                .attr('class', 'legend-icon')
                .attr('cx', 3)
                .attr('cy', -4)
                .attr('r', 3)
            selection
                .append('text')
                .attr('class', 'legend-label')
                .attr('x', 9)
                .style('font-size', '0.8rem')
        }

        const updateLegendItems = (selection: any) => {
            selection
                .selectAll('circle.legend-icon')
                .style('fill', (d: any) => this.colors(d))

            selection.selectAll('text.legend-label').text((d: any) => d)
        }

        const legend = this.legendContainer.selectAll('g.legend-item').data(this.selected)

        legend
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .call(generatedLegendItems)
            .merge(legend)
            .call(updateLegendItems)
            .attr('transform', (d: any, i: any) => `translate(0, ${i * 16})`)
            .on('mouseover', (event: any, name: string) => {
                this.hover(name)
            })
            .on('mouseleave', () => {
                this.hover()
            })
            .on('click', (event: any, name: string) => {
                this.toggleActive(name)
                this.updateChart()
            })
            .transition()
            .duration(500)
            .style('cursor', 'pointer')
            .style('opacity', (d: any, i: any) => (this.active[i] ? 1 : 0.3))

        legend.exit().remove()

        const legendWidth = this.legendContainer.node().getBBox().width
        const legendHeight = this.legendContainer.node().getBBox().height

        this.legendContainer.attr(
            'transform',
            `translate(${this.left + 0.5 * (this.innerWidth - legendWidth)}, ${this.dimensions.height - legendHeight})`
        )
    }

    draw(): void {
        const lines = this.dataContainer
            .selectAll('path.data')
            .data(this.lineData, (d: any) => d.name)

        lines
            .enter()
            .append('path')
            .attr('class', 'data')
            .style('fill', 'none')
            .style('stroke-width', 2)
            .merge(lines)
            .transition()
            .duration(500)
            .attr('d', (d: any) => this.line(d.data))
            .style('stroke', (d: any) => this.colors(d.name))

        lines.exit().remove()
        this.drawCircles()
    }

    drawCircles(): void {
        this.dataContainer.selectAll('g.data-circle').remove()

        const circles = this.dataContainer
            .selectAll('g.data-circle')
            .data(this.lineData, (d: any) => d.name)

        circles
            .enter()
            .append('g')
            .attr('class', 'data-circle')
            .style('fill', (d: any) => this.colors(d.name))
            .merge(circles)
            .selectAll('circle')
            .data((d: any) => d.data)
            .enter()
            .append('circle')
            .attr('cx', (d: any) => this.xScale(d.x))
            .attr('cy', (d: any) => this.yScale(d.y))
            .attr('r', 4)
            .on('mouseover', (event: MouseEvent, d: any) => {
                this.setToolTip(event, d)
            })

        circles.exit().remove()
    }

    setToolTip(event: MouseEvent, data: any): void {
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
                <p><strong>Spending:</strong> ${d3.format('$,.0f')(+data.y)}</p>
                <p><strong>Year:</strong> ${data.x}</p>`
        )
        d3.select(event.target as any).on('mouseout', () => tooltip.remove())
    }

    updateChart(): void {
        this.setParams()
        this.setLabels()
        this.setAxes()
        this.setLegend()
        this.draw()
    }

    toggleActive(selected: string): void {
        const index = this.selected.indexOf(selected as Department)
        this.active[index] = !this.active[index]
        this.drawCircles()
    }

    hover(selected?: string): void {
        const index = this.selected.indexOf((selected as Department) || '')
        if (selected && this.active[index]) {
            this.dataContainer
                .selectAll('path.data')
                .style('opacity', (d: any) => {
                    return d.name === selected ? 1 : 0.3
                })
                .style('stroke-width', (d: any) => {
                    return d.name === selected ? '3px' : '2px'
                })
        } else {
            this.dataContainer.selectAll('path.data').style('opacity', 1)
        }
    }
}
