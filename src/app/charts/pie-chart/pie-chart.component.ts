import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core'
import * as d3 from 'd3'
import { PieConfig, PieData, PieDataElement } from '../../models/models'

@Component({
    selector: 'app-pie-chart',
    standalone: true,
    imports: [],
    template: ` <svg></svg>`,
    styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent implements OnInit, OnChanges {
    @Input() data: PieData | null | undefined

    config: PieConfig = {
        innerRadiusCoef: 0.65,
        hiddenOpacity: 0.3,
        legendItem: {
            symbolSize: 10,
            height: 20,
            fontSize: 12,
            textSeparator: 15,
        },
        transition: 800,
        arcs: {
            stroke: '#fff',
            strokeWidth: 2,
            radius: 6,
            padAngle: 0.02,
        },
        margins: {
            left: 10,
            top: 100,
            right: 400,
            bottom: 10,
        },
    }
    host: any
    svg: any

    //containers
    legendContainer: any
    dataContainer: any

    //fun
    title: any
    pie: any
    arc: any

    //scales
    colors: any

    //state
    hiddenIds = new Map()

    //dimensions
    dimensions!: DOMRect
    innerWidth = 0
    innerHeight = 0

    radius: any
    innerRadius: any
    line: any
    _previous = ''
    arcTween: any

    constructor(private elementRef: ElementRef) {
        this.host = d3.select(this.elementRef.nativeElement)
    }

    get margins() {
        return this.config.margins
    }

    get ids() {
        return this.data?.data.map((d) => String(d.id)) || []
    }

    get pieData() {
        return this.pie(this.data?.data.filter((e) => !this.hiddenIds.has(e.id))) || []
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

        this.innerWidth = this.dimensions.width - this.margins.left - this.margins.right
        this.innerHeight = this.dimensions.height - this.margins.top - this.margins.bottom

        this.radius = Math.min(this.innerWidth, this.innerHeight) / 2
        this.innerRadius = this.radius * this.config.innerRadiusCoef

        this.svg.attr('viewBox', [0, 0, this.dimensions.width, this.dimensions.height])
    }

    setElements(): void {
        this.dataContainer = this.svg
            .append('g')
            .attr('class', 'data-container')
            .attr(
                'transform',
                `translate(${this.margins.left + 0.5 * this.dimensions.width}, ${this.margins.top + 0.5 * this.innerHeight})`
            )

        this.legendContainer = this.svg
            .append('g')
            .attr('class', 'legend-container')
            .attr(
                'transform',
                `translate(${this.innerWidth - 0.5 * this.margins.right}, ${this.margins.top + 0.5 * this.innerHeight})`
            )

        this.title = this.svg
            .append('g')
            .attr('class', 'title-container')
            .attr(
                'transform',
                `translate(${0.5 * this.dimensions.width}, ${this.margins.top * 0.5})`
            )
            .append('text')
            .attr('class', 'title')
            .attr('font-size', '1.5rem')
            .attr('font-weight', 'bold')
            .style('text-anchor', 'middle')
    }

    setParams(): void {
        this.arc = d3
            .arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.radius)
            .padAngle(this.config.arcs.padAngle)
            .cornerRadius(this.config.arcs.radius)

        this.pie = d3
            .pie()
            .sort(null)
            .value((d: any) => d.value)

        this.colors = d3.scaleOrdinal(d3.schemeCategory10).domain(this.ids)

        const chart = this

        this.arcTween = function (d: any) {
            const current = d
            const previous = this._previous
            const interpolate = d3.interpolate(previous, current)
            this._previous = current
            return function (t: any) {
                return chart.arc(interpolate(t))
            }
        }
    }

    setLabels(): void {
        this.title.text(this.data?.title || '')
    }

    setLegend(): void {
        const data = this.data?.data
        this.legendContainer
            .selectAll('g.legend-item')
            .data(data, (d: any) => d.id)
            .join('g')
            .attr('class', 'legend-item')
            .attr(
                'transform',
                (d: any, i: any) => `translate(0, ${i * this.config.legendItem.height})`
            )
            .style('opacity', (d: any) =>
                this.hiddenIds.has(d.id) ? this.config.hiddenOpacity : null
            )
            .on('mouseenter', (event: any, d: any) => this.sethHighlights(d.id))
            .on('mouseleave', () => this.resetHighlights())
            .on('click', (event: any, d: any) => this.toggleHighlight(d.id))

        this.legendContainer
            .selectAll('g.legend-item')
            .selectAll('rect')
            .data((d: any) => [d])
            .join('rect')
            .attr('width', this.config.legendItem.symbolSize)
            .attr('height', this.config.legendItem.symbolSize)
            .attr('fill', (d: any) => this.colors(d.id))
            .attr('stroke', (d: any) => this.colors(d.id))
            .attr('stroke-width', this.config.arcs.strokeWidth)
            .attr('rx', this.config.arcs.radius)
            .attr('ry', this.config.arcs.radius)
            .attr('x', 0)
            .attr('y', 0)

        this.legendContainer
            .selectAll('g.legend-item')
            .selectAll('text')
            .data((d: any) => [d])
            .join('text')
            .attr('class', 'legend-text')
            .attr('font-size', this.config.legendItem.fontSize + 'px')
            .attr('x', this.config.legendItem.textSeparator)
            .attr('y', this.config.legendItem.symbolSize)
            .style('cursor', 'pointer')
            .text((d: any) => d.label)

        const dimensions = this.legendContainer.node().getBBox()

        this.legendContainer.attr(
            'transform',
            `translate(${this.margins.left},
            ${this.margins.top})`
        )
    }

    extendPreviousDataWithEnter(previous: any, current: any) {
        const previousIds = new Set(previous.map((d: any) => d.data.id))
        const beforeEndAngle = (id: any) =>
            previous.find((d: any) => d.data.id === id)?.endAngle || 0

        const newElements = current
            .filter((elem: any) => !previousIds.has(elem.data.id))
            .map((elem: any) => {
                const before = current.find((d: any) => d.index === elem.index - 1)
                const angle = beforeEndAngle(before?.data?.id)
                return {
                    ...elem,
                    startAngle: angle,
                    endAngle: angle,
                }
            })

        return [...previous, ...newElements]
    }

    extendCurrentDataWithExit = (previous: any, current: any) => {
        return this.extendPreviousDataWithEnter(current, previous)
    }

    arcTweenFactory = (data: any, enter: boolean) => {
        const chart = this
        const arcTween = function (elementData: any) {
            const previousElemData = data.find(
                (d: any) => d.data.id === elementData.data.id
            )

            const [start, end] = enter
                ? [previousElemData, elementData]
                : [elementData, previousElemData]

            const interpolate = d3.interpolate(start, end)

            return function (t: any) {
                return chart.arc(interpolate(t))
            }
        }

        return arcTween
    }

    draw() {
        const chart = this
        const data = this.pieData

        const previousData = this.dataContainer.selectAll('path.data').data()

        const extendedPreviousData = this.extendPreviousDataWithEnter(previousData, data)
        const extendedCurrentData = this.extendCurrentDataWithExit(previousData, data)

        const enterArcTween = this.arcTweenFactory(extendedPreviousData, true)

        const exitArcTween = this.arcTweenFactory(extendedCurrentData, false)

        this.dataContainer
            .selectAll('path.data')
            .data(data, (d: any) => d.data.id)
            .join(
                (enter: any) => enter.append('path'),
                (update: any) => update,
                (exit: any) =>
                    exit.transition().duration(1000).attrTween('d', exitArcTween).remove()
            )
            .attr('class', 'data')
            .style('fill', (d: any) => this.colors(d.data.id))
            .style('stroke', this.config.arcs.stroke)
            .style('stroke-width', this.config.arcs.strokeWidth)
            .on('mouseover', (event: MouseEvent, d: any) => {
                this.setToolTip(event, d.data)
                this.sethHighlights(d.data.id)
            })
            .on('mouseleave', () => this.resetHighlights())
            .transition()
            .duration(1000)
            .attrTween('d', enterArcTween)

        this.dataContainer
            .selectAll('text.percent')
            .data(data, (d: any) => d.data.id)
            .join('text')
            .attr('class', 'percent')
            .text((d: any) => d.data.percent)
            .text((d: any) => this.calculatePercentage(d.data))
            .attr('transform', (d: PieData) => `translate(${this.arc.centroid(d)})`)
            .attr('dy', '0.35rem')
            .attr('text-anchor', 'middle')
            .attr('font-size', '0,8rem')
            .attr('font-weight', 'bold')
            .attr('cursor', 'pointer')
    }

    setToolTip(event: MouseEvent, data: PieDataElement) {
        const tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 1)
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY}px`)
        tooltip.html(
            `
                <p><strong>Department:</strong> ${data.label}</p>
                <p><strong>Spending:</strong> ${d3.format('$,.0f')(+data.value)}</p>
                <p><strong>Percentage:</strong> ${this.calculatePercentage(data)}</p>`
        )
        d3.select(event.target as any).on('mouseout', () => tooltip.remove())
    }

    sethHighlights(id: string) {
        if (this.hiddenIds.has(id)) {
            return
        }
        this.dataContainer
            .selectAll('path.data')
            .style('opacity', (d: any) =>
                d.data.id === id ? 1 : this.config.hiddenOpacity
            )
        this.legendContainer
            .selectAll('g.legend-item')
            .style('opacity', (d: any) =>
                d.id === id ? null : this.config.hiddenOpacity
            )
    }

    resetHighlights() {
        this.dataContainer.selectAll('path.data').style('opacity', null)
        this.legendContainer
            .selectAll('g.legend-item')
            .style('opacity', (d: any) =>
                !this.hiddenIds.has(d.id) ? null : this.config.hiddenOpacity
            )
    }

    toggleHighlight(id: string) {
        this.hiddenIds.has(id) ? this.hiddenIds.delete(id) : this.hiddenIds.set(id, true)
        this.updateChart()
    }

    calculatePercentage(data: PieDataElement) {
        if (!this.data) return ''
        const total = d3.sum(
            this.data?.data.filter((e) => !this.hiddenIds.has(e.id)),
            (d: any) => d.value
        )
        return ((+data.value / total) * 100).toFixed(2) + '%'
    }

    updateChart() {
        this.setParams()
        this.setLabels()
        this.setLegend()
        this.draw()
    }
}
