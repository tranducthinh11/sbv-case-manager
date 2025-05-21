import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { AssignmentService } from './service/assignment.service';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { CountModel, DashboardResponse } from './model/dashboard.model';
import { AuthService } from 'src/app/modules/auth';
import { STRConstant } from 'src/app/common/str-case.constant';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss']
})
export class AssignmentComponent implements OnInit{
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
    private assignmentService: AssignmentService,
    private  authService: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {

    this.search();

    this.assignmentService.getAssignment({
      fromDate : "2025-01-01",
      toDate: "2025-07-11"
    }).subscribe({
      next: res =>{
        console.log('Assignment: ', res);
      },error: res => {
        console.log('Lỗi : ', res);
      }
    });
  }

  search(){
    //const userId = 1;
    //const userType = 'I';
    const userId = this.authService.getUserLogin();
    //const userType = this.authService.getUserType();
    this.isLoading = true;
    this.assignmentService.getDashBoard({
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
