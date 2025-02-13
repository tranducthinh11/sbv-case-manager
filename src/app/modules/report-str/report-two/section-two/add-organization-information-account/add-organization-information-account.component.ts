import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PersonService } from '../services/person.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BankAccountNumber } from '../models/bank-account-number';
import { AuthorizedPersonInformation } from '../models/information-authorized-person';

@Component({
  selector: 'app-add-information-bank-account',
  templateUrl: './add-organization-information-account.component.html',
  styleUrl: './add-organization-information-account.component.scss'
})
export class AddOrganizationInformationAccountComponent implements OnInit {
  @Input() initialData: number | undefined;
  addOrganizationAccountForm!: FormGroup;

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal) { } // Inject NgbActiveModal

  ngOnInit(): void {
    console.log("Initial data:", this.initialData);

    this.addOrganizationAccountForm = this.fb.group({
      ho_ten: ['', Validators.required],
      quan_he_voi_chu_tai_khoan: [''],
      thong_tin_dinh_danh: this.fb.array([this.createPersonallyInformation()])
    });
  }

  setPersonInformation(personInformation: any[]) {
    const personInformationFGs = personInformation.map(personInformation => this.fb.group(personInformation));
    const personInformationFormArray = this.fb.array(personInformationFGs);
    this.addOrganizationAccountForm.setControl('thong_tin_dinh_danh', personInformationFormArray);
  }

  get personallyInformations(): FormArray {
    return this.addOrganizationAccountForm.get('thong_tin_dinh_danh') as FormArray;
  }

  createPersonallyInformation(): FormGroup {
    return this.fb.group({
      loai_dinh_danh: ['1'], // Set default value if needed
      so_dinh_danh: [''],
      ngay_cap: [''],
      ngay_het_han: [''],
      noi_cap: ['']
    });
  }

  addRow(): void {
    this.personallyInformations.push(this.createPersonallyInformation());
  }

  deleteRow(index: number): void {
    this.personallyInformations.removeAt(index);
  }

  addOrganizationSubmit(): void {
    if (this.addOrganizationAccountForm.valid) {
      console.log("Submitted data:", this.addOrganizationAccountForm.value);
      const newInformationAuthozied = new AuthorizedPersonInformation(this.addOrganizationAccountForm.value);

      this.activeModal.close(newInformationAuthozied);
    } else {
      this.validateAllFormFields(this.addOrganizationAccountForm);
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormArray) {
        control.controls.forEach(formGroupChild => {
          this.validateAllFormFields(formGroupChild as FormGroup);
        })
      }
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }
}
