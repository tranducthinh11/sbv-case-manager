import { Component, ElementRef, EventEmitter, HostListener, model, OnInit, ViewChild } from '@angular/core';
import { Config } from 'datatables.net';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, NgForm } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutService } from 'src/app/_metronic/layout';
import {
  DataTablesResponse,
} from './services/report-list-str.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewListSTRCaseComponent } from './preview-list-str-case/preview-list-str-case.component';
import { AuthService, UserType } from '../auth';
import { UserRole } from './services/user-role.enum';
import { ToastrService } from 'ngx-toastr';
import { STRConstant } from 'src/app/common/str-case.constant';
import { STRListCaseService } from './services/list-str-case.service';

import $, { data } from "jquery";
import "select2";
import { ReportEntities } from 'src/app/model/report-entities.model';
import { UpdateListSTRCaseComponent } from './update-list-str-case/update-list-str-case.component';
@Component({
  selector: 'app-list-str',
  templateUrl: './list-str-case.component.html',
  styleUrl: './list-str-case.component.scss'
})
export class ListStrCaseComponent implements OnInit {
  //declare
  isAdvandSearch: boolean = false;
  currentPickingItem: any;
  datatableConfig: Config = {};
  isLoading = true;
  strReportEntities: ReportEntities[];
  reportEntities: any[] = [];
  strUsers: any[] = [];
  strFullUser: any[] = [];
  crimes: any[] = [];
  reportStatusParam: string[]=[];
  selectedStrIdList: number[] = [];
  selectAllCheckbox : boolean = false;

  // private reportSubscription: Subscription | undefined;
  
  //danh sách STR
  strTypeList = STRConstant.myListStrCase;

  //trạng thái 
  statusList = STRConstant.statusCaseManagerList;

  //Danh sách thứ tự ưu tiên
  priorityList = STRConstant.priorityList;

  // Reload emitter inside datatable
  // reloadEvent: EventEmitter<boolean> = new EventEmitter();
  public searchResultData: DataTablesResponse | null;
  roles$: Observable<DataTablesResponse>;
  pageIndex: number = 0;
  totalPage: number = 0;
  pageSize: number = 10;
  filterData!: string;

  public searchForm = new FormGroup({
    rptEntity: new FormControl(''),
    reportNo: new FormControl(null),
    amldNumber: new FormControl(null),

    strType: new FormControl('', { nonNullable: true }),
    reportStatus: new FormControl([]),
    crime: new FormControl('', { nonNullable: true }),
    priority: new FormControl('', { nonNullable: true }),
    processor: new FormControl('', { nonNullable: true }),

    fromDate: new FormControl('', { validators: [] }),
    toDate: new FormControl(null, { validators: [] }),
    
    //sizing
    pageSize: new FormControl(this.pageSize),
    pageIndex: new FormControl(this.pageIndex),
  });

  // state management
  currentUserProfile$: UserType = null;
  currentUserRole$ = UserRole.UNKNOWN;
  recordActiveIndex: number = null;

  constructor(
    private modalService: NgbModal,
    private layout: LayoutService,
    private strService: STRListCaseService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private eRef: ElementRef
  ) {
  }

