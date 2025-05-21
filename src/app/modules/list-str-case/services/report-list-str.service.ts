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

export interface ISTRReportModel {
  id?: null | string;
  created_at?: string;

  bank_account?: null | BankAccountNumber;
  information_account?: null | any;
  organization?: null | Organization;
  user?: string | any;
}

@Injectable({
  providedIn: 'root',
})
export class STRReportListSTRService {
  private apiUrl = environment.apiBaseUrl + '/api';
  // private apiUrl = 'http://localhost:8080/api/report-list/getPage?page=0&size=10&sort=id,desc';

  constructor(private http: HttpClient) {}

  private searchingReportSTRList =
    new BehaviorSubject<DataTablesResponse | null>(null);
  searchingReportSTRListData$ = this.searchingReportSTRList.asObservable();

  getHeader() {
    const headers = new HttpHeaders();
    // add token
    return headers;
  }

  updateListReport(
    paging = {
      page: 0,
      size: 10,
      sort: ['id', 'desc'],
    },
    searchVM: {}
  ) {
    this.searchingReportSTRList.next({
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
      .post(
        this.apiUrl +
          `/report-list/searchPage?page=${paging.page}&size=${paging.size}&sort=` +
          paging.sort.join(','),
        searchVM,
        { headers: headers }
      )
      .subscribe(
        (res: any) => {
          console.log('res');
          console.log(res);
          this.searchingReportSTRList.next({
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
          this.searchingReportSTRList.next({
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

  // recordId: string, actionName: string, statusFrom: string, statusTo: string
  onChangeReportStatus(
    bodyParams: {}
  ): Observable<any> {
    console.log("onchangeReport", bodyParams);
    // return ;
    return this.http.post(
      `${this.apiUrl}/list-case/changeStatus`,
      bodyParams,
      { headers: this.getHeader() }
    );
  }

  onUpdateSTR(
    bodyParams: {}
  ): Observable<any> {
    console.log("onUpdateSTR", bodyParams);
    // return ;
    return this.http.post(
      `${this.apiUrl}/list-case/updateSTR`,
      bodyParams,
      { headers: this.getHeader() }
    );
  }


  onPrintDocxReport(recordId: string) {
    return this.http.get(
      // `${this.apiUrl}/report-list/getDocx?id=${recordId}`,
      `${this.apiUrl}/list-case/export?id=${recordId}`,
      { headers: this.getHeader(),
        responseType: 'blob' // Quan trọng: Chỉ định responseType là 'blob'
       }
      
    );
  }

  checkCurrentInfo() {
    return this.http.get(`${this.apiUrl}/report-list/getClientInfo`, {
      headers: this.getHeader(),
    });
  }

  checkBackendInfo() {
    return this.http.get(`${this.apiUrl}/report-list/getSecureInfo`, {
      headers: this.getHeader(),
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

  //
  parseStatusEnumToInt(enumObj: ReportStatusEnum) {
    switch (enumObj) {
      case ReportStatusEnum.DRAF:
        return 0;
      case ReportStatusEnum.INPUTER_SUBMITED:
        return 1;
      case ReportStatusEnum.AUTHORISER_NOT_APPROVED:
        return 2;
      case ReportStatusEnum.AUTHORISER_APPROVED:
        return 3;
      case ReportStatusEnum.AUTHORISER_SUBMITED:
        return 4;
      case ReportStatusEnum.REPORTER_NOT_APPROVED:
        return 5;
      case ReportStatusEnum.REPORTER_APPROVED:
        return 6;
    }
  }

  parseStatusIntToEnum(intObj: number) {
    switch (intObj) {
      case 0:
        return ReportStatusEnum.DRAF;
      case 1:
        return ReportStatusEnum.INPUTER_SUBMITED;
      case 2:
        return ReportStatusEnum.AUTHORISER_NOT_APPROVED;
      case 3:
        return ReportStatusEnum.AUTHORISER_APPROVED;
      case 4:
        return ReportStatusEnum.AUTHORISER_SUBMITED;
      case 5:
        return ReportStatusEnum.REPORTER_NOT_APPROVED;
      case 6:
        return ReportStatusEnum.REPORTER_APPROVED;
    }
    return ReportStatusEnum.DRAF;
  }
}
