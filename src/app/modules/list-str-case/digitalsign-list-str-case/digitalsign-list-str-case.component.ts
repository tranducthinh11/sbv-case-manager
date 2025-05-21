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
import { FormGroup, NgForm } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserRole } from '../services/user-role.enum';
import { AuthService, UserType } from '../../auth/services/auth.service';
import { ReportStatusEnum } from '../services/report-status.enum';
import { ToastrService } from 'ngx-toastr';
import { DataTablesResponse, LoggingService } from '../services/logging.service';
import { Signature } from 'src/app/model/signature';
import { SignatureResponse } from 'src/app/model/signature-response.model';
import { SignatureService } from 'src/app/common/signature.service';
import { HttpResponse } from '@angular/common/http';
import { StaticService } from '../services/static.service';
import { STRReportService } from '../../list-str/services/report-list.service';
declare var sbvca_sign_msg: any;

type Tabs = 'Detail' | 'History';

@Component({
  selector: 'digitalsign-list-str-case',
  styleUrls: ['./digitalsign-list-str-case.component.css'],
  templateUrl: './digitalsign-list-str-case.component.html',
})
export class DigitalSignSTRComponent implements OnInit {
  @ViewChild('formModal') formModal: TemplateRef<any>;
  @Input() strModel!: any;

  @Input() currentUserRole!: UserRole;
  @Input() currentUserProfile!: UserType;

  @Input() active: boolean = false;

  @Output() onClosed: EventEmitter<void>;
  form: FormGroup;
  formsCount = 5;

  currentStatus: ReportStatusEnum = ReportStatusEnum.DRAF;
  public logResultData: DataTablesResponse | null;
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(2);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  data: string = 'aaaaaaaaaaaaaaaaa'; // dữ liệu cần ký
  serialcts: string = ''; // serial của token key
  isPassedSerial: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,

    private strReportService: STRReportService,

    public toastr: ToastrService,
    private loggingService: LoggingService
  ) {
    console.log('strModel');
    console.log(this.strModel);
  }

  ngOnInit(): void {
    console.log('strModel');
    console.log(this.strModel);
    // this.currentStatus = this.strReportService.parseStatusStringToEnum(
    //   this.strModel.creation_status
    // );
    this.loggingService.updateHistoryOfReportManager(
      { page: 0, size: 10, sort: ['id', 'desc'] },
      { id: this.strModel?.id }
    );

    this.loggingService.searchingReportSTRListData$.subscribe((log) => {
      this.logResultData = log;
    });
  }

  onVerifySerial(): void {
    let _message: string = (Signature.data = btoa(
      encodeURIComponent(this.strModel)
    ));
    Signature.data = _message; // dữ liệu cần ký
    const _serial: string = this.serialcts; //serial number của chứng thư số để ký // 0x027e69e0 - 41839072 || 0x027e6a37 - 41839159

    sbvca_sign_msg(_serial, _message, this.signCallback);
  }

  // callback
  signCallback(rv: any) {
    var received_msg = JSON.parse(rv);
    StaticService.getInstance().setSignDataResponse(received_msg);

    if (received_msg.statusCode == 1) {
      // navigate to success step
      StaticService.getInstance().setIsValidToken(1);
      Signature.signature = received_msg.signature;
      Signature.dn = received_msg.dn;
      DigitalSignSTRComponent.verifiedSignature(
        Signature.signature,
        Signature.dn
      );
    } else {
      StaticService.getInstance().setIsValidToken(-1);
      console.log(
        'Ký số không thành công:' +
          received_msg.statusCode +
          ':' +
          received_msg.statusContent
      );
    }
  }

  skipSign() {
    StaticService.getInstance().setSignDataResponse({
      statusCode: 1,
      statusContent: 'Ký số thành công'
    });
    StaticService.getInstance().setIsValidToken(1);

  }

  // gọi API Backend để verify lại
  public static verifiedSignature(signature: string, dn: string) {
    let signatureObj = {
      data: Signature.data,
      signature: signature,
      dn: dn,
    };
    console.log(Signature.data);
    console.log(signature);
    console.log(dn);

    SignatureService.verifySignature(signatureObj).subscribe({
      next: (res: HttpResponse<SignatureResponse>) => {
        console.log('Verify1111111111111');
        console.log(res.body);
      },
      error: () => {
        console.log('Lỗi hệ thống');
      },
    });
  }

  public static close() {}

  nextStep() {
    const nextStep = this.currentStep$.value + 1;
    if (nextStep > this.formsCount) {
      return;
    }
   
    // check the serial number
    if (nextStep === 3) {
      this.onVerifySerial();
    } else {
      this.currentStep$.next(nextStep);
    }
  }

  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }
}
