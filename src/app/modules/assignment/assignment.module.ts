import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssignmentComponent } from './assignment.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { SharedModule } from "../../_metronic/shared/shared.module";
import { FormsModule } from '@angular/forms';
import { STRStatisticalComponent } from './component/str-statistical.component';

@NgModule({
  declarations: [AssignmentComponent, STRStatisticalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AssignmentComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    SharedModule,
    FormsModule
  ],
})
export class AssignmentModule {}
