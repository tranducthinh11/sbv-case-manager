import { Injectable } from "@angular/core";
import { KeycloakService } from "keycloak-angular";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class KeycloakAuthInfo {
    
    constructor(private keycloakService: KeycloakService) {}

    getResourceAccess() {
        const tokenParsed = this.keycloakService.getKeycloakInstance().tokenParsed;
        if(tokenParsed && tokenParsed['resource_access']) {
            return tokenParsed['resource_access'][environment.keycloakConfig.clientId];
        }
        return null;
    }
}