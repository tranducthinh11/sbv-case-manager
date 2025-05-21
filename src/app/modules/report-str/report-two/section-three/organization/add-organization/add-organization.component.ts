import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Organization } from '../../models/organization';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';

@Component({
  selector: 'app-add-organization',
  templateUrl: './add-organization.component.html',
  styleUrl: './add-organization.component.scss'
})
export class AddOrganizationComponent {
  addFormOrganization!: FormGroup

  currencys: any[] = [];
  typeAccounts: any[] = [];
  countries: any[] = [];
  typeStatus: any[] = [];

  constructor(private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private strCategoryService: STRCategoryService,
  ) { }

  ngOnInit(): void {
    this.addFormOrganization = this.fb.group({
      ten_to_chuc: [''],
      ten_tieng_nuoc_ngoai: [''],
      ten_viet_tat: [''],
      loai_hinh_to_chuc: null,
      dia_chi: this.fb.group({
        so_nha: [''],
        quan_huyen: [''],
        tinh_thanh: [''],
        quoc_gia: ['VN']
      }),
      giay_phep_thanh_lap: this.fb.group({
        so_giay_phep: [''],
        ngay_cap: [''],
        noi_cap: ['']
      }),
      ma_so_doanh_nghiep: this.fb.group({
        ma_so: [''],
        ngay_cap: [''],
        noi_cap: ['']
      }),
      nganh_nghe_kinh_doanh: [''],
      so_dien_thoai: [''],
      website: [''],
      tai_khoan: this.fb.array([this.createBankAccount()])
    });

    // Lấy danh sách quốc gia
    this.strCategoryService.getCountries().subscribe(data => {
      this.countries = data;
    });

    // Lấy danh sách loại tiền tệ
    this.strCategoryService.getCurrencys().subscribe(data => {
      this.currencys = data;
    });

    // Lấy danh sách loại tài khoản
    this.strCategoryService.getCategory({ type: 6, report_type: 'M1' }).subscribe(data => {
      this.typeAccounts = data;
    });

    // Lấy danh sách trạng thái tài khoản
    this.strCategoryService.getCategory({ type: 4, report_type: 'M1' }).subscribe(data => {
      this.typeStatus = data;
    });

  }

  get bankAccounts(): FormArray {
    return this.addFormOrganization.get('tai_khoan') as FormArray;
  }

  createBankAccount(): FormGroup {
    return this.fb.group({
      so_tai_khoan: [''],
      ngan_hang: this.fb.group({
        ma_ngan_hang: [''],
        ten_ngan_hang: ['']
      }),
      loai_tien: ['VND'],
      loai_tai_khoan: ['CURRE'],
      ngay_mo: [''],
      trang_thai: ['ACTIV'],
      nguoi_duoc_uy_quyen: this.fb.array([])
    });
  }

  addOrganizationSubmit() {
    const isSubmit = confirm('Bạn có chắc chắn muốn thêm tổ chức liên quan đến giao dịch này?');

    if (isSubmit) {
      if (this.addFormOrganization.invalid) {
        return;
      }
      const data = this.addFormOrganization.value;

      const newOrganization = new Organization(data);
      const id = new Date(Date.now()).getTime();
      newOrganization.id = id;

      this.activeModal.close(newOrganization);
    }

  }

  // Dynamic table in bank account number
  addRow(): void {
    this.bankAccounts.push(this.createBankAccount());
  }

  deleteRow(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      this.bankAccounts.removeAt(index);
    }
  }

  closeModal() {
    this.activeModal.close();
  }
}
