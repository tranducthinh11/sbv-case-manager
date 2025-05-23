import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TranslationService } from '../../../../../../modules/i18n';
import { AuthService, UserType } from '../../../../../../modules/auth';
import { KeycloakProfile } from 'keycloak-js';
import { environment } from 'src/environments/environment';
import { UserRole } from 'src/app/modules/list-str-case/services/user-role.enum';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  language: LanguageFlag;
  user$: KeycloakProfile | undefined;
  currentRole$: UserRole;
  langs = languages;
  private unsubscribe: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    console.log("User inner");
    const userProfile = this.auth.getAuthFromLocalStorage();
    this.user$ = this.auth.getAuthFromLocalStorage();
    this.setLanguage(this.translationService.getSelectedLanguage());
    this.auth.getUserRole().subscribe(role => {
      this.currentRole$ = role;
    });
  }

  logout() {
    if(environment.enable_keycloak) {
      this.auth.logout();
    } else {
      this.auth.logout();
      document.location.reload();
    }
  }

  // fakeRoleToInputer() {
  //   this.auth.setUserRole(UserRole.INPUTER);
  // }
  // fakeRoleToAuthoriser() {
  //   this.auth.setUserRole(UserRole.AUTHORISER);
  // }
  // fakeRoleToRepoter() {
  //   this.auth.setUserRole(UserRole.REPORTER);
  // }

  getRoleName() {
    switch (this.currentRole$) {
      case UserRole.UNKNOWN: return 'Không xác định';
      case UserRole.INPUTER: return 'Người nhập thông tin';
      case UserRole.AUTHORISER: return 'Người kiểm soát';
      case UserRole.REPORTER: return 'Người phê duyệt ';
    }
  }

  selectLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.setLanguage(lang);
    // document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
  },
  {
    lang: 'zh',
    name: 'Mandarin',
    flag: './assets/media/flags/china.svg',
  },
  {
    lang: 'es',
    name: 'Spanish',
    flag: './assets/media/flags/spain.svg',
  },
  {
    lang: 'ja',
    name: 'Japanese',
    flag: './assets/media/flags/japan.svg',
  },
  {
    lang: 'de',
    name: 'German',
    flag: './assets/media/flags/germany.svg',
  },
  {
    lang: 'fr',
    name: 'French',
    flag: './assets/media/flags/france.svg',
  },
];
