import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { menuReinitialization } from 'src/app/_metronic/kt/kt-helpers';
import { AuthService, UserType } from '../../../../../modules/auth';
import { Observable, Subscription } from 'rxjs';
import { KeycloakProfile } from 'keycloak-js';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/common/common.service';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
	private authLocalStorageEntity = `${environment.appVersion}-${environment.USERDATA_KEY}-entity`;

	@Input() appHeaderDefaulMenuDisplay: boolean;
	@Input() isRtl: boolean;
	user$: KeycloakProfile | undefined;
	entity$: any | undefined;
	user2$: Observable<UserType>;
	roleName: string;

	itemClass: string = 'ms-1 ms-lg-3';
	btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
	userAvatarClass: string = 'symbol-35px symbol-md-40px';
	btnIconClass: string = 'fs-2 fs-md-1';

	isEnableKeycloak: boolean = true;

	constructor(
		private auth: AuthService,
		private commonService: CommonService
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

	ngOnInit(): void { 
		this.auth.currentRole$.subscribe((role)=> {
			this.roleName = this.auth.parseRoleEnumToString(role);
		})
		this.auth.currentEntitySubject.subscribe((entity) => {
			this.entity$ = entity;
		})
	}
}
