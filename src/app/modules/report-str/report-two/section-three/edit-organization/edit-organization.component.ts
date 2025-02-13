import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationService } from '../services/organization.service';
import { Organization } from '../models/organization';

@Component({
  selector: 'app-edit-organization',
  standalone: true,
  imports: [],
  templateUrl: './edit-organization.component.html',
  styleUrl: './edit-organization.component.scss'
})
export class EditOrganizationComponent {
  
}
