import { Routes } from '@angular/router'
import { ChartsComponent } from './pages/charts/charts.component'

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'charts',
        pathMatch: 'full',
    },
    {
        path: 'charts',
        children: [
            { path: '', redirectTo: 'pie-chart', pathMatch: 'full' },
            {
                path: 'pie-chart',
                component: ChartsComponent,
            },
            {
                path: 'line-chart',
                component: ChartsComponent,
            },
            {
                path: 'bar-chart',
                component: ChartsComponent,
            },
            {
                path: 'grouped-bar-chart',
                component: ChartsComponent,
            },
            {
                path: 'stacked-bar-chart',
                component: ChartsComponent,
            },
        ],
    },
]
