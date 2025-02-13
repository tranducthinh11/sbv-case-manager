import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Config } from 'datatables.net';
import { Observable } from 'rxjs';
import { NgForm, FormsModule } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesResponse, IUserModel, UserService } from 'src/app/_fake/services/user-service';
import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';
import { AgencyComponent } from '../../report-str/component/agency/agency.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DasBoardService } from 'src/app/pages/dashboard/service/dashboard.service';
import { HttpResponse } from '@angular/common/http';
import { CountModel, DashboardResponse } from 'src/app/pages/dashboard/model/dashboard.model';

@Component({
  selector: 'app-report-one',
  templateUrl: './report-one.component.html',
})
export class ReportOneComponent implements OnInit {

  myListStr: CountModel[] ;
    allListStr:  CountModel[] ;
  constructor(private apiService: UserService, private modalService: NgbModal, private dashboardService: DasBoardService) { 
    this.search();


  }

  search(){
      const userId = 1;
      const userType = 'C';
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
      console.log('Data AAAAAAAAAAAAAAA ', res?.myList);
      this.myListStr =  res?.myList ;
      this.allListStr =  res?.summary ;
      
  
    }

  informationUsers: any[] = [{ career: '', role: '', district: '', province: '', nation: '' }]; // Khởi tạo với một đối tượng ban đầu

  twoLegalRepresentative: any[] = [{
    reportName: '', dateOfBirth: '', nationality: '', career: '', role: '', addressDistrict: '',
    addressProvince: '', addressNation: '', placeDistrict: '', placeProvince: '', placeNation: '', place: '', identityType: '',
    identityNumber: '', identityAgency: '', identityPlace: '', identityCreateDate: '', identityExpiredDate: '', phonenumber: ''
  }];

  threePersonalTransaction: any[] = [{
    reportName: '', dateOfBirth: '', nationality: '', career: '', role: '', addressDistrict: '',
    addressProvince: '', addressNation: '', placeDistrict: '', placeProvince: '', placeNation: '', place: '', identityType: '',
    identityNumber: '', identityAgency: '', identityPlace: '', identityCreateDate: '', identityExpiredDate: '', phonenumber: ''
  }];

  bankAccountNumber: any[] = [];
  threeBankAccountNumber: any[] = [];
  fourInToBankList: any[] = [];
  fourOutToBankList: any[] = [];

  items = ['First', 'Second', 'Third'];

  isAdvandSearch: boolean = false;

  goViewPage(item?: any) {
    const modalRef = this.modalService.open(AgencyComponent, { size: 'xl' });
    modalRef.componentInstance.initialData = item;

    modalRef.result.then((result) => {
      console.log("Kết quả nhận được từ modal:", result);

      if (result) {
        this.threeBankAccountNumber.push(result); // Push object vào mảng
        console.log("bankAccountNumber", this.threeBankAccountNumber);
      }
    }, (reason) => {
      console.log('Modal bị đóng với lý do:', reason);
    });
  }

  isCollapsed1 = false;
  isCollapsed2 = true;

  isCollapsed3 = false;

  datatableConfig: Config = {};
  isLoading = false;


  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aUser: Observable<IUserModel>;
  userModel: IUserModel = { id: 0, name: '', email: '', role: '' };
  selectedAccount: string = ''; // Khởi tạo giá trị mặc định là rỗng

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  roles$: Observable<DataTablesResponse>;

  addUser() {
    this.informationUsers.push({ career: '', role: '', district: '', province: '', nation: '' });
  }

  removeUser(index: number) {
    this.informationUsers.splice(index, 1);
  }

  // Dynamic number of record in "1. Thông tin về cá nhân liên quan đến giao dịch"
  threePersonalAddUser() {
    this.threePersonalTransaction.push({
      reportName: '', dateOfBirth: '', nationality: '', career: '', role: '', addressDistrict: '',
      addressProvince: '', addressNation: '', placeDistrict: '', placeProvince: '', placeNation: '', place: '', identityType: '',
      identityNumber: '', identityAgency: '', identityPlace: '', identityCreateDate: '', identityExpiredDate: '', phonenumber: ''
    });
  }

  threePersonalRemoveUser(index: number) {
    this.threePersonalTransaction.splice(index, 1);
  }

  // Dynamic number of record in "2.2. Thông tin về người đại diện theo pháp luật của tổ chức"
  twoLegalRepresentativeAdd() {
    this.twoLegalRepresentative.push({
      reportName: '', dateOfBirth: '', nationality: '', career: '', role: '', addressDistrict: '',
      addressProvince: '', addressNation: '', placeDistrict: '', placeProvince: '', placeNation: '', place: '', identityType: '',
      identityNumber: '', identityAgency: '', identityPlace: '', identityCreateDate: '', identityExpiredDate: '', phonenumber: ''
    });
  }

  twoLegalRepresentativeRemove(index: number) {
    this.twoLegalRepresentative.splice(index, 1);
  }

  // Dynamic table in bank account number
  addRow() {
    this.bankAccountNumber.push({ accountNumber: '', bankName: '', moneyType: '', accountType: '', createDate: '', status: '' });
  }
  deleteRow(index: number) {
    this.bankAccountNumber.splice(index, 1);
  }

  // Dynamic table in list bank 
  fourInAddRow() {
    this.fourInToBankList.push({ accountName: '', idNumber: '', bankNumber: '', bankName: '', totalCost: '', totalTran: '', rangeDate: '', typeMoney: '', description: '' });
  }
  fourInDeleteRow(index: number) {
    this.fourInToBankList.splice(index, 1);
  }

  // Dynamic table out list bank
  fourOutAddRow() {
    this.fourOutToBankList.push({ accountName: '', idNumber: '', bankNumber: '', bankName: '', totalCost: '', totalTran: '', rangeDate: '', typeMoney: '', description: '' });
  }
  fourOutDeleteRow(index: number) {
    this.fourOutToBankList.splice(index, 1);
  }

  // Delete list bank at threeBankAccountNumber
  threeDeleteAgencyList(index: number) {
    this.threeBankAccountNumber.splice(index, 1);
  }

  ngOnInit(): void {

  }

  toggleAdvanceSearch() {
    this.isAdvandSearch = !this.isAdvandSearch;
  }

  create() {
    this.userModel = { id: 0, name: '', email: '', };
  }

  delete(id: number) {
    this.apiService.deleteUser(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  edit(id: number) {
    this.aUser = this.apiService.getUser(id);
    this.aUser.subscribe((user: IUserModel) => {
      this.userModel = user;
    });
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }
  }
}
