import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListStrRoutingModule } from './list-str-routing.module';
import { ListStrCaseComponent } from './list-str-case.component';
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
import { PreviewListSTRCaseComponent } from './preview-list-str-case/preview-list-str-case.component';
import { TruncatePipe } from './pipes/truncate-pipe.pipe';
import { CustomLabelWithTooltipComponent } from './custom-lable-with-tooltip/custom-lable-with-tooltip.component';
import { NgxPrintModule } from 'ngx-print';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { UpdateListSTRCaseComponent } from './update-list-str-case/update-list-str-case.component';
import { DigitalSignSTRComponent } from './digitalsign-list-str-case/digitalsign-list-str-case.component';
export let InjectorInstance: Injector;

@NgModule({
  declarations: [
    ListStrCaseComponent,
    PreviewListSTRCaseComponent,
    UpdateListSTRCaseComponent,
    TruncatePipe,
    CustomLabelWithTooltipComponent,
    DigitalSignSTRComponent,
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
export class ListStrCaseModule {
  constructor(private injector: Injector) 
    {
      InjectorInstance = this.injector;
    }

}
