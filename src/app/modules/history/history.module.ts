import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HistoryRoutingModule } from './history-routing.module';
import { HistoryComponent } from './history.component';



import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import {SharedModule} from "../../_metronic/shared/shared.module";
import { CrudModule } from 'src/app/modules/crud/crud.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbDropdownModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    HistoryComponent
  ],
  imports: [
    CrudModule,
    CommonModule,
    HistoryRoutingModule,
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
  ],
})
export class HistoryModule {}
