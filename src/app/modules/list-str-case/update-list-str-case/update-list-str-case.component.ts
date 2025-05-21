import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  DataTablesResponse,
  STRReportListSTRService,
} from '../services/report-list-str.service';
import { ToastrService } from 'ngx-toastr';
import { LoggingService } from '../services/logging.service';
import { STRConstant } from 'src/app/common/str-case.constant';

type Tabs = 'Detail' | 'History';

@Component({
  selector: 'update-list-str-case',
  styleUrls: ['./update-list-str-case.component.css'],
  templateUrl: './update-list-str-case.component.html',
})
export class UpdateListSTRCaseComponent implements OnInit {
  @ViewChild('formModal') formModal: TemplateRef<any>;

  @Input() strModel!: any;
  @Input() strUsers!: any[];
  @Input() priorityList!: any[];
  @Input() isChangeBatch : boolean = false;

  @Input() active: boolean = false;
  @Input() strIdBatch: number[] = [];

  @Output() onClosed: EventEmitter<void>;

  

  public updateForm = new FormGroup({
      priority: new FormControl('', { nonNullable: true }),
      processor: new FormControl('', { nonNullable: true }),
      updateReason: new FormControl('', { nonNullable: true })
    });

  myForm: NgForm;
  currentParamObj: any;
  currentName: string;
  pendingActionCallback: any;

  currentStatus: string = '';
  public logResultData: DataTablesResponse | null;
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private strReportListSTRService: STRReportListSTRService,
    private toastr: ToastrService,
    private loggingService: LoggingService
  ) {
    console.log('strModel');
    console.log(this.strModel);
  }

  ngOnInit(): void {
    console.log('strModel');
    console.log(this.strModel);
    console.log('strUser', this.strUsers);

  console.log('strIdBatch: ', this.strIdBatch);

    if(!this.isChangeBatch){
      this.currentStatus = this.strModel.reception_status;

      this.updateForm.patchValue({
        priority: this.strModel?.priority,
        processor: this.strModel?.received_by
      });
    }

  }

  close() {
    console.log('closed');
    this.activeModal.close();
  }

  submitCurrentPendingTask() {
    console.log("form: ", this.updateForm.value);

    let params ;

    //check cán bộ xử lý
    if(this.updateForm.value.processor.trim() == ''){
      this.toastr.info('Vui lòng chọn cán bộ xử lý!');
      return;
    }

    //check lý do cập nhật
    if(this.updateForm.value.updateReason.trim() == ''){
        this.toastr.info('Vui lòng nhập Lý do cập nhật!');
        return;
    }

    //thay đổi thông tin đơn lẻ
    if(!this.isChangeBatch){
      if(this.updateForm.value.priority == this.strModel.priority
        && this.updateForm.value.processor == this.strModel.received_by
      ){
        this.toastr.info('Vui lòng thay đổi Mức độ ưu tiên hoặc Cán bộ xử lý!');
        return;
      }

      this.strIdBatch.push(this.strModel?.id);

      params = {
        strId: this.strIdBatch, //this.strModel.id,
        event: 'STR_UPDATED',
        priority: this.updateForm.value.priority,
        receivedBy: this.updateForm.value.processor,
        updateReason: this.updateForm.value.updateReason
      };
      
    }
    //thay đổi theo lô
    else{
      params = {
        strId: this.strIdBatch, //this.strModel.id,
        event: 'STR_UPDATED',
        priority: null,
        receivedBy: this.updateForm.value.processor,
        updateReason: this.updateForm.value.updateReason
      };
    }

    
    console.log("params: ", params);

    this.strReportListSTRService
        .onUpdateSTR( params)
        .subscribe(
          (res) => {
          console.log('current action responsed', res);
          // if (res.id) {
          //   this.strModel = res;

            if(this.isChangeBatch){
              this.displaySuccessNotification('Thay đổi cán bộ xử lý theo lô !!!');
            }else{
              this.displaySuccessNotification('Thay đổi mức độ ưu tiên, gán CB xử lý !!!');
            }
            
            this.reloadPage();
          // } else {
          //   alert(res);
          // }
        },
        (error: any) => {
            console.log('Lỗi backend', error);
            this.displayErrorNotification(error.error.detail);
        }
      );
  }

  cancelCurrentPendingTask() {
      this.toastr.info('Đã hủy hành động');
      this.reloadPage();
    }

  reloadPage() {
    // location.reload();
    this.modalService.dismissAll();
    
  }

  displaySuccessNotification(msg: string) {
    this.toastr.success('Cập nhật thành công', msg);
  }

  displayErrorNotification(msg: '') {
    this.toastr.error('Có lỗi xãy ra', msg);
  }

  

  getParseSTRStatus(reception_status): string {
    if (reception_status == null || reception_status == "") {
      return 'N/A';
    }
    return STRConstant.statusList?.find(x => x?.code == reception_status)?.name;
  }

}
