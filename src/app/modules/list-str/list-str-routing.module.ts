import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListStrComponent } from './list-str.component';
import { ClassicComponent } from 'src/app/_metronic/layout/components/toolbar/classic/classic.component';



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
export class ListCtrRoutingModule {}
