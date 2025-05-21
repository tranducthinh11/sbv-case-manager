import { Injectable } from "@angular/core";
import {environment} from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import {createRequestOption} from './request-util';
import { CategoryAssignment } from "../model/str-category-assignment.model";



let headers = new HttpHeaders({
     'Access-Control-Allow-Origin': '*',
   });

@Injectable({ providedIn: 'root' })
export class StrCategoryAssignmentService {
    public resourceUrl = environment.apiBaseUrl + '/api/assignment';
    //private resourceUrlRoot = this.applicationConfigService.getEndpointFor('api/aml');
  
    constructor(protected http: HttpClient) {

     }
     getAll(): Observable<HttpResponse<CategoryAssignment[]>> {
        return this.http
          .get<CategoryAssignment[]>(this.resourceUrl + '/all', {headers: headers, observe: 'response' });
      }

}