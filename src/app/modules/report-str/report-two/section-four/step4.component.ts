import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { ICreateAccount } from '../create-account.helper';
import { PersonService } from '../section-two/services/person.service';
import { Person } from '../section-two/models/person';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as xls from 'xlsx'
import { OrganizationService } from '../section-two/services/organization.service';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
})
export class Step4Component implements OnInit, OnDestroy {
  @Input('updateParentModel') updateParentModel: (
    part: Partial<ICreateAccount>,
    isFormValid: boolean
  ) => void;
  @Input() defaultValues: Partial<ICreateAccount>;

  addForm!: FormGroup
  displayPerson$: Observable<Person[]> | undefined; // Thay đổi kiểu dữ liệu

  constructor(private fb: FormBuilder, private personService: PersonService, private modalService: NgbModal, private organizationService: OrganizationService) { }

  ngOnInit() {
  }

  get bankAccounts(): FormArray {
    return this.addForm.get('tai_khoan') as FormArray;
  }

  initForm() {
  }

  ngOnDestroy() {
  }

  importPersonFromCSV(event: any) {
    const file = event.target.files[0];
    let fr = new FileReader();

    fr.readAsArrayBuffer(file);

    fr.onload = () => {

      let data = fr.result;
      let workbook = xls.read(data, { type: 'array' });

      const sheetname = workbook.SheetNames[0];

      const sheet1 = workbook.Sheets[sheetname]
    }
  }

}
