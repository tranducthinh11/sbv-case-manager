import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListStrCaseComponent } from './list-str-case.component';



const routes: Routes = [
  {
    path: '',
    component: ListStrCaseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListStrRoutingModule {}
