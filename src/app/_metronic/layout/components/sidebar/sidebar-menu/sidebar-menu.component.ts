import { Component, OnInit } from '@angular/core';
import { KeycloakRoles } from 'keycloak-js';
import { CommonService } from 'src/app/common/common.service';
import { MenuItem } from 'src/app/model/menu-item.model';
import { AuthService } from 'src/app/modules/auth';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  private authLocalStorageEntity = `${environment.appVersion}-${environment.USERDATA_KEY}-entity`;
  
  lstMenuItem: MenuItem[] = [];
  lstRoles = [];

  constructor(
    private authService: AuthService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.lstMenuItem = this.commonService.getMenuItem();
    if(environment.enable_keycloak) {
      this.grantMenuWithoutKeycloak();
    } else {
      this.grantMenuWithoutKeycloak();
    }
  }

  grantMenuWithoutKeycloak() {
    for(let menuItem of this.lstMenuItem) {
      menuItem.active = true;
      let childMenu = menuItem.child;
      while(childMenu?.length! > 0) {
        for(const itemChild of childMenu ?? []) {
          itemChild.active = true;
          childMenu = itemChild.child;
        }
        childMenu = [];
      }
    }
  }

  grantMenu() {
    this.authService.currentEntitySubject.subscribe((entity) => {
      if(entity !== undefined) {
        let type_code = entity.type_code;

        // show menu with type_code
        this.showMenu(type_code);
      }
    })
  }

  showMenu(type_code: string) {
    this.lstRoles.push(this.authService.currentRole$.getValue());
    if(this.lstRoles === undefined) {
      this.lstRoles = [];
    }

    if(this.lstRoles.length === 0) {
      for(let menuItem of this.lstMenuItem) {
        menuItem.active = true;
        let childMenu = menuItem.child;
        while(childMenu?.length! > 0) {
          for(const itemChild of childMenu ?? []) {
            itemChild.active = true;
            childMenu = itemChild.child;
          }
          childMenu = [];
        }
      }
    } else {
      for(let menuItem of this.lstMenuItem) {
        let grant: boolean = false;
        if(menuItem.role.length === 0) {
          grant = true;
        } else {
          for(const role of menuItem.role ?? []) {
            if(this.lstRoles.indexOf(role) > -1) {
              grant = true;
              break;
            }
          }
        }
        
        menuItem.active = grant;
        
        let childMenu = menuItem.child;
        while(childMenu?.length! > 0) {
          for(const itemChild of childMenu ?? []) {
            let grantChild: boolean = false;
            if(itemChild.role.length === 0) {
              grantChild = true;
            } else {
              for(const role of itemChild.role ?? []) {
                if(this.lstRoles.indexOf(role) > -1) {
                  grantChild = true;
                  break;
                }
              }
            }
            if(itemChild.type === type_code) {
              grantChild = true;
            } else {
              grantChild = false;
            }
            itemChild.active = grantChild;
            childMenu = itemChild.child;
          }
          childMenu = [];
        }
      }
    }
  }
}
