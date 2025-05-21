import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbTooltipModule, NgbDropdownModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { AddOrganizationComponent } from './organization/add-organization/add-organization.component';
import { EditPersonComponent } from './person/edit-person/edit-person.component';
import { AddPersonComponent } from './person/add-person/add-person.component';
import { EditOrganizationComponent } from './organization/edit-organization/edit-organization.component';
import { AddOrEditPersonComponent } from './person/add-or-edit-person/add-or-edit-person.component';
import { AddOrEditOrganizationComponent } from './organization/add-or-edit-organization/add-or-edit-organization.component';

@NgModule({
  declarations: [
    AddOrganizationComponent,
    EditPersonComponent,
    AddPersonComponent,
    EditOrganizationComponent,

    AddOrEditPersonComponent,
    AddOrEditOrganizationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbDatepickerModule
  ],
  exports: [
    AddOrganizationComponent,
    EditPersonComponent,
    AddPersonComponent,
    EditOrganizationComponent,

    AddOrEditPersonComponent,
    AddOrEditOrganizationComponent
  ],
})
export class Step3Module {}