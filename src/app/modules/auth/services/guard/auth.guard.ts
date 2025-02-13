import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthGuard extends KeycloakAuthGuard {

  constructor(
    protected router: Router,
    protected keycloakService: KeycloakService,
    protected authService: AuthService
  ) {
    super(router, keycloakService);
  }

  isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if(!this.authenticated) {
        this.keycloakAngular.login();
        return resolve(true);
      }

      const userProfile = this.authService.getAuthFromLocalStorage();
      if(userProfile === undefined) {
        this.authService.loadCurrentUserProfile();
      } else {
        if(userProfile.username !== this.keycloakAngular.getUsername()) {
          this.authService.loadCurrentUserProfile();
        }
      }

      let currentRoute: ActivatedRouteSnapshot | null = route;
      let isCurrentRoute = true;

      // while(isCurrentRoute) {
      //   if(currentRoute.children[0]) {
      //     currentRoute = currentRoute.children[0];
      //   } else {
      //     isCurrentRoute = false;
      //   }
      // }
      // console.log(currentRoute);
      // console.log(route);
      const requiredRoles = currentRoute.data.roles;
      let userRoles: string[] = [];
      const tokenParsed = this.keycloakAngular.getKeycloakInstance().tokenParsed;
      if(tokenParsed && tokenParsed['resource_access']) {
        userRoles = tokenParsed['resource_access'][environment.keycloakConfig.clientId].roles;
      }
      
      if(!requiredRoles || requiredRoles.length === 0) {
        resolve(true);
      } else {
        if(!userRoles || userRoles.length === 0) {
          resolve(false);
        }
        let granted: boolean = false;
        for(const requiredRole of requiredRoles) {
          if(userRoles.indexOf(requiredRole) > -1) {
            granted = true;
            break;
          }
        }
        resolve(granted);
      }
    })
  }
}
