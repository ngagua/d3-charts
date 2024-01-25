import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from './services/api.service'
import { HttpClientModule } from '@angular/common/http'
import { LandingPageComponent } from './pages/landing-page/landing-page.component'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, HttpClientModule, LandingPageComponent],
    providers: [ApiService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {}
