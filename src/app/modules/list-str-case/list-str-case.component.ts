import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Config } from 'datatables.net';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LayoutService } from 'src/app/_metronic/layout';
import { formatDate } from '@angular/common';
import { STRConstant } from 'src/app/common/str-case.constant';
import { ListSTRCaseService } from './services/list-str-case.service';
import { StrCategoryAssignmentService } from 'src/app/service/str-category-assigment.service';
import { CategoryAssignment } from 'src/app/model/str-category-assignment.model';
import { HttpResponse } from '@angular/common/http';
import { StrUserService } from 'src/app/service/str-user.service';
import { StrUser } from 'src/app/model/str-user.model';

@Component({
  selector: 'app-list-str-case',
  templateUrl: './list-str-case.component.html',
})
export class ListStrCaseComponent implements OnInit {
  isAdvandSearch: boolean = false;

  isCollapsed1 = false;
  isCollapsed2 = true;

  isCollapsed3 = false;

  datatableConfig: Config = {};
  isLoading = true;
  myListStrCase: any[] = STRConstant.myListStrCase;
  statusList: any[] = STRConstant.statusList;

  priorityList: number[] = STRConstant.priorityList

  cateAssigments: CategoryAssignment[];
  strUsers: StrUser[];


  reportData = {
    pageInfo: {
      pageSize: 10,
      pageIndex: 0,
      totalRecord: 1,
    },
    records: [{}],
  };
  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();


  //public searchResultData: DataTablesResponse| null;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  pageIndex: number = 0;
  filterData!: string;
  

  public searchForm = this.fb.group({
    rptEntity: new FormControl('', { nonNullable: true, }),
    rptTemplate: new FormControl('', { nonNullable: true, }),
    dateFrom: new FormControl(Date.now().toLocaleString(), { validators: [] }),
    dateTo: new FormControl(Date.now().toLocaleString(), { validators: [] }),
    rptStatus: new FormControl('', { nonNullable: true, }),
    reportNo: new FormControl(''),
    rptUser: new FormControl('', { nonNullable: true, }),
    rptAssignment: new FormControl('', { nonNullable: true, }),
    rptPriority: new FormControl('',{ nonNullable: true, })
  });

  
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private layout: LayoutService,
    private listSTRCaseService: ListSTRCaseService,
    private strCategoryAssignmentService: StrCategoryAssignmentService,
    private strUserService: StrUserService
  ) {
    this.searchForm.valueChanges.subscribe((value) => {
      const filter = {
        ...value
      } as string;
      this.filterData = filter;
    });
  }

  ngOnInit(): void {
    this.getCateAssignment();
    this.getSbvUser();
    
    //  this.strService.updateListReport({});
    //  this.strService.searchingReportSTRListData$.subscribe((data) => {
    //   console.log('searched updated data',  data);
    //   this.isLoading = false;
    //   if(data != null) {this.isLoading = false;}
    //   this.searchResultData = data;
    // });
  }

  getSbvUser(){
    this.strUserService.getUserActive().subscribe({
      next: (res: HttpResponse<StrUser[]>) => {
        console.log ('sssssssssss');
        console.log (res.body);
        this.strUsers = res?.body;
      },
      error: () => {

      },
    }); 
  }

  getCateAssignment(){
    this.strCategoryAssignmentService.getAll().subscribe({
      next: (res: HttpResponse<CategoryAssignment[]>) => {
        this.cateAssigments = res?.body;
      },
      error: () => {

      },
    }); 
  }

  onSearch(validateInput = true) {
    console.log(this.searchForm.value);
     
    // todo: validate input
    if(validateInput) {
      
    }

    this.isLoading = true;
    //this.strService.updateListReport(this.searchForm.value);
  }

  changePage(pageIndex: number) {
    //this.searchForm.value.pageIndex = pageIndex;
    this.onSearch();
  }

  goViewPage(item: any) {
    // this.modalService.open(ViewReportOneComponent, {
    //   fullscreen: true,
    //   backdrop: false,
    // });
  }

  toggleAdvanceSearch() {
    this.isAdvandSearch = !this.isAdvandSearch;
  }

  clearSearch() {
    console.log('22222222');
   this.searchForm.reset();
  }



  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }
  }
}
