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
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewReportOneComponent } from '../report-str/report-one/view/view-report-one.component';
import { LayoutService } from 'src/app/_metronic/layout';
import { DataTablesResponse, STRReportService } from './services/report-list.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-list-str',
  templateUrl: './list-str.component.html',
})
export class ListStrComponent implements OnInit {
  isAdvandSearch: boolean = false;

  isCollapsed1 = false;
  isCollapsed2 = true;

  isCollapsed3 = false;

  datatableConfig: Config = {};
  isLoading = true;
  statusList: string[] = [
    'Đang nhập liệu',
    'Chờ kiểm soát',
    'Kiểm soát chưa đạt',
    'Chờ phê duyệt',
    'Đã gửi cục PCRT',
    'Không phê duyệt',
    'Cục PCRT tiếp nhận',
    'Cục PCRT hoàn trả',
  ];
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


  public searchResultData: DataTablesResponse| null;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  roles$: Observable<DataTablesResponse>;
  pageIndex: number = 0;
  public searchForm = new FormGroup({
    dateFrom: new FormControl(Date.now().toLocaleString(), { validators: [] }),
    dateTo: new FormControl(Date.now().toLocaleString(), { validators: [] }),
    reportStatus: new FormControl('', { nonNullable: true, }),
    reportNo: new FormControl(''),
     
    //sizing
    pageSize: new FormControl(10),
    pageIndex: new FormControl(this.pageIndex),
  });

  constructor(
    private modalService: NgbModal,
    private layout: LayoutService,
    private strService: STRReportService
  ) {}

  ngOnInit(): void {
     this.strService.updateListReport({});
     this.strService.searchingReportSTRListData$.subscribe((data) => {
      console.log('searched updated data',  data);
      this.isLoading = false;
      if(data != null) {this.isLoading = false;}
      this.searchResultData = data;
    });
  }

  onSearch(validateInput = true) {
    console.warn(this.searchForm.value);
     
    // todo: validate input
    if(validateInput) {
      
    }

    this.isLoading = true;
    this.strService.updateListReport(this.searchForm.value);
  }

  changePage(pageIndex: number) {
    this.searchForm.value.pageIndex = pageIndex;
    this.onSearch();
  }

  goViewPage(item: any) {
    this.modalService.open(ViewReportOneComponent, {
      fullscreen: true,
      backdrop: false,
    });
  }

  toggleAdvanceSearch() {
    this.isAdvandSearch = !this.isAdvandSearch;
  }

  clearSearch() {
   this.searchForm.value.reportNo = "";
  }



  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }
  }
}
