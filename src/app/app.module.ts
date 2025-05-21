import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ToastrModule } from 'ngx-toastr';
// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { KeycloakService } from 'keycloak-angular';
import { AuthInterceptor } from './modules/list-str/services/auth.interceptor';

// #fake-end#

function kcInitializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: environment.keycloakConfig,
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: false
          },
          loadUserProfileAtStartUp: true,
          enableBearerInterceptor: true,
        });
        resolve(true);
      } catch(error) {
        console.log("Error throw in init " + error);
        reject(error);
      }
    })
  };
}

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      //@ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 10000,  // Thời gian hiển thị (10s)
      positionClass: 'toast-top-right', // Vị trí hiển thị
      preventDuplicates: true, // Tránh hiển thị trùng
    }), 
    HttpClientModule,
    ClipboardModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
    SweetAlert2Module.forRoot(),

  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: kcInitializer,
      multi: true,
      deps: [KeycloakService],
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: appInitializer,
    //   multi: true,
    //   deps: [AuthService],
    // },
    KeycloakService,
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    { provide: LOCALE_ID, useValue: 'vi' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
