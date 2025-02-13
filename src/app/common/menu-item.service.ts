import { Injectable } from '@angular/core';
import { MenuItem } from '../model/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {

  lstMenuItem: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: 'element-11', child: [], role: ['approver'], active: false},
    { title: 'Danh sách STR', path: '/list-str-case', icon: 'element-11', child: [], role: ['approver'], active: false},
    { title: 'Nhập STR', path: '/list-str', icon: 'profile-circle', child: [
      { title: 'Mẫu số 01', path: '/report-str/report-one', icon: 'bullet bullet-dot', child: [], role: ['approver'], active: false},
      { title: 'Mẫu số 02', path: '/report-str/report-two', icon: 'bullet bullet-dot', child: [], role: ['inputer'], active: false},
      { title: 'Mẫu số 03', path: '/report-str/report-three', icon: 'bullet bullet-dot', child: [], role: ['reviewer'], active: false}
    ], role: ['inputer'], active: false},
    
  ]

  constructor() { }

  getMenuItem(): MenuItem[] {
    return this.lstMenuItem;
  }

  
  
}
