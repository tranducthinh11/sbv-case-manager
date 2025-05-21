import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListStrComponent } from './list-str.component';



const routes: Routes = [
  {
    path: '',
    component: ListStrComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListStrRoutingModule {}
