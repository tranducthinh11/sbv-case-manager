import { Injectable } from "@angular/core";
import {environment} from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import {createRequestOption} from '../../../common/request-util';



let headers = new HttpHeaders({
     'Access-Control-Allow-Origin': '*',
   });

@Injectable({ providedIn: 'root' })
export class DasBoardService {
    public resourceUrl = environment.apiBaseUrl + '/api';
    //private resourceUrlRoot = this.applicationConfigService.getEndpointFor('api/aml');
  
    constructor(protected http: HttpClient) {

     }


     getDashBoard(req?: any): Observable<HttpResponse<any>> {
        const options = createRequestOption(req);
        return this.http
          .get<any>(this.resourceUrl + '/dashboard', {headers: headers, params: options, observe: 'response' });
      }
      getDashBoard1(req?: any): Observable<any> {
        const options = createRequestOption(req);
        return this.http
          .get<any>(this.resourceUrl + '/dashboard', {headers: headers, params: options });
      }

}