  ngOnInit(): void {
    
    // load user states
    this.currentUserProfile$ = this.authService.getAuthFromLocalStorage();
    console.log('profile', this.currentUserProfile$);

    //get report entities 
    this.strService.getReportEntities().subscribe(data => {
      this.reportEntities = data;
    });

    // Lấy tham số từ Dashboard
    this.route.paramMap.subscribe(params => {

      //set input strType and priority
      this.searchForm.patchValue({
        strType: params.get('strType') != null ? params.get('strType') : '',
        priority: params.get('priority') != null ? params.get('priority') : ''
      });

      let status = params.get('reportStatus');
      // @ts-ignore
      var select3 = $("#your-select-element-2").select2();
      select3.data('select2').$selection.css('height', '40px', );
      select3.data('select2').$selection.css('border', '1px solid var(--bs-gray-300)', );
      select3.data('select2').$selection.css('overflow-x', 'hidden', );
      select3.data('select2').$selection.css('overflow-y', 'scroll', );

      $(document).ready(() => {
        if(status != null){
            select3.val([this.getStatusFromSelect(status)]).trigger("change");
        }else{
          select3.val([this.getStatusFromSelect("CHO_TIEP_NHAN")]).trigger("change");
        }
      });

      this.searchForm.patchValue({
        reportStatus: status != null ? (status == '' ? [] : [status]) : ["CHO_TIEP_NHAN"]
      });

      //set date
      let year = params.get('year');
      if(year) {
        this.searchForm.patchValue({
          fromDate: this.getParseDateToString(new Date(+year, 0, 1)),
          toDate: this.getParseDateToString(new Date(+year, 11, 31))
        });
        console.log("search form: ", this.searchForm.value);        
      }
      
      //set cán bộ xử lý
      let isAll = params.get('isAll');
      if(isAll == 'false') {
        this.searchForm.value.processor = '' + this.currentUserProfile$.email;
        this.searchForm.patchValue({
          processor: this.currentUserProfile$.email
        });
      }
    });

    this.authService.getUserRole().subscribe((role) => {
      console.log('updated role to ' + role);
      this.currentUserRole$ = role;
    });

    console.log("this.searchForm.value: ", this.searchForm.value);

    this.strService.updateSearchListSTRCase (
      { page: this.pageIndex, size: this.pageSize, sort: ['ngay_bao_cao', 'asc'] }, this.searchForm.value
    );

    // do default search
    this.strService.searchingSTRListCaseData$.subscribe((data) => {
      console.log('searched updated data', data);
      this.isLoading = false;
      if (data != null) {
        this.isLoading = false;
      }
      
      this.searchResultData = data;
      this.pageIndex = data.pageInfo.pageIndex;
      this.totalPage = data.pageInfo.pageTotal;
      this.pageSize = data.pageInfo.pageSize;
    });

    //get strUsers
    this.strService.getStrUser('A').subscribe(data =>{
      this.strUsers = data;
    })

    this.strService.getStrUser('').subscribe(data =>{
      this.strFullUser = data;
    })

    //get crimes 
    this.strService.getCrimes().subscribe(data =>{
      this.crimes = data;
    })

  }

  //function: Tìm kiếm dữ liệu
  onSearch(validateInput = true) {
    
    if (this.isLoading) return;
    this.isLoading = true;
    // @ts-ignore
    let value = $('#your-select-element').select2('data');
    this.searchForm.value.rptEntity = value[0].id;

    // @ts-ignore
    let statusValue = $('#your-select-element-2').select2('data');
    this.reportStatusParam = [];
    for (let i = 0; i < statusValue.length; i++) {
      this.reportStatusParam.push(statusValue[i]?.title);
    }
    this.searchForm.value.reportStatus = this.reportStatusParam;

    // todo: validate input
    if (validateInput) {
      
    }

    console.log("valueSearch: ", this.searchForm.value);

    this.strService.updateSearchListSTRCase(
      {
        page: this.pageIndex,
        size: this.pageSize,
        sort: ['ngay_bao_cao', 'asc'],
      },
      this.searchForm.value
    );
  }

  //function: Xóa dữ liệu tìm kiếm
  clearSearch() {
    console.log('clear search');
    console.log()
    // @ts-ignore
    const select2Element = $("#your-select-element");

    if (select2Element.length) {
      select2Element.val(null).trigger('change');
    }

    // @ts-ignore
    const select2Element2 = $("#your-select-element-2");

    if (select2Element2.length) {
      select2Element2.val(null).trigger('change');
    }

    this.searchForm.setValue({
      rptEntity: '',
      reportNo: '',
      amldNumber: '',
      strType: '',
      reportStatus: [],
      crime: '',
      priority: '',
      processor: '',
      fromDate: null,
      toDate: null,
      pageSize: this.pageSize,
      pageIndex: this.pageIndex
    });
  }

