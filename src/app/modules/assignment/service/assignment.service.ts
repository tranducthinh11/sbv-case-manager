import { Injectable } from "@angular/core";
import {environment} from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import {createRequestOption} from '../../../common/request-util';



let headers = new HttpHeaders({
     'Access-Control-Allow-Origin': '*',
   });

@Injectable({ providedIn: 'root' })
export class AssignmentService {
    public resourceUrl = environment.apiBaseUrl + '/api';
    //private resourceUrlRoot = this.applicationConfigService.getEndpointFor('api/aml');
  
    constructor(protected http: HttpClient) {

     }


     getDashBoard(req?: any): Observable<HttpResponse<any>> {
        const options = createRequestOption(req);
        return this.http
          .get<any>(this.resourceUrl + '/dashboard', {headers: headers, params: options, observe: 'response' });
      }

      getCaseDashBoard(req?: any, type?: number): Observable<HttpResponse<any>> {
        const options = createRequestOption(req);
        return this.http
          .get<any>(this.resourceUrl + (type == 1 ? '/case/myDashboard' : '/case/dashboard'), {headers: headers, params: options, observe: 'response' });
      }

      getAssignment(req?:any): Observable<any>{
        
        return this.http.post(this.resourceUrl + '/list-case/assignment', {fromDate: req?.fromDate, toDate: req?.toDate} , {headers: headers });
      }
}