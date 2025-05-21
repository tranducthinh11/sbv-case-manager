import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbTooltipModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { AddOrganizationInformationAccountComponent } from './organization/add-organization-information-account/add-organization-information-account.component';
import { AddOrganizationComponent } from './organization/add-organization/add-organization.component';
import { AddInformationBankAccountComponent } from './person/add-information-bank-account/add-information-bank-account.component';
import { EditPersonComponent } from './person/edit-person/edit-person.component';
import { AddPersonComponent } from './person/add-person/add-person.component';
import { AddLegalRepresentativeComponent} from "./organization/add-legal-representative/add-legal-representative.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ViewAuthorizedPersonsComponent } from './person/view-authorized-persons/view-authorized-persons.component';
import { ViewAuthorizedOrganizationComponent} from "./organization/view-authorized-organization/view-authorized-organization.component";
import { ViewLegalRepresentativeComponent } from './organization/view-legal-representative/view-legal-representative.component';
import { EditOrganizationComponent } from './organization/edit-organization/edit-organization.component';
import { AddOtherOwnerComponent } from './other-owner/add-other-owner/add-other-owner.component';
import { EditOtherOwnerComponent } from './other-owner/edit-other-owner/edit-other-owner.component';
import { AttachmentComponent } from '../section-six/add-attachment/attachment.component';
import { EditLegalRepresentativeComponent} from "./organization/edit-legal-representative/edit-legal-representative.component";
import { EditAuthorizedOrganizationComponent} from "./organization/edit-authorized-organization/edit-authorized-organization.component";
import { EditAuthorizedPersonComponent} from "./person/edit-authorized-person/edit-authorized-person.component";

@NgModule({
  declarations: [
    AddOrganizationInformationAccountComponent,
    AddOrganizationComponent,
    AddInformationBankAccountComponent,
    EditPersonComponent,
    AddPersonComponent,
    AddLegalRepresentativeComponent,
    ViewAuthorizedPersonsComponent,
    ViewAuthorizedOrganizationComponent,
    ViewLegalRepresentativeComponent,
    EditOrganizationComponent,
    AddOtherOwnerComponent,
    EditOtherOwnerComponent,
    AttachmentComponent,
    EditLegalRepresentativeComponent,
    EditAuthorizedOrganizationComponent,
    EditAuthorizedPersonComponent
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
    AddLegalRepresentativeComponent,
    ViewAuthorizedPersonsComponent,
    ViewAuthorizedOrganizationComponent,
    ViewLegalRepresentativeComponent,
    EditOrganizationComponent,
    AddOtherOwnerComponent,
    EditOtherOwnerComponent,
    AttachmentComponent,
    EditLegalRepresentativeComponent,
    EditAuthorizedOrganizationComponent,
    EditAuthorizedPersonComponent
  ],
})
export class Step2Module {}
