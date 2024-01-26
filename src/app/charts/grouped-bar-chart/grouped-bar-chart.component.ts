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
    @Input() chartData: USSpendingDataElement[] | null | undefined
    @Input() stacked = true

    data: MappedForGroupedData[] = []
    host: any
    svg: any
    dataContainer: any
    xAxesContainer: any
    yAxesContainer: any
    legendContainer: any
    xAxes: any
    yAxes: any

    rectWidth = 20
    padding = 3
    dimensions!: DOMRect
    innerWidth = 0
    innerHeight = 0

    left = 60
    right = 20
    bottom = 120
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
    active = [true, true, true, true]
    xScale = d3.scaleBand().paddingInner(0.2).paddingOuter(0.2)
    yScale = d3.scaleLinear()
    group = d3.scaleBand().padding(0.1)

    constructor(element: ElementRef) {
        this.host = d3.select(element.nativeElement)
    }

    get filteredData() {
        const data = this.data?.map((d) => ({
            year: d.year,
            data: d.data.filter((item, i) => {
                const index = this.selected.indexOf(item.department as Department)
                return index !== -1 && this.active[index]
            }),
        }))

        return this.stacked ? data : data?.slice(-5)
    }

    ngOnInit(): void {
        this.svg = this.host.select('svg')
        this.setDimensions()
        this.setElements()
        this.updateChart()
    }

    ngOnChanges(): void {
        this.data = d3
            .groups(this.chartData || [], (d) => d.year)
            .map((element) => ({
                year: +element[0],
                data: element[1],
            }))
        if (!this.svg) return
        this.setParams()
        this.setXAxes()
        this.draw()
    }

    updateChart() {
        this.setParams()
        this.setXAxes()
        this.setLegend()
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

        this.legendContainer = this.svg
            .append('g')
            .attr('class', 'legend-container')
            .attr(
                'transform',
                `translate(${this.left}, ${this.dimensions.height - 0.5 * this.bottom + 10})`
            )
    }

    setDimensions(): void {
        this.dimensions = this.svg.node().getBoundingClientRect()
        this.innerWidth = this.dimensions.width - this.left - this.right
        this.innerHeight = this.dimensions.height - this.top - this.bottom
    }

    setParams(): void {
        if (!this.filteredData) return
        const ids = this.filteredData?.map((d) => d?.year + '')

        const maxValue = d3.max(this.filteredData, (d) =>
            d3.max(d.data, (e) => e.expense)
        )

        this.xScale.domain(ids).range([0, this.innerWidth])
        this.yScale.domain([0, maxValue as number]).range([this.innerHeight, 0])

        const groups = [...new Set(this.chartData?.map((d) => d.department))]
        this.group.domain(groups).range([0, this.xScale.bandwidth()])

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
                .attr('text-anchor', 'end')

            if (this.stacked)
                xAxisContainer
                    .selectAll('.tick text')
                    .attr('transform', 'translate(-9, 2)rotate(-45)')
        }
        this.xAxes = d3.axisBottom(this.xScale).tickSizeOuter(0)
        this.xAxesContainer.transition().duration(500).call(updateXAxis)

        this.yAxes = d3
            .axisLeft(this.yScale)
            .tickSizeOuter(0)
            .tickSizeInner(-this.innerWidth)
            .tickFormat(d3.format('$~s'))
        this.yAxesContainer.call(this.yAxes)

        this.yAxesContainer.selectAll('.tick line').attr('stroke', '#ddd')
    }

    draw(): void {
        this.dataContainer.selectAll('g.group').remove()
        const bars = this.dataContainer
            .selectAll('g.group')
            .data(this.filteredData, (d: any) => d?.year)

        if (this.stacked) {
            console.log(this.filteredData)
            bars.enter()
                .append('g')
                .data(this.filteredData, (d: any) => d?.year)
                .attr('class', 'group')
                .selectAll('rect')
                .data((d: any) => d.data.sort((a: any, b: any) => b.expense - a.expense))
                .attr('padding', 10)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .on('mouseover', (event: MouseEvent, d: any) => {
                    this.setToolTip(event, d)
                })
                .attr('x', (d: any) => this.xScale(d.year))
                .attr('y', (d: any) => this.yScale(d.expense))
                .attr('width', this.xScale.bandwidth())
                .attr('height', (d: any) => this.innerHeight - this.yScale(d.expense))
                .attr('fill', (d: any) => this.colors(d.department))
        } else {
            bars.enter()
                .selectAll('g.group')
                .data(this.filteredData?.map((d) => d.year))
                .join('g')
                .attr('class', 'group')
                .selectAll('rect.data')
                .data((d: number) =>
                    this.filteredData
                        ?.find((e) => e.year === d)
                        ?.data.sort((a, b) => (b.expense < a.expense ? 1 : -1))
                )
                .join('rect')
                // .transition()
                // .duration(500)
                .attr('x', (d: USSpendingDataElement) => {
                    return (this.xScale(d.year) as any) + this.group(d.department)
                })
                .attr('width', this.group.bandwidth())
                .attr('y', (d: any) => this.yScale(Number(d.expense)))
                .attr('height', (d: any) => this.innerHeight - this.yScale(d.expense))
                .attr('fill', (d: any) => this.colors(d.department))
                .on('mouseover', (event: MouseEvent, d: any) => {
                    this.setToolTip(event, d)
                })
        }

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
            .attr('cursor', 'pointer')
            .on('mouseenter', (event: any, name: string) => {
                this.hover(name)
            })
            .on('mouseleave', (event: any, name: string) => {
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

    toggleActive(selected: string): void {
        const index = this.selected.indexOf(selected as Department)
        this.active[index] = !this.active[index]
    }

    hover(selected?: string): void {
        const index = this.selected.indexOf((selected as Department) || '')

        if (selected) {
            this.dataContainer
                .selectAll('rect')
                .style('opacity', (d: USSpendingDataElement) => {
                    return d.department === selected ? 1 : 0.1
                })
        } else {
            this.dataContainer.selectAll('rect').style('opacity', 1)
        }
    }
}
