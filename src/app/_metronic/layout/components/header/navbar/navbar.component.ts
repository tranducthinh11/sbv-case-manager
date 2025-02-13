import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { menuReinitialization } from 'src/app/_metronic/kt/kt-helpers';
import { AuthService, UserType } from '../../../../../modules/auth';
import { Observable, Subscription } from 'rxjs';
import { KeycloakProfile } from 'keycloak-js';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
	@Input() appHeaderDefaulMenuDisplay: boolean;
	@Input() isRtl: boolean;
	user$: KeycloakProfile | undefined;
	user2$: Observable<UserType>;

	itemClass: string = 'ms-1 ms-lg-3';
	btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
	userAvatarClass: string = 'symbol-35px symbol-md-40px';
	btnIconClass: string = 'fs-2 fs-md-1';

	isEnableKeycloak: boolean = true;

	constructor(
		private auth: AuthService,
	) { 
		this.isEnableKeycloak = environment.enable_keycloak;
		if(this.isEnableKeycloak) {
			this.user$ = this.auth.getAuthFromLocalStorage();
		} else {
			this.user2$ = this.auth.currentUserSubject.asObservable();
		}
	}

	ngAfterViewInit(): void {
		menuReinitialization();
	}

	ngOnInit(): void { }

}
