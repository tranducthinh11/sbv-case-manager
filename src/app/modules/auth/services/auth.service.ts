import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { KeycloakProfile } from 'keycloak-js';
import { KeycloakService } from 'keycloak-angular';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  private currentUserProfile: any = null;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private keycloakService: KeycloakService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // getAuthorizationDetails(): Observable<any> {
  //   return this.authHttpService.getAuthorizationDetails().pipe(
  //     map((authDetails: any) => {
  //       return authDetails;
  //     }),
  //     catchError((err) => {
  //       console.error('err', err);
  //       return of(undefined);
  //     }),
  //     finalize(() => this.isLoadingSubject.next(false))
  //   );
  // }

  // public methods
  login(email: string, password: string): Observable<UserType> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(email, password).pipe(
      map((auth: AuthModel) => {
        const result = this.setAuthFromLocalStorage(auth);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    if(!environment.enable_keycloak) {
      localStorage.removeItem(this.authLocalStorageToken);
      this.router.navigate(['/auth/login'], {
        queryParams: {},
      });
    } else {
      localStorage.removeItem(this.authLocalStorageToken);
      this.keycloakService.logout();
    }
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      map((user: UserType) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    return of(undefined);
    // this.isLoadingSubject.next(true);
    // return this.authHttpService.createUser(user).pipe(
    //   map(() => {
    //     this.isLoadingSubject.next(false);
    //   }),
    //   switchMap(() => this.login(user.email, user.password)),
    //   catchError((err) => {
    //     console.error('err', err);
    //     return of(undefined);
    //   }),
    //   finalize(() => this.isLoadingSubject.next(false))
    // );
  }

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  // private methods
  public setAuthFromLocalStorage(auth: any): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if(environment.enable_keycloak) {
      if(this.keycloakService.isLoggedIn()) {
        localStorage.removeItem(this.authLocalStorageToken);
        localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
        return true;
      }
    } else {
      if (auth && auth.authToken) {
        localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
        return true;
      }
    }
    
    return false;
  }

  public getAuthFromLocalStorage(): any | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public getUserIDLogin(): any | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData.id;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  getResourceAccess() {
    const tokenParsed = this.keycloakService.getKeycloakInstance().tokenParsed;
    if(tokenParsed && tokenParsed['resource_access']) {
        return tokenParsed['resource_access'][environment.keycloakConfig.clientId].roles;
    }
    return [];
  }

  isRoleInputer(): boolean {
    if(this.getResourceAccess().indexOf("inputer") > -1) {
      return true;
    }
    return false;
  }

  isRoleReviewer(): boolean {
    if(this.getResourceAccess().indexOf("reviewer") > -1) {
      return true;
    }
    return false;
  }

  isRoleApprove(): boolean {
    if(this.getResourceAccess().indexOf("approver") > -1) {
      return true;
    }
    return false;
  }

  async loadCurrentUserProfile() {
    let profile = (await this.keycloakService.loadUserProfile()) as KeycloakProfile;
    console.log(profile.email);
    this.setAuthFromLocalStorage(profile);
  }

  getUserType():any {
      let userType = '';
      if(this.isRoleInputer()){
        userType = 'I'; // Inputer
      }else if(this.isRoleReviewer()){
        userType = 'R'; // Reviewer
      }else if(this.isRoleApprove()){
        userType = 'S'; // Approve (Sender)
      }
      return userType;
  
    }
}
