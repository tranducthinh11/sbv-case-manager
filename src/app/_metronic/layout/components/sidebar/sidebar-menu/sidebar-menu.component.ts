import { Component, OnInit } from '@angular/core';
import { KeycloakRoles } from 'keycloak-js';
import { MenuItemService } from 'src/app/common/menu-item.service';
import { MenuItem } from 'src/app/model/menu-item.model';
import { AuthService } from 'src/app/modules/auth';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  
  lstMenuItem: MenuItem[] = [];
  lstRoles: string[] | undefined;

  constructor(
    private authService: AuthService,
    private meuItemService: MenuItemService
  ) { }

  ngOnInit(): void {
    this.lstMenuItem = this.meuItemService.getMenuItem();
    if(environment.enable_keycloak) {
      this.grantMenu();
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
    this.lstRoles = this.authService.getResourceAccess();
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
        for(const role of menuItem.role ?? []) {
          if(this.lstRoles.indexOf(role) > -1) {
            grant = true;
            break;
          }
        }
        menuItem.active = grant;
        
        let childMenu = menuItem.child;
        while(childMenu?.length! > 0) {
          for(const itemChild of childMenu ?? []) {
            let grantChild: boolean = false;
            for(const role of itemChild.role ?? []) {
              if(this.lstRoles.indexOf(role) > -1) {
                grantChild = true;
                break;
              }
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
