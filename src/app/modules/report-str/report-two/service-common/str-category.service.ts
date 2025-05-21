import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { createRequestOption } from '../../../../common/request-util'

@Injectable({
    providedIn: 'root'
})
export class STRCategoryService {
    private apiUrl = environment.apiBaseUrl + '/api/';

    constructor(private http: HttpClient) { }

    getCountries(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'country');
    }

    getCurrencys(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'currency');
    }

    getCategory(req?: any): Observable<any[]> {
        const options = createRequestOption(req);
        return this.http.get<any[]>(this.apiUrl + 'category-list', { params: options });
    }

    getCategoryCrime(req?: any): Observable<any[]>{
        const options = createRequestOption(req);
        return this.http.get<any[]>(this.apiUrl + 'crime', {params: options});
    }

    getBanks(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'bank');
    }
}