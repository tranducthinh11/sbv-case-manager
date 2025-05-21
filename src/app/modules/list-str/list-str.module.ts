import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListStrRoutingModule } from './list-str-routing.module';
import { ListStrComponent } from './list-str.component';
import {
  DropdownMenusModule,
  ModalsModule,
  WidgetsModule,
} from '../../_metronic/partials';
import { SharedModule } from '../../_metronic/shared/shared.module';
import { CrudModule } from 'src/app/modules/crud/crud.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbAccordionModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ReportStrModule } from '../report-str/report-str.module';
import { PreviewSTRComponent } from './preview-str/preview-str.component';
import { Step1Component } from '../report-str/report-two/section-one/step1.component';
import { TruncatePipe } from './pipes/truncate-pipe.pipe';
import { CustomLabelWithTooltipComponent } from './custom-lable-with-tooltip/custom-lable-with-tooltip.component';
import { NgxPrintModule } from 'ngx-print';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { DigitalSignSTRComponent } from './digitalsign-str/digitalsign-str.component';
export let InjectorInstance: Injector;


@NgModule({
  declarations: [
    ListStrComponent,
    PreviewSTRComponent,
    DigitalSignSTRComponent,
    TruncatePipe,
    CustomLabelWithTooltipComponent,
  ],
  imports: [
    CrudModule,
    CommonModule,
    ListStrRoutingModule,
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
    ModalsModule,
    NgbAccordionModule,
    NgxPrintModule,
    ReportStrModule,
    
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class ListStrModule {

  constructor(private injector: Injector) 
  {
    InjectorInstance = this.injector;
  }
  
}
