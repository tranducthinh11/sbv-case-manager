import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { SharedModule } from "../../_metronic/shared/shared.module";
import { FormsModule } from '@angular/forms';
import { STRStatisticalComponent } from './component/str-statistical.component';

@NgModule({
  declarations: [DashboardComponent, STRStatisticalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    SharedModule,
    FormsModule
  ],
})
export class DashboardModule {}
