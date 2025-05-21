import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ICreateAccount, inits } from './create-account.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { STRModelService } from '../report-two/section-two/services/str-model.service';
import { AuthService } from 'src/app/modules/auth';
import { ToastrService } from 'ngx-toastr';
import { Step1Component } from './section-one/step1.component';
import { Step2Component } from './section-two/step2.component';
import { Step3Component } from './section-three/step3.component';
import { Step4Component } from './section-four/step4.component';
import { Step5Component } from './section-five/step5.component';
import { Step6Component } from './section-six/step6.component';

@Component({
  selector: 'app-report-two',
  templateUrl: './report-two.component.html',
  styleUrls: ['./report-two.component.scss'],
})
export class ReportTwoComponent implements OnInit {

  reportId: string;
  formsCount = 7;
  account$: BehaviorSubject<ICreateAccount> =
    new BehaviorSubject<ICreateAccount>(inits);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private unsubscribe: Subscription[] = [];
  strReport: any;
  @ViewChild(Step1Component) step1Child!: Step1Component;
  @ViewChild(Step2Component) step2Child!: Step2Component;
  @ViewChild(Step3Component) step3Child!: Step3Component;
  @ViewChild(Step4Component) step4Child!: Step4Component;
  @ViewChild(Step5Component) step5Child!: Step5Component;
  @ViewChild(Step6Component) step6Child!: Step6Component;

  private tab1InputData: any;
  private tab2InputData: any;
  private tab3InputData: any;
  private tab4InputData: any;
  private tab5InputData: any;
  private tab6InputData: any;

  constructor(
    private route: ActivatedRoute,
    private strModelService: STRModelService,
    private authService: AuthService,
    private toarService: ToastrService
  ) { }
  ngOnInit(): void {
    // Lấy ID từ URL
    this.route.params.subscribe(params => {
      this.reportId = params['id'];
      // console.log(this.reportId)
      if (this.reportId) {
        this.loadExistingData(this.reportId);
      } else {
        if (!this.strReport?.id) {
          this.strReport = { id: null, payload: { Phan_1: {}, Phan_2: {}, Phan_3: {}, Phan_4: {}, Phan_5: {}, Phan_6: {} } }
        }
      }
    });
  }

  // Gọi API lấy dữ liệu từ MongoDB
  loadExistingData(id: string) {
    this.strModelService.getSTRModelById(id).subscribe(
      (response) => {
        this.strReport = response;
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    );
  }


  onCacheSinglePartOfReport(tabName: string, updatingStrReport: any) {
    console.info('onSaveSinglePartOfReport:', tabName);
    console.info(updatingStrReport);
    
    this.strReport = updatingStrReport;
  }

  onSaveSinglePartOfReport(tabName: string, updatingStrReport: any) {
    console.info('onSaveSinglePartOfReport:', tabName);
    console.info(updatingStrReport);

    if (!updatingStrReport?.id) {
      // new report
      console.info("Submit new report when id is null");
      // Call API lưu dữ liệu
      this.strModelService.saveSTRModel(updatingStrReport).subscribe(
        (res) => {
          console.log('Lưu thành công:', res);

          if (res.id) {
            this.strReport = res;
            this.toarService.success("STR vừa tạo có mã nội bộ: " + res.str_internal_number, "Lưu thành công")

          }
        },
        (error) => {
          console.error('Lỗi khi lưu:', error);
          this.toarService.error("STR vừa tạo bị lỗi");
        }
      );


    } else {
      console.info("Update report when id is is visible");

      // Call API cập nhật dữ liệu
      this.strModelService.saveSTRModel(updatingStrReport).subscribe(
        (res) => {
          console.log('Lưu thành công:', res);

          if (res.id) {
            this.strReport = res;
            this.toarService.success("STR vừa cập nhật có mã nội nộ: " + res.str_internal_number, "Cập nhật thành công")

          }
        },
        (error) => {
          console.error('Lỗi khi lưu:', error);
          this.toarService.error("STR vừa cập nhật bị lỗi");
        }
      );

    }
  }

  updateAccount = (part: Partial<ICreateAccount>, isFormValid: boolean) => {
    const currentAccount = this.account$.value;
    const updatedAccount = { ...currentAccount, ...part };
    this.account$.next(updatedAccount);
    this.isCurrentFormValid$.next(isFormValid);
  };

  nextStep() {
    const nextStep = this.currentStep$.value + 1;
    if (nextStep > this.formsCount) {
      return;
    }
    this.currentStep$.next(nextStep);
  }

  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  
  setTab(value: number) {
    console.log(this.currentStep$.value)
    this.currentStep$.next(value);

    // cache the last tab 
    console.log("cache the last tab")
    this.tab1InputData =  this.step1Child!.updateCurrentInputData();
    this.tab2InputData =  this.step2Child!.updateCurrentInputData();
    this.tab3InputData =  this.step3Child!.updateCurrentInputData();
    this.tab4InputData =  this.step4Child!.updateCurrentInputData();
    this.tab5InputData =  this.step5Child!.updateCurrentInputData();
    if(value == 6)
      this.tab6InputData =  this.step6Child!.updateCurrentInputData();

    // re binding inputing data to the model
    this.strReport.payload.Phan_1 = this.tab1InputData.payload.Phan_1;
    this.strReport.payload.Phan_2 = this.tab2InputData.payload.Phan_2;
    this.strReport.payload.Phan_3 = this.tab3InputData.payload.Phan_3;
    this.strReport.payload.Phan_4 = this.tab4InputData.payload.Phan_4;
    this.strReport.payload.Phan_5 = this.tab5InputData.payload.Phan_5;
    this.strReport.payload.Phan_6 = this.tab6InputData.payload.Phan_6;

    console.log("current model data")
    console.log(this.strReport)

  }

}
