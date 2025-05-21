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
    pageSize: number;
    pageTotal: number;
    pageIndex: number;
    totalRecord: number;
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
export class STRReportService {
  private apiUrl = environment.apiBaseUrl + '/api';

  constructor(private http: HttpClient) {}

  private searchingReportSTRList =
    new BehaviorSubject<DataTablesResponse | null>(null);
  searchingReportSTRListData$ = this.searchingReportSTRList.asObservable();

  statusList = [
    { text: 'Đang nhập liệu', id: 'DANG_NHAP_LIEU' },
    { text: 'Chờ kiểm soát', id: 'CHO_KIEM_SOAT' },
    
    { text: 'Kiểm soát STR chưa đạt', id:'KIEM_SOAT_CHUA_DAT' },
    { text: 'Chờ duyệt', id: 'CHO_DUYET' },

    { text: 'Đã gửi cục PCRT', id: 'DA_GUI' },
    { text: 'Không phê duyệt', id: 'KHONG_PHE_DUYET' },

    { text: 'Cục PCRT tiếp nhận', id: 'PCRT_XAC_NHAN' },
    { text: 'Cục PCRT trả lại STR', id: 'PCRT_HOAN' },
  ];

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
            records: [],
          });
        }
      );
  }

  // recordId: string, actionName: string, statusFrom: string, statusTo: string
  onChangeReportStatus(
    recordId: string,
    bodyParams: {}
  ): Observable<ISTRReportModel> {
    return this.http.post(
      `${this.apiUrl}/report-list/changeStatus?id=${recordId}`,
      bodyParams,
      { headers: this.getHeader() }
    );
  }

  onPrintDocxReport(recordId: string) {
    return this.http.get(
      `${this.apiUrl}/report-list/getDocx?id=${recordId}`,

      {
        headers: this.getHeader(),
        responseType: 'blob', // Quan trọng: Chỉ định responseType là 'blob'
      }
    );
  }

  onDeleteItem(recordId: string) {
    return this.http.get(
      `${this.apiUrl}/report-list/delete?id=${recordId}`,
      {
        headers: this.getHeader(),
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
    const url = `${this.apiUrl}/report-list/getItem?id=${id}`;
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
      case ReportStatusEnum.REPORTER_APPROVED:
        return 4;
      case ReportStatusEnum.REPORTER_NOT_APPROVED:
        return 5;
      case ReportStatusEnum.PCRT_RECEIVED:
        return 6;
      case ReportStatusEnum.PCRT_REJECTED:
        return 7;
    }
  }

  // parseStatusIntToEnum(intObj: number) {
  //   switch (intObj) {
  //     case 0:
  //       return ReportStatusEnum.DRAF;
  //     case 1:
  //       return ReportStatusEnum.INPUTER_SUBMITED;
  //     case 2:
  //       return ReportStatusEnum.AUTHORISER_NOT_APPROVED;
  //     case 3:
  //       return ReportStatusEnum.AUTHORISER_APPROVED;
  //     case 4:
  //       return ReportStatusEnum.REPORTER_APPROVED;
  //     case 5:
  //       return ReportStatusEnum.REPORTER_NOT_APPROVED;
  //     case 6:
  //       return ReportStatusEnum.PCRT_RECEIVED;
  //     case 7:
  //       return ReportStatusEnum.PCRT_REJECTED;
  //   }

  //   return ReportStatusEnum.DRAF;
  // }

  parseStatusStringToEnum(stringObj: string) {
    switch (stringObj) {
      case 'DANG_NHAP_LIEU':
        return ReportStatusEnum.DRAF;
      case 'CHO_KIEM_SOAT':
        return ReportStatusEnum.INPUTER_SUBMITED;
      case 'KIEM_SOAT_CHUA_DAT':
        return ReportStatusEnum.AUTHORISER_NOT_APPROVED;
      case 'CHO_DUYET':
        return ReportStatusEnum.AUTHORISER_APPROVED;
      case 'DA_GUI':
        return ReportStatusEnum.REPORTER_APPROVED;
      case 'KHONG_PHE_DUYET':
        return ReportStatusEnum.REPORTER_NOT_APPROVED;
      case 'PCRT_XAC_NHAN':
        return ReportStatusEnum.PCRT_RECEIVED;
      case 'PCRT_HOAN':
        return ReportStatusEnum.PCRT_REJECTED;
        case 'PCRT_HOAN':
          return ReportStatusEnum.PCRT_REJECTED;
         
    }
    
    return null;
  }

}
