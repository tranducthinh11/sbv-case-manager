import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {createRequestOption} from '../../../../../common/request-util'

let headers = new HttpHeaders({
  'Access-Control-Allow-Origin': '*',
});

@Injectable({
  providedIn: 'root'
})
export class STRModelService {
  private apiUrl = environment.apiBaseUrl + '/api';

  private searchingSTRItem = new BehaviorSubject<any>(null);
  searchingSTRItemData$ = this.searchingSTRItem.asObservable();


  constructor(private http: HttpClient) { }

  saveSTRModel(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/str-creator/saveStrModel', data);
  }

  getSTRModelById(id: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/str-creator/findItem?id=' + id);
  }

  searchSTRItem(id: any) {
    this.searchingSTRItem.next(null);
    const headers = new HttpHeaders();
    this.http.get(this.apiUrl + '/report-list/' + id, { headers: headers })
      .subscribe(
        (res: any) => {
          console.log("res");
          console.log(res);
          this.searchingSTRItem.next(res)
        },
        (error) => {
          console.log(error);
          // temp for dev
          this.searchingSTRItem.next(null);
        });
  }


  getReportEntity(req?: any): Observable<HttpResponse<any>> {
    const options = createRequestOption(req);
    return this.http.get<any>(this.apiUrl + '/str-creator/reportEntities', { headers: headers, params: options, observe: 'response' });
  }

  getInforReport(req?: any): Observable<HttpResponse<any>> {
    const options = createRequestOption(req);
    return this.http
      .get<any>(this.apiUrl + '/str-creator/infoReport', { headers: headers, params: options, observe: 'response' });
  }

  // Kiểm tra mã nội bộ khi đối tượng báo cáo nhập có là duy nhất không?
  checkDuplicateInternalNumber(req?: any): Observable<boolean> {
    const options = createRequestOption(req);
    return this.http.get<boolean>(this.apiUrl + '/str-creator/check-duplicate', { params: options });
  }

}