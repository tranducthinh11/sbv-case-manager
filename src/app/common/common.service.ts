import { Injectable } from '@angular/core';
import { MenuItem } from '../model/menu-item.model';
import { UserRole } from './role.constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { createRequestOption } from './request-util';

let headers = new HttpHeaders({
  'Access-Control-Allow-Origin': '*',
});

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private apiUrl = environment.apiBaseUrl + '/api';

  lstMenuItem: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: 'element-11', child: [], role: [], active: false},
    { title: 'Danh sách STR', path: '/list-str-case', icon: 'element-11', child: [], role: [], active: false},
    // { title: 'Quản lý phân công', path: '/assignment', icon: 'element-11', child: [], role: [], active: false},
    // { title: 'Tiếp nhận STR', path: '', icon: 'book-open', child: [
    //   { title: 'Danh sách tiếp nhận', path: '/report-str/report-two', icon: 'bullet bullet-dot', child: [], role: [UserRole.INPUTER], type: 'B', active: false},
    //   { title: 'Hồ sơ tiếp nhận STR chi tiết', path: '/report-str/report-two', icon: 'bullet bullet-dot', child: [], role: [UserRole.INPUTER], type: 'B', active: false},
    // ], role: [UserRole.INPUTER], active: false},

    // { title: 'Tạo thủ công STR', path: '', icon: 'profile-circle', child: [
    //   { title: 'Mẫu số 01', path: '/report-str/report-two', icon: 'bullet bullet-dot', child: [], role: [UserRole.INPUTER], type: 'B', active: false},
      
    // ], role: [UserRole.INPUTER], active: false}
  ]

  constructor(private http: HttpClient) { }

  getMenuItem(): MenuItem[] {
    return this.lstMenuItem;
  }

  getEntityReport(entity_code: string): Observable<any> {
    const options = createRequestOption({
      report_entity_code: entity_code,
    });
    return this.http.get<any>(this.apiUrl + '/str-creator/reportEntities', { headers: headers, params: options, observe: 'response' })
  }
}
