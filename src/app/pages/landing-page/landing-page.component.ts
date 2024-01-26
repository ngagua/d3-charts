import { Component } from '@angular/core'
import { MatSelectModule } from '@angular/material/select'
import { AsyncPipe, NgForOf, NgIf } from '@angular/common'
import { BarChartComponent } from '../../charts/bar-chart/bar-chart.component'
import { ChartComponent } from '../../charts/chart/chart.component'
import { LineChartComponent } from '../../charts/line-chart/line-chart.component'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatLineModule, MatOptionModule } from '@angular/material/core'
import { MatToolbarModule } from '@angular/material/toolbar'
import { PieChartComponent } from '../../charts/pie-chart/pie-chart.component'
import { MenuItem } from '../../models/models'
import { MatSidenavModule } from '@angular/material/sidenav'
import { RouterLink, RouterOutlet } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [
        AsyncPipe,
        BarChartComponent,
        ChartComponent,
        LineChartComponent,
        MatFormFieldModule,
        MatOptionModule,
        MatToolbarModule,
        MatSelectModule,
        PieChartComponent,
        MatSidenavModule,
        RouterOutlet,
        MatIconModule,
        NgIf,
        MatListModule,
        RouterLink,
        NgForOf,
        MatLineModule,
    ],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
    menuItems: MenuItem[] = [
        {
            menuItemTitle: 'Pie Chart',
            icon: 'donut_large',
            navigationLink: 'charts/pie-chart',
        },
        {
            menuItemTitle: 'Line Chart',
            icon: 'show_chart',
            navigationLink: 'charts/line-chart',
        },
        {
            menuItemTitle: 'Bar Chart',
            icon: 'bar_chart',
            navigationLink: 'charts/bar-chart',
        },
    ]
}
