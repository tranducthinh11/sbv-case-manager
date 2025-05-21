import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  constructor(
    private keycloakService: KeycloakService,
    private toastr: ToastrService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token = localStorage.getItem(this.authLocalStorageToken); // Lấy token từ localStorage trước

    if (token && !this.isTokenExpired(token)) {
      // Nếu token hợp lệ, dùng luôn
      return this.handleRequestWithToken(req, next, token);
    } else {
      // Nếu không có token hoặc hết hạn, gọi KeycloakService để lấy token mới
      return from(this.keycloakService.getToken()).pipe(
        mergeMap((newToken) => {
          if (newToken) {
            // Cập nhật token mới vào localStorage
            localStorage.setItem(this.authLocalStorageToken, newToken);
            return this.handleRequestWithToken(req, next, newToken);
          }
          return next.handle(req); // Nếu không có token, gửi request bình thường
        }),
        catchError((err) => {
          console.error('Error getting Keycloak token', err);
          this.toastr.error('Phiên đăng nhập không hợp lệ!', 'Xác thực');
          //   return throwError(() => new Error('Authentication failed'));
          return next.handle(req);
        })
      );
    }
  }

  private handleRequestWithToken(
    req: HttpRequest<any>,
    next: HttpHandler,
    token: string
  ): Observable<HttpEvent<any>> {
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next.handle(clonedReq);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã JWT
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now; // Hết hạn nếu `exp` < thời gian hiện tại
    } catch (e) {
      return true; // Token không hợp lệ
    }
  }
}
