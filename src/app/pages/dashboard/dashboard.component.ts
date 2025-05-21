import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { DashBoardData } from './fake_dashboard';
import { Observable } from 'rxjs';
import { DasBoardService } from './service/dashboard.service';
import { HttpResponse } from '@angular/common/http';
import { CountModel, DashboardResponse } from './model/dashboard.model';
import { AuthService } from 'src/app/modules/auth';
import { STRConstant } from 'src/app/common/str-case.constant';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  

  isLoading = false;
  theProducts: Observable<any[]>;
  //myListStr: any[] = DashBoardData.myListStr;
  //allListStr: any[] = DashBoardData.allListStr;
  myListStr: CountModel[] ;
  allListStr:  CountModel[] ;
  listStatus: any[] = STRConstant.statusList;
  constructor(
    private dashboardService: DasBoardService,
    private  authService: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {

    this.search();
  }

  search(){
    //const userId = 1;
    //const userType = 'I';
    const userId = this.authService.getUserLogin();
    //const userType = this.authService.getUserType();
    this.isLoading = true;
    this.dashboardService.getDashBoard({
      userId: userId,
      userType: ''
    }).subscribe({
      next: (res: HttpResponse<DashboardResponse>) => {
        this.isLoading = false;
        this.onSearchSuccess(res.body);
      },
      error: () => {this.isLoading = false},
    }); 

  };

  private onSearchSuccess(res: DashboardResponse | null): void {
    
    this.myListStr =  res?.myList;
    this.allListStr =  res?.summary;
  }
  
  // private sortList(listStr:any){
  //   let result= [];
  //   if(listStr.length  <= 0){
  //     return;
  //   }
  //     for (let a of listStr) {
  //       if (a.creation_status === 'DANG_NHAP_LIEU'){
  //         result.push(a);
  //       }; 
  //       break;
  //   }

  //     for (let a of listStr) {
  //       if (a.creation_status === 'CHO_KIEM_SOAT'){
  //         result.push(a);
  //       }; 
  //       break;
  //     }
  //     for (let a of listStr) {
  //       if (a.creation_status === 'KIEM_SOAT_CHUA_DAT'){
  //         result.push(a);
  //       }; 
  //       break;
  //     }
  //     for (let a of listStr) {
  //       if (a.creation_status === 'CHO_DUYET'){
  //         result.push(a);
  //       }; 
  //       break;
  //     }

  //     for (let a of listStr) {
  //       if (a.creation_status === 'DA_GUI'){
  //         result.push(a);
  //       }; 
  //       break;
  //     }
  //     for (let a of listStr) {
  //       if (a.creation_status === 'KHONG_PHE_DUYET'){
  //         result.push(a);
  //       }; 
  //       break;
  //     }

  //     for (let a of listStr) {
  //       if (a.creation_status === 'PCRT_XAC_NHAN'){
  //         result.push(a);
  //       }; 
  //       break;
  //     }
  //     for (let a of listStr) {
  //       if (a.creation_status === 'PCRT_HOAN'){
  //         result.push(a);
  //       }; 
  //       break;
  //     }
  //     return result;
  // }

  toListStr(status: string){
    const userId = this.authService.getUserLogin();
    const userType = this.authService.getUserType();
    this.router.navigate(['/list-str',{filterBy:'myList', status:status }]);
    

  }

  getNameStatus(value: string) {
    let obj = this.listStatus.find(o => o.code === value); 
    if(obj!== undefined && obj !== null){
      return obj.name;
    }
    return '';
    
  }
  
}
