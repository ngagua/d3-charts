import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, Observable } from 'rxjs'
import { Browser, CovidData, Employee, USSpendingData } from '../models/models'

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient) {}

    getJSON(url: string): Observable<any> {
        return this.http.get(url)
    }

    getEmployees(): Observable<Employee[]> {
        return this.http
            .get('/api/v1/employees')
            .pipe(map((res: any) => res.data)) as Observable<Employee[]>
    }

    getCovidData(): Observable<CovidData[]> {
        const url = ' https://api.covidtracking.com/v1/us/daily.json'
        return this.getJSON(url)
    }

    getBrowsers(): Observable<Browser[]> {
        const url = 'assets/browsers.json'
        return this.getJSON(url)
    }

    getSpending(): Observable<USSpendingData[]> {
        const url = 'assets/us-spending.json'
        return this.getJSON(url)
    }
}
