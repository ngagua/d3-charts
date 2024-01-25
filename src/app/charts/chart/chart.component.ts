import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core'
import { NgIf } from '@angular/common'

@Component({
    selector: 'charts',
    standalone: true,
    imports: [NgIf],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.scss',
})
export class ChartComponent implements OnInit, OnChanges {
    @Input() data = [125, 100, 50, 75, 300, 200]
    xLabels = ['A', 'B', 'C', 'D', 'E', 'F']
    rectWidth = 40
    max = 250
    dimensions!: DOMRect
    outerPadding = 0
    padding = 0
    bandWidth = 0
    bandWidthCoef = 0.8
    left = 10
    right = 20
    top = 55
    bottom = 16
    innerWidth = 0
    innerHeight = 0

    constructor(private elementRef: ElementRef) {}

    ngOnInit() {
        const svg = this.elementRef.nativeElement.getElementsByTagName('svg')[0]
        this.dimensions = svg.getBoundingClientRect()
        this.innerWidth = this.dimensions.width - this.left - this.right
        this.innerHeight = this.dimensions.height - this.top - this.bottom

        this.setParams()
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setParams()
    }

    setParams() {
        this.rectWidth = (this.innerWidth - 2 * this.outerPadding) / this.data.length
        this.bandWidth = this.rectWidth * this.bandWidthCoef
        this.padding = this.rectWidth * (1 - this.bandWidthCoef)
        this.max = 1.3 * Math.max(...this.data)
    }
}
