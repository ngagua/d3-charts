import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BarChartComponent } from './bar-chart.component'

describe('Chart2Component', () => {
    let component: BarChartComponent
    let fixture: ComponentFixture<BarChartComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BarChartComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(BarChartComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
