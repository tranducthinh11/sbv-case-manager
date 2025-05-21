import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BankAccountNumber } from 'src/app/modules/report-str/report-two/section-two/models/bank-account-number';
import { Organization } from 'src/app/modules/report-str/report-two/section-two/models/organization';
import { ReportStatusEnum } from './report-status.enum';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StaticService {
  private constructor() {}

  private isValidToken: number = 0;
  private isValidAsync = new BehaviorSubject<number>(0);
  private signDataResponseAsync = new BehaviorSubject<Object>({
    statusCode : 0,
    statusContent: ''
  });

  private static instance: StaticService = new StaticService();

  public static getInstance(): StaticService {
    return this.instance;
  }

  public getIsValidToken() {
    return this.isValidToken;
  }

  public setIsValidToken(isValid) {
    this.isValidToken = isValid;
    this.isValidAsync.next(isValid);
  }

  public setSignDataResponse(data) {
    this.signDataResponseAsync.next(data);
  }

  public getSignDataResponseAsync() {
    return this.signDataResponseAsync.asObservable();
  }

  public getIsValidTokenAsync() {
    return this.isValidAsync.asObservable();
  }
}
