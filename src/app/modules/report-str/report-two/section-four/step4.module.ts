import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbTooltipModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddPersonComponent } from './person/add-person/add-person.component';
import { EditPersonComponent } from './person/edit-person/edit-person.component';
import { AddTransactionComponent } from './transaction/add-transaction/add-transaction.component';
import { EditTransactionComponent } from './transaction/edit-transaction/edit-transaction.component';

@NgModule({
  declarations: [
    AddPersonComponent,
    EditPersonComponent,
    AddTransactionComponent,
    EditTransactionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbModule,
  ],
  exports: [
    AddPersonComponent,
    EditPersonComponent,
    AddTransactionComponent,
    EditTransactionComponent
  ],
})
export class Step4Module {}
