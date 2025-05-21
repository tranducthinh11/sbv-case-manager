import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription, firstValueFrom } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { KeycloakProfile } from 'keycloak-js';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { createRequestOption } from 'src/app/common/request-util';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from 'src/app/common/common.service';
import { UserRole } from '../../list-str-case/services/user-role.enum';

export type UserType = UserModel | undefined;
let headers = new HttpHeaders({
  'Access-Control-Allow-Origin': '*',
});

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageAuth = `${environment.appVersion}-${environment.USERDATA_KEY}-profile`;
  private authLocalStorageEntity = `${environment.appVersion}-${environment.USERDATA_KEY}-entity`;
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;
  currentRole$: BehaviorSubject<UserRole> = new BehaviorSubject<UserRole>(
    UserRole.UNKNOWN
  );
  currentEntitySubject: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private keycloakService: KeycloakService,
    private toastr: ToastrService,
    private http: HttpClient,
    private commonService: CommonService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
    if(this.currentRole$.getValue() == UserRole.UNKNOWN) {
      this.updateCurrentRole();
    }
    if(this.currentEntitySubject.getValue() === undefined) {
      this.currentEntitySubject.next(this.getEntityFromLocalStorage());
    }
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
    if (!environment.enable_keycloak) {
      localStorage.removeItem(this.authLocalStorageAuth);
      localStorage.removeItem(this.authLocalStorageToken);
      localStorage.removeItem(this.authLocalStorageEntity);
      this.router.navigate(['/auth/login'], {
        queryParams: {},
      });
    } else {
      localStorage.removeItem(this.authLocalStorageAuth);
      localStorage.removeItem(this.authLocalStorageToken);
      localStorage.removeItem(this.authLocalStorageEntity);
      this.keycloakService.logout(environment.homeUri);
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
  public async setAuthFromLocalStorage(auth: any): Promise<boolean> {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (environment.enable_keycloak) {
      if (this.keycloakService.isLoggedIn()) {
        localStorage.removeItem(this.authLocalStorageAuth);
        localStorage.setItem(this.authLocalStorageAuth, JSON.stringify(auth));

        // update role user login
        await this.updateCurrentRole();

        // save entity info user login
        this.updateCurrentEntity();
 
        this.toastr.info(
          'là vai trò hiện tại',
          this.parseRoleEnumToString(this.currentRole$.getValue())
        );
        return true;
      }
    } else {
      if (auth && auth.authToken) {
        localStorage.setItem(this.authLocalStorageAuth, JSON.stringify(auth));
        return true;
      }
    }

    return false;
  }

  public getAuthFromLocalStorage(): any | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageAuth);
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

  public getEntityFromLocalStorage(): any | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageEntity);
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
      const lsValue = localStorage.getItem(this.authLocalStorageAuth);
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

  public getUserLogin(): any | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageAuth);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData.username;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public getUserToken(): any | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageAuth);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData.token;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  // updateCurrentRole() {
  //   let userProfile = this.getAuthFromLocalStorage();
  //   // if(userProfile && userProfile.username) {
  //   //   if (userProfile.username.toUpperCase().indexOf('I') > -1) {
  //   //     this.currentRole$.next(UserRole.INPUTER);
  //   //   } else if (userProfile.username.toUpperCase().indexOf('A') > -1) {
  //   //     this.currentRole$.next(UserRole.AUTHORISER);
  //   //   } else if (userProfile.username.toUpperCase().indexOf('R') > -1) {
  //   //     this.currentRole$.next(UserRole.REPORTER);
  //   //   } else {
  //   //     this.currentRole$.next(UserRole.UNKNOWN);
  //   //   }
  //   // }
  // }

  async updateCurrentRole() {
    let userProfile = this.getAuthFromLocalStorage();
    if (userProfile && userProfile.email) {
      this.isLoadingSubject.next(true);
      try {
        const res: any = await firstValueFrom(
          this.authHttpService.getUserRole(userProfile.email)
        );
  
        console.log('role', res);
        this.currentRole$.next(res.role);
      } catch (err) {
        console.error('Lỗi lấy quyền người dùng:', err);
      } finally {
        this.isLoadingSubject.next(false);
      }
    }
  }

  updateCurrentEntity() {
    let code = this.getUserLogin().substring(0, 8);
    if(this.getEntityFromLocalStorage() === undefined) {
      this.commonService.getEntityReport(code).subscribe({
        next: (res: any) => {
          if (res.body) {
            let entityInfo = JSON.stringify(res.body);
            localStorage.setItem(this.authLocalStorageEntity, entityInfo);
            this.currentEntitySubject.next(JSON.parse(entityInfo));
          } else {
            console.error('Không có dữ liệu trong response body!');
          }
        },
        error: (err) => {
          console.error('Lỗi khi lấy dữ liệu từ API:', err);
        },
      });
    }
  }

  reloadRole() {
    let userProfile = this.getAuthFromLocalStorage();
    let userRoles: any[] = [];
    if (userProfile.username.toUpperCase().indexOf('I') > -1) {
      this.currentRole$.next(UserRole.INPUTER);
    } else if (userProfile.username.toUpperCase().indexOf('A') > -1) {
      this.currentRole$.next(UserRole.AUTHORISER);
    } else if (userProfile.username.toUpperCase().indexOf('R') > -1) {
      this.currentRole$.next(UserRole.REPORTER);
    } else {
      this.currentRole$.next(UserRole.UNKNOWN);
    }
  }

  isRoleInputer(): boolean {
    if (this.currentRole$.getValue() == UserRole.INPUTER) {
      return true;
    }
    return false;
  }

  isRoleReviewer(): boolean {
    if (this.currentRole$.getValue() == UserRole.AUTHORISER) {
      return true;
    }
    return false;
  }

  isRoleApprove(): boolean {
    if (this.currentRole$.getValue() == UserRole.REPORTER) {
      return true;
    }
    return false;
  }

  async loadCurrentUserProfile() {
    let profile =
      (await this.keycloakService.loadUserProfile()) as KeycloakProfile;
    let token = await this.keycloakService.getToken();
    localStorage.removeItem(this.authLocalStorageToken);
    localStorage.setItem(this.authLocalStorageToken, token);
    console.log(token);
    this.setAuthFromLocalStorage(profile);
  }

  async loadCurrentUserToken() {
    let token = await this.keycloakService.getToken();
    localStorage.removeItem(this.authLocalStorageToken);
    localStorage.setItem(this.authLocalStorageToken, token);
  }

  getUserType(): any {
    let userType = '';
    if (this.isRoleInputer()) {
      userType = 'I'; // Inputer
    } else if (this.isRoleReviewer()) {
      userType = 'R'; // Reviewer
    } else if (this.isRoleApprove()) {
      userType = 'S'; // Approve (Sender)
    }
    return userType;
  }

  getUserRole() {
    return this.currentRole$.asObservable();
  }

  setUserRole(newRole: UserRole) {
    this.currentRole$.next(newRole);
  }

  parseRoleEnumToString(role: UserRole) {
    switch (role) {
      case UserRole.INPUTER:
        return 'Người nhập';
      case UserRole.AUTHORISER:
        return 'Người kiểm soát';
      case UserRole.REPORTER:
        return 'Người phê duyệt';
      case UserRole.ANALYST:
        return 'Cán bộ xử lý';
      case UserRole.MANAGER:
        return 'Lãnh đạo phòng';
      case UserRole.DIRECTOR:
        return 'Lãnh đạo cục';
    }
  }

  parseRoleIntToEnum(intObj: number) {
    switch (intObj) {
      case 0:
        return UserRole.INPUTER;
      case 1:
        return UserRole.AUTHORISER;
      case 2:
        return UserRole.REPORTER;
    }
  }
}
