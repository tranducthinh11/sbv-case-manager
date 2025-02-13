import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { DashBoardData } from './fake_dashboard';
import { Observable } from 'rxjs';
import { DasBoardService } from './service/dashboard.service';
import { HttpResponse } from '@angular/common/http';
import { CountModel, DashboardResponse } from './model/dashboard.model';
import { AuthService } from 'src/app/modules/auth';

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
  constructor(
    private dashboardService: DasBoardService,
    private  authService: AuthService
  ) {

  }

  ngOnInit(): void {

    this.search();
  }

  search(){
    const userId = 1;
    const userType = 'I';
    //const userId = this.authService.getUserIDLogin();
    //const userType = this.authService.getUserType();
    this.isLoading = true;
    this.dashboardService.getDashBoard({
      userId: userId,
      userType: userType
    }).subscribe({
      next: (res: HttpResponse<DashboardResponse>) => {
        this.isLoading = false;
        this.onSearchSuccess(res.body);
      },
      error: () => {this.isLoading = false},
    }); 

  };

  private onSearchSuccess(res: DashboardResponse | null): void {
    console.log('Data Dashboard ', res?.myList);
    this.myListStr =  res?.myList ;
    this.allListStr =  res?.summary ;
  }

  getNameStatus(value: number){
    if(value == 1){
      return 'Đang nhập liệu';
    }
    if(value == 2){
      return 'Chờ kiểm soát';
    }
    if(value == 3){
      return 'Kiểm soát chưa đạt';
    }
    if(value == 4){
      return 'Chờ duyệt';
    }
    if(value == 5){
      return 'Đã gửi cục PCRT';
    }
    if(value == 6){
      return 'Không phê duyệt';
    }
    if(value == 7){
      return 'PCRT xác nhận';
    }
    if(value == 8){
      return 'PCRT hoàn';
    }
  }
}
