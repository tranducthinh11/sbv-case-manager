import { Injectable } from '@angular/core';
import { MenuItem } from '../model/menu-item.model';
import { UserRole } from './role.constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { createRequestOption } from './request-util';
import { SignatureResponse } from '../model/signature-response.model';
import { InjectorInstance } from '../modules/list-str-case/list-str-case.module';


let headers = new HttpHeaders({
  'Access-Control-Allow-Origin': '*',
});

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private static apiUrl = environment.apiBaseUrl + '/api';


  constructor(private http: HttpClient) { }
  
  public static verifySignature(req: any): Observable<any> {
    const httpClient =  InjectorInstance.get<HttpClient>(HttpClient);
    return httpClient.post<any>(this.apiUrl + "/verified/signature", req, { headers: headers, observe: 'response' });
  }

}
