import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BankAccountNumber } from 'src/app/modules/report-str/report-two/section-two/models/bank-account-number';
import { Organization } from 'src/app/modules/report-str/report-two/section-two/models/organization';

export interface DataTablesResponse {
  records: any[] | null;
  pageInfo: {
    pageSize: 10;
    pageIndex: 0;
    totalRecord: 0;
  };
}

export interface ISTRReportModel {
  id?: null | string;
  created_at?: string;
   
  bank_account?: null | BankAccountNumber;
  information_account?: null | any;
  organization?: null | Organization;
  user?: string| any;
}

@Injectable({
  providedIn: 'root',
})
export class STRReportService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/str/';
  // private apiUrl = 'http://127.0.0.1:8000/api/v1/users';

  constructor(private http: HttpClient) {}

  private searchingReportSTRList = new BehaviorSubject<DataTablesResponse| null>(null);
  searchingReportSTRListData$ = this.searchingReportSTRList.asObservable();
  

  updateListReport(searchVM: {}) {
    this.searchingReportSTRList.next({
      pageInfo: {
        pageSize: 10,
        pageIndex: 0,
        totalRecord: 0,
      },
      records: null
    });
    const headers = new HttpHeaders();
    this.http.post(this.apiUrl + "/dashboard/search-reports-by-date", searchVM, { headers: headers })
    .subscribe(
      (res: any) => {
        console.log("res");
        console.log(res);
        this.searchingReportSTRList.next(res)
      },
      (error) => {
        console.log(error);
        // temp for dev
        this.searchingReportSTRList.next({
          pageInfo: {
            pageSize: 10,
            pageIndex: 0,
            totalRecord: 0,
          },
          records: [{}]
        });
      });
  }

  getSTRItem(id: number): Observable<ISTRReportModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ISTRReportModel>(url);
  }

  createSTRItem(user: ISTRReportModel): Observable<ISTRReportModel> {
    return this.http.post<ISTRReportModel>(this.apiUrl, user);
  }

  updateUser(id: number, user: ISTRReportModel): Observable<ISTRReportModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ISTRReportModel>(url, user);
  }

  deleteUser(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
