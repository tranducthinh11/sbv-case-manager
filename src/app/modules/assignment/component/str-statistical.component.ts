import { Component, Input, OnInit } from '@angular/core';
import { AssignmentService } from '../service/assignment.service';
import { HttpResponse } from '@angular/common/http';
import { CountModel, DashboardResponse } from '../model/dashboard.model';
import { AuthService } from 'src/app/modules/auth';
import { Router } from '@angular/router';
import { STRConstant } from 'src/app/common/str-case.constant';
import { UserRole } from 'src/app/modules/list-str-case/services/user-role.enum';

@Component({
  selector: 'str-statistical',
  templateUrl: './str-statistical.component.html'
})
export class STRStatisticalComponent implements OnInit{
  @Input() type: number; // 0: Thông tin tổng quan; 1: STR của tôi
  lstYear: (any | undefined)[] = [];
  lstTab: { key: string; label: string }[] = [
    { key: 'tab_mau_bao_cao', label: 'Mẫu báo cáo' },
    { key: 'tab_trang_thai', label: 'Trạng thái' },
    { key: 'tab_muc_uu_tien', label: 'Mức ưu tiên' }
  ];
  selectedYearValue: number;
  isLoading = false;
  allListStr:  CountModel[];
  countAllSTR: number = 0;
  activeTab: string
  selectedIndex: number | null = null;

  constructor(
    private dashboardService: AssignmentService,
    private  authService: AuthService,
    private router: Router
  ) {
    
  }

  ngOnInit(): void {
    // if(this.type == 1)
    //   this.lstTab = [this.lstTab[1]];
    // this.activeTab = this.lstTab[0].key;
    // this.get5Year();
  }

  

  toggleDetail(index: number): void {
    this.selectedIndex = this.selectedIndex === index ? null : index;
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.getData(this.selectedYearValue, tab);
  }

  activeClass(tab: string) {
    return tab === this.activeTab ? 'show active' : '';
  }
  
  get5Year() {
    let currentYear =  new Date().getFullYear();
    for(let i = 0; i < 5; i++){
      this.lstYear.push(Number(currentYear - i));
    }
    this.selectedYearValue = currentYear;
    this.getData(this.selectedYearValue, this.activeTab);
  }

  onChangeSelectedYear() {
    const  yearSearch = this.selectedYearValue;
    this.getData(yearSearch, this.activeTab);
  }

  redirectLink(tab: string, value: string) {
    let role = this.authService.currentRole$.getValue();
    let isAll = this.type == 0 || role == UserRole.MANAGER || role == UserRole.DIRECTOR;
    switch (tab) {
      case "tab_mau_bao_cao":
        this.router.navigate(['/list-str-case', { year: this.selectedYearValue, isAll: isAll, reportStatus: '', strType: value }]);
        break;
      case "tab_trang_thai":
        this.router.navigate(['/list-str-case', { year: this.selectedYearValue, isAll: isAll, reportStatus: value }]);
        break;
      case "tab_muc_uu_tien":
        this.router.navigate(['/list-str-case', { year: this.selectedYearValue, isAll: isAll, reportStatus: '', priority: value }]);
        break;
      default:
        break;
    }
  }

  getData(yearSearch:number, tab: string){
    const userLogin = this.authService.getAuthFromLocalStorage();
    this.dashboardService.getCaseDashBoard({
      userLogin: userLogin.email,
      year: yearSearch,
      tab: tab
    }, this.type).subscribe({
      next: (res: HttpResponse<DashboardResponse>) => {
        this.isLoading = false;
        this.onSearchSuccess(res.body);
      },
      error: () => {this.isLoading = false},
    }); 
  }

  private onSearchSuccess(res: DashboardResponse | null): void {
    this.countAllSTR =  res?.countAllSTR;
    this.allListStr =  res?.summary;
  }
  
  parseInfo(info): string {
    switch (this.activeTab) {
      case "tab_mau_bao_cao":
        return STRConstant.myListStrCase?.find(x => x?.code == info)?.name;
      case "tab_trang_thai":
        return STRConstant.statusCaseManagerList?.find(x => x?.code == info)?.name;
      case "tab_muc_uu_tien":
        return info;
      default:
        return info;
    }
  }
}
