import { ListStrCaseComponent } from './../list-str-case.component';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ReportStatusEnum } from "./report-status.enum";
import { ReportEntities } from "src/app/model/report-entities.model";

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

export class STRListCaseService{
    private apiUrl = environment.apiBaseUrl + '/api';
    
    private searchingSTRListCase =
        new BehaviorSubject<DataTablesResponse | null>(null);

    private reportEntitiesSubject = new BehaviorSubject<ReportEntities[] | null>([]);
    
    searchingSTRListCaseData$ = this.searchingSTRListCase.asObservable();
    reportEntities$ = this.reportEntitiesSubject.asObservable();

    constructor(private http: HttpClient) {}

    getHeader() {
        const headers = new HttpHeaders();
        // add token
        return headers;
      }

    updateSearchListSTRCase(
        paging = {
          page: 0,
          size: 10,
          sort: ['id', 'desc'],
        },
        searchVM: {}
      ) {
        this.searchingSTRListCase.next({
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
              `/list-case/searchPage?page=${paging.page}&size=${paging.size}&sort=` +
              paging.sort.join(','),
            searchVM,
            { headers: headers }
          )
          .subscribe(
            (res: any) => {
              console.log('res');
              console.log(res);
              this.searchingSTRListCase.next({
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
              this.searchingSTRListCase.next({
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
    
    //lấy danh sách đối tượng báo cáo
    getReportEntities(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl + '/reportEntities');
    }

    //lấy danh sách kết luân tội phạm
    getCrimes() : Observable<any[]>{
      return this.http.get<any[]>(this.apiUrl + '/crime');
    }

    //lấy danh sách cán bộ xử lý
    getStrUser(roleName : string): Observable<any[]>{
      return this.http.get<any[]>(this.apiUrl + '/strUsers?role='+roleName);
    }

    updateReportEntities(reportEntities: ReportEntities[]): void {
      this.reportEntitiesSubject.next(reportEntities);
    }

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

    // parseSTRCrime(record : )
    
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