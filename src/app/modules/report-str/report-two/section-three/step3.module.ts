import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbTooltipModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { AddOrganizationComponent } from './add-organization/add-organization.component';
import { EditPersonComponent } from './edit-person/edit-person.component';
import { AddPersonComponent } from './add-person/add-person.component';

@NgModule({
  declarations: [
    AddOrganizationComponent,
    EditPersonComponent,
    AddPersonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbDropdownModule,
  ],
  exports: [
    AddOrganizationComponent,
    EditPersonComponent,
    AddPersonComponent
  ],
})
export class Step3Module {}