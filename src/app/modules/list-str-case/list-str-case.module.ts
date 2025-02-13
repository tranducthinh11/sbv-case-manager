import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListCtrCasseRoutingModule } from './list-str-case.routing.module';
import { ListStrCaseComponent } from './list-str-case.component';



import { DropdownMenusModule, ModalsModule, WidgetsModule } from '../../_metronic/partials';
import {SharedModule} from "../../_metronic/shared/shared.module";
import { CrudModule } from 'src/app/modules/crud/crud.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbCollapseModule, NgbDropdownModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
//import { ViewReportOneComponent } from '../report-str/report-one/view/view-report-one.component';

@NgModule({
  declarations: [
    ListStrCaseComponent,
    //ViewReportOneComponent
  ],
  imports: [
    CrudModule,
    CommonModule,
    ListCtrCasseRoutingModule,
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
    NgbAccordionModule
  ],
})
export class ListStrCaseModule {}
