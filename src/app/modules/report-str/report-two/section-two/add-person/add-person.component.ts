import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PersonService } from '../services/person.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Person } from '../models/person';
import { BankAccountNumber } from '../models/bank-account-number';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddInformationBankAccountComponent } from '../add-information-bank-account/add-information-bank-account.component';
import {AuthorizedPersonInformation} from '../models/information-authorized-person';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.scss']
})
export class AddPersonComponent implements OnInit {
  addForm!: FormGroup
  isSubmit = false
  showAlert = false
  isExisting = false
  isSuccess = false
  bankAccountNumber: BankAccountNumber[] = [];

  constructor(private fb: FormBuilder, private personService: PersonService, public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.addForm = this.fb.group({
      ho_ten: [''],
      ngay_sinh: [''],
      do_tuoi: [''],
      gioi_tinh: [''],
      quoc_tich: [''],
      nghe_nghiep: [''],
      chuc_vu: [''],
      dia_chi_quan_huyen: [''],
      dia_chi_tinh_thanh: [''],
      dia_chi_quoc_gia: [''],
      noi_o_quan_huyen: [''],
      noi_o_tinh_thanh: [''],
      noi_o_quoc_gia: [''],
      loai_dinh_danh: [''],
      so_dinh_danh: [''],
      co_quan_cap: [''],
      noi_cap: [''],
      ngay_cap: [''],
      ngay_het_han: [''],
      so_dien_thoai: [''],
      tai_khoan: this.fb.array([this.newBankAccount()])
    });

    // Subscribe vào sự thay đổi của ngay_sinh
    this.addForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.calculateAndSetAgeRange(birthDate);
      }
    });

    // add a default row for bank account number
    // this.addRow();
  }

  get bankAccounts(): FormArray {
    return this.addForm.get('tai_khoan') as FormArray;
  }

  newBankAccount(): FormGroup {
    return this.fb.group({
      so_tai_khoan: '',
      ngan_hang: '',
      loai_tien: '',
      loai_tai_khoan: '',
      ngay_mo: '',
      trang_thai: 'active',
      nguoi_duoc_uy_quyen: this.fb.array([])
    });
  }

  addPersonSubmit() {
    this.isSubmit = true;

    const isSubmit = confirm('Bạn có chắc chắn muốn thêm đối tượng báo cáo này?');

    if (isSubmit) {
      if (this.addForm.invalid) {
        return;
      }
      const data = this.addForm.value;

      const newPerson = new Person(data);

      const id = new Date(Date.now()).getTime();
      newPerson.id = id;

      if (!this.personService.addPerson(newPerson)) {
        this.showAlert = true;
        this.isExisting = true;
        this.isSuccess = false;
      }
      else {
        this.showAlert = true;
        this.isExisting = false;
        this.isSuccess = true;
        this.isSubmit = false;
        this.addForm.reset();
        this.bankAccountNumber = [];
      }
      this.activeModal.close();
    }

  }

  // Dynamic table in bank account number
  addRow() {
    this.bankAccounts.push(this.newBankAccount());
  }

  deleteRow(index: number) {
    this.bankAccountNumber.splice(index, 1);
  }

  calculateAndSetAgeRange(birthDate: string) {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    let rangeValue: string | null = null;
    if (age < 20) {
      rangeValue = 'range-1';
    } else if (age < 30) {
      rangeValue = 'range-2';
    } else if (age < 40) {
      rangeValue = 'range-3';
    } else if (age < 50) {
      rangeValue = 'range-4';
    } else {
      rangeValue = 'range-5';
    }

    if (rangeValue) {
      this.addForm.get('do_tuoi')?.setValue(rangeValue);
    } else {
      this.addForm.get('do_tuoi')?.setValue(null);
    }
  }

  createInformationAccount(index: number) {
    const modalRef = this.modalService.open(AddInformationBankAccountComponent, { size: 'xl' });
    modalRef.result.then((result: AuthorizedPersonInformation) => {
      console.log("Dữ liệu nhận được từ modal:", result);

      // Get FormGroup at index in tai_khoan FormArray
      const bankAccount = this.bankAccounts.at(index) as FormGroup;

      // Get authorizedPerson FormArray from bankAccount
      const authorizedPersonArray = bankAccount.get('nguoi_duoc_uy_quyen') as FormArray;

      // Push ho_ten and quan_he_voi_chu_tai_khoan as part of the main object
      const authorizedPersonFormGroup = this.fb.group({
        ho_ten: [result.ho_ten], // Add ho_ten
        thong_tin_dinh_danh: this.fb.array([]) // Nested array for thong_tin_dinh_danh
      });

      // Populate thong_tin_dinh_danh array
      const thongTinDinhDanhArray = authorizedPersonFormGroup.get('thong_tin_dinh_danh') as FormArray;
      result.thong_tin_dinh_danh.forEach(personInfo => {
        thongTinDinhDanhArray.push(this.fb.group({
          loai_dinh_danh: [personInfo.loai_dinh_danh],
          so_dinh_danh: [personInfo.so_dinh_danh],
          ngay_cap: [personInfo.ngay_cap],
          ngay_het_han: [personInfo.ngay_het_han],
          noi_cap: [personInfo.noi_cap]
        }));
      });

      // Add the complete structure to nguoi_duoc_uy_quyen
      authorizedPersonArray.push(authorizedPersonFormGroup);
    }).catch((reason) => {
      console.log('Modal bị đóng với lý do:', reason);
    });
  }


}
