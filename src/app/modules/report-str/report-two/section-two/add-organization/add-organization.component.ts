import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BankAccountNumber } from '../models/bank-account-number';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationService } from '../services/organization.service';
import { Organization } from '../models/organization';
import { AddOrganizationInformationAccountComponent } from '../add-organization-information-account/add-organization-information-account.component';
import { AuthorizedPersonInformation } from '../models/information-authorized-person';


@Component({
  selector: 'app-add-organization',
  templateUrl: './add-organization.component.html',
  styleUrl: './add-organization.component.scss'
})
export class AddOrganizationComponent {
  addFormOrganization!: FormGroup
  isSubmit = false
  showAlert = false
  isExisting = false
  isSuccess = false
  bankAccountNumber: BankAccountNumber[] = [];

  constructor(private fb: FormBuilder, private organizationService: OrganizationService, public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.addFormOrganization = this.fb.group({
      ten_to_chuc: [''],
      ten_tieng_nuoc_ngoai: [''],
      ten_viet_tat: [''],
      loai_hinh_to_chuc: [''],
      so_nha: [''],
      quan_huyen: [''],
      tinh_thanh: [''],
      quoc_gia: [''],
      so_giay_phep: [''],
      ngay_cap: [''],
      noi_cap: [''],
      ms_ma_so: [''],
      ms_ngay_cap: [''],
      ms_noi_cap: [''],
      nghanh_nghe_kinh_doanh: [''],
      so_dien_thoai: [''],
      tai_khoan: this.fb.array([this.createBankAccount()])
    });

  }

  get bankAccounts(): FormArray {
    return this.addFormOrganization.get('tai_khoan') as FormArray;
  }

  createBankAccount(): FormGroup {
    return this.fb.group({
      so_tai_khoan: [''],
      ngan_hang: [''],
      loai_tien: [''],
      loai_tai_khoan: [''],
      ngay_mo: [''],
      trang_thai: ['active'],
      nguoi_duoc_uy_quyen: this.fb.array([])
    });
  }

  addAccountSubmit() {
    this.isSubmit = true;

    const isSubmit = confirm('Bạn có chắc chắn muốn thêm tổ chức này?');

    if (isSubmit) {
      if (this.addFormOrganization.invalid) {
        return;
      }
      const data = this.addFormOrganization.value;

      const newOrganization = new Organization(data);

      const id = new Date(Date.now()).getTime();
      newOrganization.id = id;

      if (!this.organizationService.addOrganization(newOrganization)) {
        this.showAlert = true;
        this.isExisting = true;
        this.isSuccess = false;
      }
      else {
        this.showAlert = true;
        this.isExisting = false;
        this.isSuccess = true;
        this.isSubmit = false;
        this.addFormOrganization.reset();
        this.bankAccountNumber = [];
      }
      this.activeModal.close();
    }

  }

  // Dynamic table in bank account number
  addRow(): void {
    this.bankAccounts.push(this.createBankAccount());
  }

  deleteRow(index: number) {
    this.bankAccountNumber.splice(index, 1);
  }

  createInformationAccount(index: number) {

    const modalRef = this.modalService.open(AddOrganizationInformationAccountComponent, { size: 'xl' });
    modalRef.result.then((result: AuthorizedPersonInformation) => {
      console.log("Dữ liệu nhận được từ modal:", result);
  
      // Get FormGroup at index in tai_khoan FormArray
      const bankAccount = this.bankAccounts.at(index) as FormGroup;
  
      // Get authorizedPerson FormArray from bankAccount
      const authorizedPersonArray = bankAccount.get('nguoi_duoc_uy_quyen') as FormArray;
  
      // Push ho_ten and quan_he_voi_chu_tai_khoan as part of the main object
      const authorizedPersonFormGroup = this.fb.group({
        ho_ten: [result.ho_ten], // Add ho_ten
        quan_he_voi_chu_tai_khoan: [result.quan_he_voi_chu_tai_khoan], // Add quan_he_voi_chu_tai_khoan
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