  //function: Xem chi tiết
  onPreview(item: any) {
    this.currentPickingItem = item;
    let modalRef = this.modalService.open(PreviewListSTRCaseComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.strModel = item;
    modalRef.componentInstance.hasVisibleBtnEdit = this.hasVisibleBtnEdit(item);
    modalRef.componentInstance.currentUserRole = this.currentUserRole$;
    modalRef.componentInstance.currentUserProfile = this.currentUserProfile$;
    // modalRef.componentInstance.strUsers = this.strUsers;

    modalRef.result.then(
      (result) => {
        console.log('Kết quả nhận được từ modal:', result);
        this.onSearch();
      },
      (reason) => {
        console.log('Modal bị đóng với lý do:', reason);
        this.onSearch();
      }
    );
  }

  //function: Thay đổi thứ tự ưu tiên, người xử lý
  onUpdateSTR(item: any){
    let modalRef = this.modalService.open(UpdateListSTRCaseComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.strModel = item;
    modalRef.componentInstance.strUsers = this.strUsers;
    modalRef.componentInstance.priorityList = this.priorityList;

    modalRef.result.then(
      (result) => {
        console.log('Kết quả nhận được từ modal:', result);
        this.onSearch();
      },
      (reason) => {
        console.log('Modal bị đóng với lý do:', reason);
        this.onSearch();
      }
    );
  }

  changePage(newPage: number) {
    this.pageIndex = newPage;
    this.searchForm.value.pageIndex = newPage;
    this.selectedStrIdList = [];
    this.onSearch();
  }

  // toggleAdvanceSearch() {
  //   this.isAdvandSearch = !this.isAdvandSearch;
  // }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }
  }

  hasVisibleBtnView(record) {
    return (
          this.currentUserRole$ == UserRole.UNKNOWN ||
          this.currentUserRole$ == UserRole.ANALYST ||
          this.currentUserRole$ == UserRole.MANAGER ||
          this.currentUserRole$ == UserRole.DIRECTOR
        );
  }

  hasVisibleBtnEdit(record) {
    //get strUsers
    return this.strFullUser?.some(x => x.email == this.currentUserProfile$.email 
        && (x.role == UserRole.MANAGER || x.role == UserRole.DIRECTOR) );
 
  }

  getParseDateToString(value : Date){
    const year = value.getFullYear();
    const month = (value.getMonth()+1).toString().padStart(2,'0');
    const day = value.getDate().toString().padStart(2,'0');
    return `${year}-${month}-${day}`;
  }

  getStatusFromSelect(status: string){
    // @ts-ignore
    const options = $('#your-select-element-2 option').map(function() {
      return {
        value: $(this).val(),
        text: $(this).text(),
        title: $(this).attr('title')
      };
    }).get();
  
    let reportStatus = "";
    let title = [];

    for (let i = 0; i < options.length; i++) {
      if(options[i]?.title == status){
        reportStatus = options[i]?.value.toString();
      }
    }
    
    return reportStatus;
  }

  getParseStrUser(user): string {
    if (user == null || user == "") {
      return 'N/A';
    }
    return this.strUsers?.find(x => x?.email == user)?.name;
  }

  getParseSTRCrime(record): string{
    if (record == null) {
      return 'N/A';
    }
    return "";
  }

  getParseSTRStatus(reception_status): string {
    if (reception_status == null || reception_status == "") {
      return 'N/A';
    }
    return STRConstant.statusCaseManagerList?.find(x => x?.code == reception_status)?.name;
  }

  getParseSTRKetLuan(ket_luan : any[]){
    if(ket_luan == null || !ket_luan.some) return "";
    
    let rs: string = ket_luan.map(item => item?.mo_ta).join(", ");
    
    return rs;
  }

  getParseSTRType(mau_str: string){
    return STRConstant.myListStrCase?.find(x=>x?.code == mau_str)?.name;
  }

  getStringToNum(value): Number {
    if (value == null) {
      return null;
    }
    return Number.parseInt(value ?? 0);
  }
  
  //checkbox chọn từng bản ghi
  onCheckboxChange(event: any, strId: number){
    if (event.target.checked) {
      console.log("selected: ", strId);
      this.selectedStrIdList.push(strId);
    } else {
      console.log("remove: ", strId);
      this.selectedStrIdList = this.selectedStrIdList.filter(item => item !== strId);
    }

    console.log("selectedStrIdList: ", this.selectedStrIdList);
  }

  //checkbox chọn toàn bộ bản ghi 
  onToggleAllCheckbox(){
    this.selectAllCheckbox = !this.selectAllCheckbox;

    if(this.selectAllCheckbox && this.searchResultData?.records?.some){
      if(this.selectedStrIdList?.some){
        this.selectedStrIdList = [];
      }
      this.searchResultData?.records?.forEach(element => 
        {
        this.selectedStrIdList.push(element?.id);
        }
      );
    }
    else if(!this.selectAllCheckbox){
      this.selectedStrIdList = [];
    }

    console.log("selectAll: ", this.selectedStrIdList);

  }

  //change processors
  hasVisibleBtnChangeProcessors(){
    // return false;
    return this.strFullUser?.some(x => x.email == this.currentUserProfile$.email 
                                  && (x.role == UserRole.MANAGER || x.role == UserRole.DIRECTOR ));
  }
  
  onChangeProcessors(){
    console.log("this.selectedStrIdList", this.selectedStrIdList);

    if(!this.selectedStrIdList.length){
      this.toastr.warning('Vui lòng chọn ít nhất 1 STR để thay đổi !!!');
      return;
    }

    let modalRef = this.modalService.open(UpdateListSTRCaseComponent, {
      size: 'xl',
    });
    
    modalRef.componentInstance.strUsers = this.strUsers;
    modalRef.componentInstance.isChangeBatch = true;
    modalRef.componentInstance.strIdBatch = this.selectedStrIdList;
    

    modalRef.result.then(
      (result) => {
        console.log('Kết quả nhận được từ modal:', result);
        this.selectAllCheckbox = false;
        this.selectedStrIdList = [];
        this.onSearch();
      },
      (reason) => {
        console.log('Modal bị đóng với lý do:', reason);
        this.selectAllCheckbox = false;
        this.selectedStrIdList = [];
        this.onSearch();
      }
    );

  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const elements = document.getElementsByClassName('kt_record_menu');

    let clickedInside = false;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].contains(event.target as Node)) {
        clickedInside = true;
        break;
      }
    }

    if (!clickedInside) {
      this.toggleRecordActive(null);
      console.log('Clicked outside myDiv!');
    }
  }

  toggleRecordActive(i: number) {
    if (this.recordActiveIndex == i) {
      this.recordActiveIndex = null;
    } else {
      this.recordActiveIndex = i;
    }
  }

  ngAfterViewInit() {
    // Use jQuery to select the element and initialize Select2
    // @ts-ignore
    var select2 = $("#your-select-element").select2();
    select2.data('select2').$selection.css('height', '40px', );
    select2.data('select2').$selection.css('border', '1px solid var(--bs-gray-300)', );
    // 'border', '1px solid var(--bs-gray-300)'
    // @ts-ignore
    var select3 = $("#your-select-element-2").select2();
    select3.data('select2').$selection.css('height', '40px', );
    select3.data('select2').$selection.css('border', '1px solid var(--bs-gray-300)', );
    select3.data('select2').$selection.css('overflow-x', 'hidden', );
    select3.data('select2').$selection.css('overflow-y', 'scroll', );

    // Thay đổi màu chữ
    const myDiv = document.getElementsByClassName('select2-container');
    for (let i = 0; i < myDiv.length; i++) {
      (myDiv[i] as HTMLElement).style.width = '100%';
    }
  }
}
