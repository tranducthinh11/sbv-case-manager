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
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';
import { NgxPrintService, PrintOptions } from 'ngx-print';
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserRole } from '../services/user-role.enum';
import { AuthService, UserType } from '../../auth/services/auth.service';
import { ReportStatusEnum } from '../services/report-status.enum';
import {
  DataTablesResponse,
  STRReportService,
} from '../services/report-list.service';
import { ToastrService } from 'ngx-toastr';
import { LoggingService } from '../services/logging.service';
import { DigitalSignSTRComponent } from '../digitalsign-str/digitalsign-str.component';
import { StaticService } from '../services/static.service';

type Tabs = 'Detail' | 'History';

@Component({
  selector: 'preview-str',
  styleUrls: ['./preview-str.component.css'],
  templateUrl: './preview-str.component.html',
})
export class PreviewSTRComponent implements OnInit {
  @ViewChild('formModal') formModal: TemplateRef<any>;
  @Input() strModel!: any;

  @Input() currentUserRole!: UserRole;
  @Input() currentUserProfile!: UserType;

  @Input() active: boolean = false;

  @Output() onClosed: EventEmitter<void>;

  myForm: NgForm;
  isLoading: true;
  isPrinting: boolean = false;
  isCollapsedHistory: boolean = false;
  isRequiredNote: boolean = false;
  currentNote: string = '';
  isDisplayNote: boolean = false;
  isDisplaySecondSubmit: boolean = false;
  currentAction: any;
  currentParamObj: any;
  currentName: string;
  pendingActionCallback: any;

