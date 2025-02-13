import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbTooltipModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { AddOrganizationInformationAccountComponent } from './add-organization-information-account/add-organization-information-account.component';
import { AddOrganizationComponent } from './add-organization/add-organization.component';
import { AddInformationBankAccountComponent } from './add-information-bank-account/add-information-bank-account.component';
import { EditPersonComponent } from './edit-person/edit-person.component';
import { AddPersonComponent } from './add-person/add-person.component';
import {AddLegalRepresentativeComponent} from "./add-legal-representative/add-legal-representative.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AddOrganizationInformationAccountComponent,
    AddOrganizationComponent,
    AddInformationBankAccountComponent,
    EditPersonComponent,
    AddPersonComponent,
    AddLegalRepresentativeComponent
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
    AddOrganizationInformationAccountComponent,
    AddOrganizationComponent,
    AddInformationBankAccountComponent,
    EditPersonComponent,
    AddPersonComponent,
    AddLegalRepresentativeComponent
  ],
})
export class Step2Module {}
