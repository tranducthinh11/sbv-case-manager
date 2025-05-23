import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserRole } from '../services/user-role.enum';
import {
  DataTablesResponse,
  STRReportListSTRService,
} from '../services/report-list-str.service';
import { ToastrService } from 'ngx-toastr';
import { LoggingService } from '../services/logging.service';
import { STRConstant } from 'src/app/common/str-case.constant';
import { STRListCaseService } from '../services/list-str-case.service';
import { DigitalSignSTRComponent } from '../digitalsign-list-str-case/digitalsign-list-str-case.component';
import { StaticService } from '../services/static.service';

type Tabs = 'Detail' | 'History';

@Component({
  selector: 'preview-list-str-case',
  styleUrls: ['./preview-list-str-case.component.css'],
  templateUrl: './preview-list-str-case.component.html',
})
export class PreviewListSTRCaseComponent implements OnInit {
  @ViewChild('formModal') formModal: TemplateRef<any>;

  @Input() strModel!: any;

  @Input() currentUserRole!: UserRole;
  @Input() currentUserProfile!: any;

  @Input() active: boolean = false;

  @Output() onClosed: EventEmitter<void>;
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  strUsers: any[] = [];
  myForm: NgForm;
  isLoading: true;
  isPrinting: boolean = false;
  isCollapsedHistory: boolean = false;
  isRequiredNote: boolean = false;
  isRequiredDes2: boolean = false;
  description1: string = '';
  description2: string = '';
  isDisplayNote: boolean = false;
  isDisplaySecondSubmit: boolean = false;
  isConfirmCancel: boolean = false;
  currentAction: any;
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
    private loggingService: LoggingService,
    private strService: STRListCaseService,
    private modal: NgbModal
  ) {
    console.log('strModel');
    console.log(this.strModel);
  }

  ngOnInit(): void {
    console.log('strModel');
    console.log(this.strModel);
    console.log('profile', this.currentUserProfile);
    console.log('strUser', this.strUsers);
    console.log('role', this.currentUserRole);

    this.currentStatus = this.strModel.reception_status;

    this.loggingService.updateHistoryOfReportManager(
      { page: 0, size: 10, sort: ['id', 'desc'] },
      { id: this.strModel?.id }
    );

    this.loggingService.searchingReportSTRListData$.subscribe((log) => {
      this.logResultData = log;
      console.log("logResultData: ", this.logResultData);
    });

    //get strUsers
    this.strService.getStrUser('').subscribe(data =>{
      this.strUsers = data;
    })

  }

  

  close() {
    console.log('closed');
    this.activeModal.close();
    //this.onClosed.emit()
  }

  getParseSTRType(value: string){
    return STRConstant.myListStrCase.find(x => x.code == value)?.name ?? 'N/A';
  }
  
  getParseSTRStatus(reception_status): string {
    if (reception_status == null || reception_status == "") {
      return '...';
    }
    return STRConstant.statusCaseManagerList?.find(x => x?.code == reception_status)?.name;
  }

  getParseSTRKetLuan(ket_luan : any[]){
    if(ket_luan == null || !ket_luan.some) return "N/A";
    
    let rs: string = ket_luan.map(item => item?.mo_ta).join(", ");
    
    return rs;
  }
  

  /** ------------------- **/

  hasVisibleBtnInPDF() {
    return (
      this.strUsers?.some(x => x.email == this.currentUserProfile.email 
        && (x.role == UserRole.ANALYST
            || x.role == UserRole.DIRECTOR
            || x.role == UserRole.MANAGER
            ))
    );
  }

  onPrintPDF() {
    this.isPrinting = true;
    this.currentStep$.next(2);
    const content = document.getElementById('printableContent');
    if (!content) return;

    this.strReportListSTRService.onPrintDocxReport(this.strModel?.id).subscribe({
      next: (response: Blob) => {
        // Tạo URL từ Blob
        const url = window.URL.createObjectURL(response);
        // Tạo thẻ <a> ẩn để tải file
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.strModel?.report_entity_code}_${this.strModel?.payload?.Thong_tin_chung?.so_bao_cao}.docx`; // Tên file tải về (Mã Ngân hàng_Số báo cáo) (ReportEntityCode_SoBaoCao)
        document.body.appendChild(link);
        link.click();
        // Dọn dẹp
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Lỗi khi tải file:', err);
      },
    });
    
  }

  hasVisibleBtnInDocxCase() {
    return (
      this.strUsers?.some(x => x.email == this.currentUserProfile.email 
        && (x.role == UserRole.ANALYST
            || x.role == UserRole.DIRECTOR
            || x.role == UserRole.MANAGER
            ) )
            && (this.strModel?.reception_status == 'DA_TIEP_NHAN' 
                || this.strModel?.reception_status == 'DA_TAO_HO_SO'
                || this.strModel?.reception_status == 'HOAN_THANH'
            )
    );
  }

  onPrintDocxCase() {
    this.isPrinting = true;
    this.currentStep$.next(2);
    const content = document.getElementById('printableContent');
    if (!content) return;

    this.strReportListSTRService.onPrintDocxCase(this.strModel?.id).subscribe({
      next: (response: Blob) => {
        // Tạo URL từ Blob
        const url = window.URL.createObjectURL(response);
        // Tạo thẻ <a> ẩn để tải file
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.strModel?.amld_internal_number}.docx`; // Tên file tải về (Mã số str) (amld_internal_number)
        document.body.appendChild(link);
        link.click();
        // Dọn dẹp
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Lỗi khi tải file:', err);
      },
    });
    
  }

  hasVisibleBtnInExcelCase() {
    return (
      this.strUsers?.some(x => x.email == this.currentUserProfile.email 
        && (x.role == UserRole.ANALYST
            || x.role == UserRole.DIRECTOR
            || x.role == UserRole.MANAGER
            ) )
    );
  }

  onPrintExcelCase() {
    this.isPrinting = true;
    this.currentStep$.next(2);
    const content = document.getElementById('printableContent');
    if (!content) return;

    this.strReportListSTRService.onPrintExcelCase(this.strModel?.id).subscribe({
      next: (response: Blob) => {
        // Tạo URL từ Blob
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'template.xlsx';
      
        // Thêm vào DOM và click để tải
        document.body.appendChild(link);
        link.click();
      
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Lỗi khi tải file:', err);
      },
    });
    
  }

  /** ------------------- **/
  hasVisibleBtnKiemTra() {
    return (
      this.currentStatus == 'CHO_TIEP_NHAN' 
      && this.strUsers?.some(x => x.email == this.currentUserProfile.email 
                                  && x.role == UserRole.ANALYST )
      && this.strModel?.received_by == this.currentUserProfile.email 
    );
  }

  onKiemTraSubmit() {
    this.isLoading = true;
    let params = {
      strId: this.strModel.id,
      event: 'ANALYST_CHECK',
      statusFrom: this.strModel?.reception_status,
      statusTo: 'DANG_KIEM_TRA',
    };
    this.askForConfirmation('Kiểm tra STR', 'Đồng ý', params);
  }

  /** ------------------- **/
  hasVisibleBtnXacNhanTraLai():boolean {
    console.log("hasVisibleBtnXacNhanTraLai: ", this.currentStatus);
    console.log("hasVisibleBtnXacNhanTraLai: ", this.strUsers);
    console.log("hasVisibleBtnXacNhanTraLai: ", this.strModel);
    return (
      (this.currentStatus == 'DANG_KIEM_TRA' 
        || this.currentStatus == 'KHONG_DUYET_TRA_CP' 
        || this.currentStatus == 'KHONG_DUYET_TRA_CC'
      ) 
      && this.strUsers?.some(x => x.email == this.currentUserProfile.email 
                                  && x.role == UserRole.ANALYST )
      && this.strModel?.received_by == this.currentUserProfile.email 
    );
  }

  onXacNhanSubmit() {
    this.isLoading = true;
    let params = {
      strId: this.strModel.id,
      event: 'ANALYST_CONFIRMED',
      statusFrom: this.strModel?.reception_status,
      statusTo: 'DA_TIEP_NHAN',
    };
    this.askForConfirmation('Xác nhận tiếp nhận', 'Đồng ý', params);
  }

  onTraLaiSubmit() {
    this.isLoading = true;
    let params = {
      strId: this.strModel.id,
      event: 'ANALYST_RETURNED',
      statusFrom: this.strModel?.reception_status,
      statusTo: 'CHO_DUYET_TRA_CP',

    };
    this.askForConfirmation('Trả lại STR', 'Đồng ý', params);
  }

  /** ------------------- **/

  hasVisibleBtnLDPhong() {
    console.log("hasVisibleBtnLDPhong: ", this.currentStatus);
    return (
      this.currentStatus == 'CHO_DUYET_TRA_CP' 
      && this.strUsers?.some(x => x.email == this.currentUserProfile.email 
                                  && x.role == UserRole.MANAGER )
    );
  }

  onLDPhongDuyetSubmit() {
    this.isLoading = true;
    let params = {
      strId: this.strModel.id,
      event: 'MANAGER_APPROVED',
      statusFrom: this.strModel?.reception_status,
      statusTo: 'CHO_DUYET_TRA_CC',

    };
    let log = this.logResultData.records.find(e => e.event === 'ANALYST_RETURNED');
    this.description1 = log?.description;
    this.askForConfirmation('LĐ Phòng duyệt trả lại', 'Đồng ý', params);
  }

  onLDPhongKhongDuyetSubmit() {
    this.isLoading = true;
    let params = {
      strId: this.strModel.id,
      event: 'MANAGER_NOT_APPROVED',
      statusFrom: this.strModel?.reception_status,
      statusTo: 'KHONG_DUYET_TRA_CP',

    };
    this.askForConfirmation('LĐ Phòng không duyệt trả lại', 'Đồng ý', params);
  }

  /** ------------------- **/

  hasVisibleBtnLDCuc() {
    return (
      this.currentStatus == 'CHO_DUYET_TRA_CC' 
      && this.strUsers?.some(x => x.email == this.currentUserProfile.email 
                                  && x.role == UserRole.DIRECTOR )
    );
  }

  onLDCucDuyetSubmit() {
    this.isLoading = true;
    let params = {
      strId: this.strModel.id,
      event: 'DIRECTOR_APPROVED',
      statusFrom: this.strModel?.reception_status,
      statusTo: 'DA_TRA_LAI',

    };
    this.askForConfirmation('LĐ Cục duyệt trả lại', 'Đồng ý', params);
  }

  onLDCucKhongDuyetSubmit() {
    this.isLoading = true;
    let params = {
      strId: this.strModel.id,
      event: 'DIRECTOR_NOT_APPROVED',
      statusFrom: this.strModel?.reception_status,
      statusTo: 'KHONG_DUYET_TRA_CC',

    };
    this.askForConfirmation('LĐ Cục không duyệt trả lại ', 'Đồng ý', params);
  }

  /** ------------------- **/

  hasVisibleBtnCapNhat() {
    return (
      this.currentStatus == 'CHO_LD_PHONG_DUYET_TRA_LAI' 
      && this.strUsers?.some(x => x.email == this.currentUserProfile.email 
                                  && x.role == UserRole.DIRECTOR )
    );
  }

  onCapNhatSubmit() {
  }

  
  askForConfirmation(name: string, desc: string, params: any) {
    
    this.isRequiredNote = false;

    if(params.event != 'ANALYST_CHECK'){
      this.toastr.info('Vui lòng nhập mô tả', name);
      this.isDisplayNote = true;
      this.isRequiredNote = true;
      
      this.isDisplaySecondSubmit = true;
      if(this.isDisplayNote){
        this.description1 = this.getDescription(params.event);
      }
    }

    this.checkDescription2(params.event);

    this.currentName = name;

    this.currentParamObj = params;

    console.log('set current action');

    this.currentAction = () =>
      this.strReportListSTRService
        .onChangeReportStatus( this.currentParamObj)
        .subscribe(
          (res) => {
          console.log('current action responsed', res);
          if (res.id) {
            this.strModel = res;

            this.displaySuccessNotification('Thông báo STR-' + this.strModel?.so_bao_cao);

            this.reloadPage();
          } else {
            alert(res);
          }
        },
        (error: any) => {
            console.log('Lỗi backend', error);
            this.displayErrorNotification(error.error.detail);
        }
      );

      if(params.event == 'ANALYST_CHECK'){
        this.currentAction();
      }
      
    }

  submitCurrentPendingTask() {
    if (this.currentAction) {
      console.log('current called');
      this.description1 = this.description1?.trim();
      this.description2 = this.description2?.trim();

      if(this.isRequiredNote && !this.description1?.length) {
        this.toastr.error('Yêu cầu nhập Ý kiến gửi ĐTBC');
      }
      else if(this.isRequiredDes2 && !this.description2?.length) {
        this.toastr.error('Yêu cầu nhập Mô tả');
      } 
      else {
        this.currentParamObj.description1 = this.description1;
        this.currentParamObj.description2 = this.description2;

        let isRequireDigitalSign = this.currentParamObj.event === 'DIRECTOR_APPROVED';
        console.log('isRequireDigitalSign: ' + isRequireDigitalSign);

        if(!isRequireDigitalSign){
          this.currentAction();
        }
        else{
          this.modal.open(this.modalContent, { size: 'lg' });
          let modalRef = this.modalService.open(DigitalSignSTRComponent, {
            size: 'xl',
          });
          modalRef.componentInstance.strModel = this.strModel;

          StaticService.getInstance()
            .getSignDataResponseAsync()
            .subscribe((data: any) => {
              console.log('getDigitalSignDataResponseAsync');
              console.log(data);
              if (data.statusCode !== 1 && data.statusCode !== 0) {
                this.toastr.error(
                  data?.statusContent,
                  'Lỗi ' + data.statusCode
                );

                StaticService.getInstance().setIsValidToken(null);
                setTimeout(() => {
                  this.description1 = '';
                  this.description2 = '';
                  this.isRequiredNote = false;
                  this.isRequiredDes2 = false;
                  this.isDisplayNote = false;
                  this.isDisplaySecondSubmit = false;
                }, 300);
              } else if (data.statusCode === 1) {
                modalRef.close();
                this.toastr.success('Đã ký thành công', 'Thông báo');

                this.currentParamObj.signatureObj = {
                  dn: data.dn,
                  signature: data.signature,
                  statusCode: data.statusCode,
                };

                this.currentAction();

                setTimeout(() => {
                  this.description1 = '';
                  this.description2 = '';
                  this.isRequiredNote = false;
                  this.isRequiredDes2 = false;
                  this.isDisplayNote = false;
                  this.isDisplaySecondSubmit = false;
                }, 300);
              }
              // else null
            });
        }


        setTimeout(() => {
          this.description1 = '';
          this.description2 = '';
          this.isRequiredNote = false;
          this.isRequiredDes2 = false;
          this.isDisplayNote = false;
          this.isDisplaySecondSubmit = false;
        }, 300);
      } 
    }
  }

  // ---------------------

  toggleHistory() {
    this.isCollapsedHistory = !this.isCollapsedHistory;
  }

  setStep(index: number) {
    this.currentStep$.next(index);
  }

  nextStep() {
    const nextStep = this.currentStep$.value + 1;

    this.currentStep$.next(nextStep);
  }

  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }

  reloadPage() {
    // location.reload();
    this.modalService.dismissAll();
  }

  displaySuccessNotification(msg: string) {
    this.toastr.success('Cập nhật thành công', msg);
  }

  displayErrorNotification(msg: '') {
    this.toastr.error('Có lỗi xảy ra', msg);
  }

  cancelCurrentPendingTask() {
    this.currentAction = null;
    this.description1 = this.description1?.trim();
    this.description2 = this.description2?.trim();
    this.isDisplayNote = false;
    this.isDisplaySecondSubmit = false;

    this.toastr.info('Đã hủy hành động');
  }

  //disable Ý kiến gửi ĐTBC
  disableDescription(event: string){
    if(event == 'STR_UPDATED') return false;
    else if(event == 'SEND_AMLD') return false;
    else if(event == 'ANALYST_CHECK') return false;

    return true;
  }

  //disable Mô tả
  disableDescription2(event: string){
    if(event == 'SEND_AMLD') return false;
    else if(event == 'ANALYST_CHECK') return false;

    return true;
  }
 
  parseEventNameToString(evtName: string) {
    switch (evtName) {
      case 'SEND_AMLD': return 'ĐTBC gửi STR';
      case 'ANALYST_CHECK': return 'CB chuyển kiểm tra STR';
      case 'ANALYST_CONFIRMED': return 'Phản hồi xác nhận tiếp nhận';
      case 'ANALYST_RETURNED': return 'CB yêu cầu trả lại STR';
      case 'MANAGER_APPROVED': return 'LĐ Phòng duyệt trả lại';
      case 'MANAGER_NOT_APPROVED': return 'LĐ Phòng không duyệt trả lại';
      case 'DIRECTOR_APPROVED': return 'LĐ Cục duyệt trả lại';
      case 'DIRECTOR_NOT_APPROVED': return 'LĐ Cục không duyệt trả lại';
      case 'STR_UPDATED': return 'Cập nhật STR';
    }
  }

  getDescription(eventName : string){
    switch(eventName){
      case 'ANALYST_CONFIRMED':
        return `Cục PCRT đồng ý tiếp nhận xử lý STR số ${this.strModel?.so_bao_cao} đã gửi ngày ${this.formatDate(this.strModel?.ngay_bao_cao) }, chi tiết liên hệ Cán bộ xử lý ${this.currentUserProfile.firstName + ' ' +this.currentUserProfile.lastName} – email: ${this.currentUserProfile.email}`;
      case 'ANALYST_RETURNED':
        return `Cục PCRT không đồng ý tiếp nhận xử lý STR số  ${this.strModel?.so_bao_cao} đã gửi ngày ${this.formatDate(this.strModel?.ngay_bao_cao)  }, chi tiết liên hệ Cán bộ xử lý ${this.currentUserProfile.firstName + ' ' +this.currentUserProfile.lastName} – email: ${this.currentUserProfile.email}`;
      case 'MANAGER_APPROVED':
      case 'MANAGER_NOT_APPROVED':
        return this.logResultData?.records?.find(e => e.event === 'ANALYST_RETURNED')?.description;
      case 'DIRECTOR_APPROVED':
      case 'DIRECTOR_NOT_APPROVED':
        return this.logResultData?.records?.find(e => e.event === 'MANAGER_APPROVED')?.description;
      default:
        return ``;
      }
  }

  formatDate(dateString: any): string {
    const date = new Date(dateString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
  

  checkDescription2(eventName : string){
    if(eventName == 'ANALYST_RETURNED'
        || eventName == 'MANAGER_APPROVED'
        || eventName == 'MANAGER_NOT_APPROVED'
        || eventName == 'AMLD_REJECTED'
        || eventName == 'DIRECTOR_APPROVED'
        || eventName == 'DIRECTOR_NOT_APPROVED'
    ){
      this.isRequiredDes2 = true;
    }
  }


}