  currentStatus: ReportStatusEnum = ReportStatusEnum.DRAF;
  public logResultData: DataTablesResponse | null;
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private strReportService: STRReportService,
    private authService: AuthService,
    private toastr: ToastrService,
    private loggingService: LoggingService,
    private modal: NgbModal
  ) {
    console.log('strModel');
    console.log(this.strModel);
  }

  ngOnInit(): void {
    console.log('strModel--');
    console.log(this.strModel);

    // reload this model
    console.log("getSTRItem")
    this.strReportService.getSTRItem(this.strModel.id).subscribe(
      (data) => {
        this.strModel = data;
        console.log(data);
      },
      (err) => {
        this.toastr.info('Có lỗi xãy ra khi đọc thông tin', err);
      }
    );

    this.currentStatus = this.strReportService.parseStatusStringToEnum(
      this.strModel.creation_status
    );
    this.loggingService.updateHistoryOfReport(
      { page: 0, size: 100, sort: ['id', 'desc'] },
      { id: this.strModel?.id }
    );

    this.loggingService.searchingReportSTRListData$.subscribe((log) => {
      this.logResultData = log;
    });
  }

  onPrintPDF() {
    this.isPrinting = true;
    this.currentStep$.next(2);
    const content = document.getElementById('printableContent');
    if (!content) return;

    // html2pdf()
    //   .from(content)
    //   .set({
    //     margin: 10,
    //     filename: 'document.pdf',
    //     image: { type: 'jpeg', quality: 0.98 },
    //     html2canvas: { scale: 2 },
    //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    //   })
    //   .save();
    // setTimeout(() => {
    //   this.isPrinting = false;
    // }, 1000);

    this.strReportService.onPrintDocxReport(this.strModel?.id).subscribe({
      next: (response: Blob) => {
        // Tạo URL từ Blob
        const url = window.URL.createObjectURL(response);
        // Tạo thẻ <a> ẩn để tải file
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.strModel?.str_internal_number}.docx`; // Tên file tải về
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

  close() {
    console.log('closed');
    this.activeModal.close();
    //this.onClosed.emit()
  }

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

  /** ------------------- **/
  hasVisibleBtnExportDocx() {
    return (
      this.currentStatus == ReportStatusEnum.INPUTER_SUBMITED ||
      this.currentStatus == ReportStatusEnum.AUTHORISER_APPROVED ||
      this.currentStatus == ReportStatusEnum.REPORTER_APPROVED ||
      this.currentStatus == ReportStatusEnum.PCRT_RECEIVED ||
      this.currentStatus == ReportStatusEnum.PCRT_REJECTED
    );
  }

  /** ------------------- **/
  hasVisibleBtnTrinhKiemSoat() {
    let recordStatus = this.strReportService.parseStatusStringToEnum(
      this.strModel?.creation_status
    );
    let isRecordOwner =
      this.strModel?.created_by == this.authService.getUserLogin();

    return (
      (this.currentStatus == ReportStatusEnum.DRAF ||
        this.currentStatus == ReportStatusEnum.AUTHORISER_NOT_APPROVED ||
        this.currentStatus == ReportStatusEnum.REPORTER_NOT_APPROVED) &&
      this.currentUserRole == UserRole.INPUTER &&
      isRecordOwner
    );
  }

  onTrinhKiemSoatSubmit() {
    this.isLoading = true;
    this.currentNote = '';
    let recordStatus = this.strReportService.parseStatusStringToEnum(
      this.strModel?.creation_status
    );
    let params = {
      recordId: this.strModel.id,
      actionName: 'CHANGE_STATUS',
      statusFrom:
        this.strReportService.parseStatusEnumToInt(recordStatus) ??
        this.strReportService.parseStatusEnumToInt(ReportStatusEnum.DRAF),
      statusTo: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.INPUTER_SUBMITED
      ),
    };
    this.askForConfirmation('Trình kiểm Soát', 'Đồng ý', params);
  }

  /** ------------------- **/
  hasVisibleBtnDuyetNoiDung() {
    return (
      this.currentStatus == ReportStatusEnum.INPUTER_SUBMITED &&
      this.currentUserRole == UserRole.AUTHORISER
    );
  }

  onDuyetNoiDungSubmit() {
    this.isLoading = true;
    this.currentNote = '';
    let params = {
      recordId: this.strModel.id,
      actionName: 'CHANGE_STATUS',
      statusFrom: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.INPUTER_SUBMITED
      ),
      statusTo: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.AUTHORISER_APPROVED
      ),
    };
    this.askForConfirmation('Duyệt nội dung', 'Đồng ý', params);
  }

  /** ------------------- **/
  hasVisibleBtnKhongDuyetNoiDung() {
    return (
      this.currentStatus == ReportStatusEnum.INPUTER_SUBMITED &&
      this.currentUserRole == UserRole.AUTHORISER
    );
  }

  onKhongDuyetNoiDungSubmit() {
    this.isLoading = true;
    this.currentNote = '';
    let params = {
      recordId: this.strModel.id,
      actionName: 'CHANGE_STATUS',
      statusFrom: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.INPUTER_SUBMITED
      ),
      statusTo: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.AUTHORISER_NOT_APPROVED
      ),
    };
    this.askForConfirmation('Không duyệt nội dung', 'Không duyệt', params);
  }

  /** ------------------- **/

  hasVisibleBtnDuyetGuiLenCuc() {
    return (
      this.currentStatus == ReportStatusEnum.AUTHORISER_APPROVED &&
      this.currentUserRole == UserRole.REPORTER
    );
  }

  onDuyetGuiLenCucSubmit() {
    this.isLoading = true;
    this.currentNote = '';
    let params = {
      recordId: this.strModel.id,
      actionName: 'CHANGE_STATUS',
      statusFrom: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.AUTHORISER_APPROVED
      ),
      statusTo: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.REPORTER_APPROVED
      ),
    };
    this.askForConfirmation('Duyệt gửi Cục', 'Đồng ý', params);
  }

  /** ------------------- **/

  hasVisibleBtnKhongDuyetGuiLenCuc() {
    return (
      this.currentStatus == ReportStatusEnum.AUTHORISER_APPROVED &&
      this.currentUserRole == UserRole.REPORTER
    );
  }

  onKhongDuyetGuiLenCuc() {
    this.isLoading = true;
    this.currentNote = '';
    let params = {
      recordId: this.strModel.id,
      actionName: 'CHANGE_STATUS',
      statusFrom: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.AUTHORISER_APPROVED
      ),
      statusTo: this.strReportService.parseStatusEnumToInt(
        ReportStatusEnum.REPORTER_NOT_APPROVED
      ),
    };
    this.askForConfirmation('Không duyệt gửi Cục', 'Không duyệt', params);
  }

  /** ------------------- **/

  /** ------------------- **/

  getParseSTRStatus(strModel: any): string {
    return this.strReportService.parseStatusStringToEnum(
      strModel?.creation_status
    );
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

  askForConfirmation(
    name: string,
    desc: string,
    params: any,
    preSubmit = null
  ) {
    this.toastr.info('Vui lòng nhập mô tả', name);
    this.currentName = name;
    this.isRequiredNote = false;

    if (
      this.strReportService.parseStatusStringToEnum(params.statusTo) ==
        ReportStatusEnum.AUTHORISER_NOT_APPROVED ||
      this.strReportService.parseStatusStringToEnum(params.statusTo) ==
        ReportStatusEnum.REPORTER_NOT_APPROVED
    ) {
      this.isRequiredNote = true;
    }
    this.isDisplayNote = true;
    this.isDisplaySecondSubmit = true;
    this.currentParamObj = params;
    console.log('set current action');
    this.currentAction = () =>
      this.strReportService
        .onChangeReportStatus(this.strModel.id, this.currentParamObj)
        .pipe(
          catchError((error) => {
            console.error('Lỗi khi gọi API:', error);
            this.displayErrorNotification(error?.message ?? error);
            return throwError(() => error); // Trả lỗi về Observable để xử lý tiếp
          })
        )
        .subscribe(
          (res) => {
            console.log('current action responsed');
            if (res.id) {
              // update this str model
              this.currentStatus =
                this.strReportService.parseStatusStringToEnum(
                  this.strModel.creation_status
                );
              this.strModel = res;
              this.displaySuccessNotification(
                'Thông báo STR-' + this.strModel?.str_internal_number
              );
              this.reloadPage();
            } else {
              // this.displayErrorNotification(
              //   res.
              // );
              debugger;
              console.error(res);
              alert(res);
            }
          },
          (error) => {
            this.displayErrorNotification(error);
          }
        );
  }

  submitCurrentPendingTask() {
    if (this.currentAction) {
      console.log('current called');
      this.currentNote = this.currentNote?.trim();

      if (this.isRequiredNote && !this.currentNote?.length) {
        this.toastr.error('Yêu cầu nhập lý do');
        return;
      } else {
        this.currentParamObj.actionNote = this.currentNote;

        let isRequireDigitalSign =
          this.currentParamObj.statusTo ===
          this.strReportService.parseStatusEnumToInt(
            ReportStatusEnum.REPORTER_APPROVED
          );

        console.log('isRequireDigitalSign: ' + isRequireDigitalSign);
        if (!isRequireDigitalSign) {
          this.currentAction();
        } else {
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
                  this.currentNote = '';
                  this.isRequiredNote = false;
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
                  this.currentNote = '';
                  this.isRequiredNote = false;
                  this.isDisplayNote = false;
                  this.isDisplaySecondSubmit = false;
                }, 300);
              }
              // else null
            });
        }

        setTimeout(() => {
          this.currentNote = '';
          this.isRequiredNote = false;
          this.isDisplayNote = false;
          this.isDisplaySecondSubmit = false;
        }, 300);
      }
    }
  }

  cancelCurrentPendingTask() {
    this.currentAction = null;
    this.currentNote = this.currentNote?.trim();
    this.isDisplayNote = false;
    this.isDisplaySecondSubmit = false;

    this.toastr.info('Đã hủy hành động');
  }

  parseEventNameToString(evtName: string) {
    switch (evtName) {
      case 'INPUTER_CREATED':
        return 'Tạo mới STR';
      case 'INPUTER_UPDATED':
        return 'Chỉnh sửa nội dung';
      case 'INPUTER_SUBMITED':
        return 'Đang trình kiểm soát';
      case 'AUTHORISER_APPROVED':
        return 'Phê duyệt nội dung';
      case 'AUTHORISER_NOT_APPROVED':
        return 'Không phê duyệt nội dung';
      case 'REPORTER_APPROVED':
        return 'Phê duyệt báo cáo';
      case 'REPORTER_NOT_APPROVED':
        return 'Không phê duyệt báo cáo';
      case 'INPUTER_UPDATED':
        return 'Tạo mới STR';
      case 'INPUTER_CREATED':
        return 'Chỉnh sửa nội dung';
      case 'AMLD_CONFIRMED':
        return 'Cục PCRT xác nhận';
      case 'AMLD_REJECTED':
        return 'Cục PCRT hoàn trả';
      case 'ATTACHMENT_ADDED':
        return 'Thêm file đính kèm';
      case 'ATTACHMENT_DELETED':
        return 'Xóa file đính kèm';
      default:
        return evtName;
    }
  }

  parseEventStatusToString(status: string) {
    return this.strReportService.parseStatusStringToEnum(status);
  }
}
