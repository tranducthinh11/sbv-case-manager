import { Injectable } from "@angular/core";
import {environment} from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { StrUser } from "../model/str-user.model";



let headers = new HttpHeaders({
     'Access-Control-Allow-Origin': '*',
   });

@Injectable({ providedIn: 'root' })
export class StrUserService {
  public resourceUrl = environment.apiBaseUrl + '/api/user';

  constructor(protected http: HttpClient) {

    }
    getUserActive(): Observable<HttpResponse<StrUser[]>> {
      return this.http
        .get<StrUser[]>(this.resourceUrl + '/active', {headers: headers, observe: 'response' });
    }

}