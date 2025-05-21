import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BankAccountNumber } from 'src/app/modules/report-str/report-two/section-two/models/bank-account-number';
import { Organization } from 'src/app/modules/report-str/report-two/section-two/models/organization';
import { ReportStatusEnum } from './report-status.enum';
import { environment } from 'src/environments/environment';

export interface DataTablesResponse {
  records: any[] | null;
  pageInfo: {
    pageSize: 10;
    pageTotal: 0;
    pageIndex: 0;
    totalRecord: 0;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private apiUrl = environment.apiBaseUrl + '/api';
  // private apiUrl = 'http://localhost:8080/api/report-list/getPage?page=0&size=10&sort=id,desc';

  constructor(private http: HttpClient) {}

  private historySTRList = new BehaviorSubject<DataTablesResponse | null>(null);
  searchingReportSTRListData$ = this.historySTRList.asObservable();

  getHeader() {
    const headers = new HttpHeaders();
    // add token
    return headers;
  }

  updateHistoryOfReport(
    paging = {
      page: 0,
      size: 10,
      sort: ['id', 'desc'],
    },
    searchVM: {id: null}
  ) {
    this.historySTRList.next({
      pageInfo: {
        pageSize: 10,
        pageTotal: 0,
        pageIndex: 0,
        totalRecord: 0,
      },
      records: null,
    });
    const headers = new HttpHeaders();
    this.http
      .get(
        this.apiUrl +
          `/history?strId=${searchVM.id}&page=${paging.page}&size=${paging.size}&sort=` +
          paging.sort.join(','),
        { headers: headers }
      )
      .subscribe(
        (res: any) => {
          console.log('res');
          console.log(res);
          this.historySTRList.next({
            pageInfo: {
              pageSize: res.size,
              pageTotal: res.totalPages,
              pageIndex: res.page,
              totalRecord: res.totalElements,
            },
            records: res.content,
          });
        },
        (error) => {
          console.log(error);
          // temp for dev
          this.historySTRList.next({
            pageInfo: {
              pageSize: 10,
              pageTotal: 0,
              pageIndex: 0,
              totalRecord: 0,
            },
            records: [{}],
          });
        }
      );
  }

  updateHistoryOfReportManager(
    paging = {
      page: 0,
      size: 10,
      sort: ['id', 'desc'],
    },
    searchVM: {id: null}
  ) {
    this.historySTRList.next({
      pageInfo: {
        pageSize: 10,
        pageTotal: 0,
        pageIndex: 0,
        totalRecord: 0,
      },
      records: null,
    });
    const headers = new HttpHeaders();
    this.http
      .get(
        this.apiUrl +
          `/historyManager?strId=${searchVM.id}&page=${paging.page}&size=${paging.size}&sort=` +
          paging.sort.join(','),
        { headers: headers }
      )
      .subscribe(
        (res: any) => {
          console.log('res log: ');
          console.log(res);
          this.historySTRList.next({
            pageInfo: {
              pageSize: res.size,
              pageTotal: res.totalPages,
              pageIndex: res.page,
              totalRecord: res.totalElements,
            },
            records: res.content,
          });
        },
        (error) => {
          console.log(error);
          // temp for dev
          this.historySTRList.next({
            pageInfo: {
              pageSize: 10,
              pageTotal: 0,
              pageIndex: 0,
              totalRecord: 0,
            },
            records: [{}],
          });
        }
      );
  }

}


