import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCtrRoutingModule } from './report-str-routing.module';
import { ReportStrComponent } from './report-str.component';
import { ReportOneComponent } from './report-one/report-one.component';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import {SharedModule} from "../../_metronic/shared/shared.module";
import { CrudModule } from 'src/app/modules/crud/crud.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbAccordionModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
  NgbDateParserFormatter,
  NgbInputDatepicker
} from '@ng-bootstrap/ng-bootstrap';
import { Step1Component } from './report-two/section-one/step1.component';
import { Step2Component } from './report-two/section-two/step2.component';
import { Step3Component } from './report-two/section-three/step3.component';
import { Step4Component } from './report-two/section-four/step4.component';
import { Step5Component } from './report-two/section-five/step5.component';
import { ReportTwoComponent } from './report-two/report-two.component';
import { Step6Component } from './report-two/section-six/step6.component';
import { Step2Module } from './report-two/section-two/step2.module';
import { Step3Module } from './report-two/section-three/step3.module';
import { Step4Module } from './report-two/section-four/step4.module';
import { MomentDateFormatter} from "./report-two/service-common/moment-date-formatter";

@NgModule({
  declarations: [
    ReportStrComponent,
    ReportOneComponent,
    ReportTwoComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    Step6Component
  ],
  imports: [
    CrudModule,
    CommonModule,
    ReportCtrRoutingModule,
    DropdownMenusModule,
    WidgetsModule,
    SharedModule,

    FormsModule,
    ReactiveFormsModule,
    CrudModule,
    NgbNavModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTooltipModule,
    NgbAccordionModule,
    Step2Module,
    Step3Module,
    Step4Module,
    NgbInputDatepicker
  ],
  exports: [
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    Step6Component
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter },
  ],
  bootstrap: [ReportStrComponent]
})
export class ReportStrModule {}
