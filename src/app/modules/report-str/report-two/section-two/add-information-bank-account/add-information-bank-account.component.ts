import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PersonService } from '../services/person.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Person } from '../models/person';
import { BankAccountNumber } from '../models/bank-account-number';
import {AuthorizedPersonInformation} from '../models/information-authorized-person';


@Component({
  selector: 'app-add-information-bank-account',
  templateUrl: './add-information-bank-account.component.html',
  styleUrl: './add-information-bank-account.component.scss'
})
export class AddInformationBankAccountComponent {
  addAccountForm!: FormGroup
  isSubmit = false
  showAlert = false
  isExisting = false
  isSuccess = false
  bankAccountNumber: BankAccountNumber[] = [];

  constructor(private fb: FormBuilder, private personService: PersonService, public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.addAccountForm = this.fb.group({
      ho_ten: [''],
      quan_he_voi_chu_tai_khoan: [''],
      thong_tin_dinh_danh: this.fb.array([])
    });
  }

  get bankAccounts(): FormArray {
    return this.addAccountForm.get('thong_tin_dinh_danh') as FormArray;
  }

  newBankAccount(): FormGroup {
    return this.fb.group({
      loai_dinh_danh: '',
      so_dinh_danh: '',
      ngay_cap: '',
      ngay_het_han: '',
      noi_cap: ''
    });
  }

  addAccountSubmit() {
    this.isSubmit = true;

    const isSubmit = confirm('Bạn có chắc chắn muốn thêm đối tượng báo cáo này?');

    if (isSubmit) {
      if (this.addAccountForm.invalid) {
        return;
      }
      const data = this.addAccountForm.value;

      const newAuthorizedPersonInformation = new AuthorizedPersonInformation(data);

      const id = new Date(Date.now()).getTime();
      newAuthorizedPersonInformation.id = id;

      this.activeModal.close(newAuthorizedPersonInformation);
    }

  }

  // Dynamic table in bank account number
  addRow() {
    this.bankAccounts.push(this.newBankAccount());
  }

  deleteRow(index: number) {
    this.bankAccountNumber.splice(index, 1);
  }
}
