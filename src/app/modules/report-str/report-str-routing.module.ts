import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportStrComponent } from './report-str.component';
import { ReportOneComponent } from './report-one/report-one.component';
import { ReportTwoComponent } from './report-two/report-two.component';
import { Auth } from '../auth/services/guard';



const routes: Routes = [
  {
    path: '',
    component: ReportStrComponent,
    children: [
      {
        path: 'report-one',
        canActivate: [Auth],
        component: ReportOneComponent,
        data: { roles: ['reviewer']}
      },
      {
        path: 'report-two',
        canActivate: [Auth],
        component: ReportTwoComponent,
        data: { roles: ['inputer'] }
      },
      
      { path: '', redirectTo: 'report-one', pathMatch: 'full' },
      { path: '**', redirectTo: 'report-one', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportCtrRoutingModule {}
