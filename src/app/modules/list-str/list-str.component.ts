import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
} from '@angular/core';
import { Config } from 'datatables.net';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, NgForm } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutService } from 'src/app/_metronic/layout';
import {
  DataTablesResponse,
  STRReportService,
} from './services/report-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewSTRComponent } from './preview-str/preview-str.component';
import { AuthService, UserType } from '../auth';
import { ReportStatusEnum } from './services/report-status.enum';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../list-str-case/services/user-role.enum';

@Component({
  selector: 'app-list-str',
  templateUrl: './list-str.component.html',
})
export class ListStrComponent implements OnInit {
  isAdvandSearch: boolean = false;
  currentPickingItem: any;
  datatableConfig: Config = {};
  isLoading = true;
  statusDefault = '';
  filterType = '';
  statusList = [];

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  public searchResultData: DataTablesResponse | null;
  roles$: Observable<DataTablesResponse>;
  pageIndex: number = 0;
  totalPage: number = 0;
  pageSize: number = 5;
  public searchForm: FormGroup = new FormGroup({
    dateFrom: new FormControl(null, { validators: [] }),
    dateTo: new FormControl(null, { validators: [] }),

    dateDetectFrom: new FormControl(null, { validators: [] }),
    dateDetectTo: new FormControl(null, { validators: [] }),

    reportStatus: new FormControl(null, { nonNullable: true }),
    searchText: new FormControl(null),
    sortBy: new FormControl(null),
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
    private strService: STRReportService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private eRef: ElementRef
  ) {}

  reInitializeForm() {
    this.searchForm = new FormGroup({
      dateFrom: new FormControl(null, { validators: [] }),
      dateTo: new FormControl(null, { validators: [] }),

      dateDetectFrom: new FormControl(null, { validators: [] }),
      dateDetectTo: new FormControl(null, { validators: [] }),

      reportStatus: new FormControl(this.statusDefault ?? null, {
        nonNullable: true,
      }),
      searchText: new FormControl(null),
      sortBy: new FormControl(null),
      //sizing
      pageSize: new FormControl(this.pageSize),
      pageIndex: new FormControl(this.pageIndex),

      // other
      filterType: new FormControl(this.filterType ?? null),
    });
  }

  ngOnInit(): void {
    this.statusList = this.strService.statusList;
    this.route.params.subscribe((params) => {
      this.statusDefault = params['status'];
      this.filterType = params['filterBy'];

      this.reInitializeForm();
      this.onSearch();
    });

    // load user states
    this.currentUserProfile$ = this.authService.getAuthFromLocalStorage();
    this.authService.getUserRole().subscribe((role) => {
      console.log('updated role to ' + role);
      this.currentUserRole$ = role;
    });

    console.log(this.currentUserProfile$);
    console.log(this.currentUserRole$);
   
    // do default search
    this.strService.searchingReportSTRListData$.subscribe((data) => {
      console.log('searched updated data', data);
      this.isLoading = false;
      if (data != null) {
        this.isLoading = false;
      }
      this.searchResultData = data;
      this.pageIndex = data?.pageInfo?.pageIndex;
      this.totalPage = data?.pageInfo?.pageTotal;
      this.pageSize = data?.pageInfo?.pageSize;
    });
    this.onSearch();
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
  onBtnSearch() {
    this.pageIndex = 0; // reset paging
    this.onSearch()
  }

  onSearch(validateInput = true) {
    console.log('onSearch');
    if (this.isLoading) return;
    this.isLoading = true;

    // todo: validate input
    if (validateInput) {
    }

    this.strService.updateListReport(
      {
        page: this.pageIndex,
        size: this.pageSize,
        sort: ['id', 'desc'],
      },
      this.searchForm.value
    );
  }

  navigateToEdit(record: any) {
    this.router.navigate([
      'report-str/report-two',
      {
        id: record?.id,
      },
    ]);
  }

  onDeleteItem(record: any) {
    if (window.confirm('Bạn có chắc chắn xóa bản ghi này không?')) {
      this.strService.onDeleteItem(record?.id).subscribe((res) => {
        console.log('searched updated data', res);
        this.isLoading = false;
        if (res != null) {
          this.isLoading = false;
        }
        this.toastr.info('Đã xóa bản ghi: ' + record?.str_internal_number);
        this.onSearch();
      });
    }
  }

  onPreview(item: any) {
    this.currentPickingItem = item;
    let modalRef = this.modalService.open(PreviewSTRComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.strModel = item;
    modalRef.componentInstance.hasVisibleBtnEdit = this.hasVisibleBtnEdit(item);
    modalRef.componentInstance.hasVisibleBtnDelete =
      this.hasVisibleBtnDelete(item);
    modalRef.componentInstance.currentUserRole = this.currentUserRole$;
    modalRef.componentInstance.currentUserProfile = this.currentUserProfile$;

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
    this.onSearch();
  }

  toggleAdvanceSearch() {
    this.isAdvandSearch = !this.isAdvandSearch;
  }

  clearSearch() {
    this.searchForm.value.reportNo = '';
    this.searchForm.reset();
    this.router.navigate(['/list-str'], {
      queryParams: {},
      replaceUrl: true,
    });

    //this.reInitializeForm()
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }
  }

  hasVisibleBtnAddNew() {
    return this.currentUserRole$ == UserRole.INPUTER;
  }

  hasVisibleBtnView(record) {
    return (
      this.currentUserRole$ == UserRole.UNKNOWN ||
      this.currentUserRole$ == UserRole.INPUTER ||
      this.currentUserRole$ == UserRole.AUTHORISER ||
      this.currentUserRole$ == UserRole.REPORTER
    );
  }

  hasVisibleBtnEdit(record) {
    let recordStatus = this.strService.parseStatusStringToEnum(
      record?.creation_status
    );

    let isRecordOwner = record?.created_by == this.authService.getUserLogin();

    let checkRecordCanEdit =
      recordStatus == ReportStatusEnum.DRAF ||
      recordStatus == ReportStatusEnum.AUTHORISER_NOT_APPROVED ||
      recordStatus == ReportStatusEnum.REPORTER_NOT_APPROVED;

    return (
      this.currentUserRole$ == UserRole.INPUTER &&
      checkRecordCanEdit &&
      isRecordOwner
    );
  }

  hasVisibleBtnDelete(record) {
    let isRecordOwner = record?.created_by == this.authService.getUserLogin();
    let recordStatus = this.strService.parseStatusStringToEnum(
      record?.creation_status
    );
    let checkRecordCanDelete = recordStatus == ReportStatusEnum.DRAF;
    return (
      this.currentUserRole$ == UserRole.INPUTER &&
      checkRecordCanDelete &&
      isRecordOwner
    );
  }

  getParseSTRStatus(record): string {
    if (record?.creation_status == null) {
      return 'N/A';
    }
    return this.strService.parseStatusStringToEnum(record?.creation_status);
  }

  toggleRecordActive(i: number) {
    if (this.recordActiveIndex == i) {
      this.recordActiveIndex = null;
    } else {
      this.recordActiveIndex = i;
    }
  }
}
