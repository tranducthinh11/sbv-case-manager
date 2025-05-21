import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Organization } from '../../models/organization';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import {Common} from "../../../service-common/common";

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrl: './edit-organization.component.scss'
})
export class EditOrganizationComponent {
  @Input() organization!: Organization; // Nhận dữ liệu từ Step3Component
  @Input() readOnly: boolean = false; //Kiểm tra đang view hay edit
  editFormOrganization!: FormGroup

  currencys: any[] = [];
  typeAccounts: any[] = [];
  countries: any[] = [];
  typeStatus: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
  ) { }

  ngOnInit(): void {
    this.editFormOrganization = this.fb.group({
      ten_to_chuc: [this.organization?.ten_to_chuc],
      ten_tieng_nuoc_ngoai: [this.organization?.ten_tieng_nuoc_ngoai],
      ten_viet_tat: [this.organization?.ten_viet_tat],
      loai_hinh_to_chuc: [null],

      dia_chi: this.fb.group({
        so_nha: [this.organization.dia_chi?.so_nha],
        quan_huyen: [this.organization.dia_chi?.quan_huyen],
        tinh_thanh: [this.organization.dia_chi?.tinh_thanh],
        quoc_gia: [this.organization.dia_chi?.quoc_gia]
      }),

      giay_phep_thanh_lap: this.fb.group({
        so_giay_phep: [this.organization.giay_phep_thanh_lap?.so_giay_phep],
        ngay_cap: [this.organization.giay_phep_thanh_lap?.ngay_cap ? Common.convertFormatDate(this.organization.giay_phep_thanh_lap.ngay_cap) : ''],
        noi_cap: [this.organization.giay_phep_thanh_lap?.noi_cap]
      }),

      ma_so_doanh_nghiep: this.fb.group({
        ma_so: [this.organization.ma_so_doanh_nghiep?.ma_so],
        ngay_cap: [this.organization.ma_so_doanh_nghiep?.ngay_cap ? Common.convertFormatDate(this.organization.ma_so_doanh_nghiep.ngay_cap) : ''],
        noi_cap: [this.organization.ma_so_doanh_nghiep?.noi_cap]
      }),

      nganh_nghe_kinh_doanh: [this.organization?.nganh_nghe_kinh_doanh],
      so_dien_thoai: [this.organization?.so_dien_thoai],
      website: [this.organization?.website || ''],
      tai_khoan: this.fb.array(this.organization?.tai_khoan ? this.organization.tai_khoan.map(acc => this.createBankAccount(acc)) : [this.newBankAccount()])
    });

    // Lấy danh sách quốc gia
    this.strCategoryService.getCountries().subscribe(data => {
      this.countries = data;
    });

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.editFormOrganization?.disable({ emitEvent: false });
    }

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
    return this.editFormOrganization.get('tai_khoan') as FormArray;
  }

  createBankAccount(account: any): FormGroup {
    return this.fb.group({
      so_tai_khoan: [account.so_tai_khoan],
      ngan_hang: this.fb.group({
        ma_ngan_hang: [account.ngan_hang?.ma_ngan_hang || ''],
        ten_ngan_hang: [account.ngan_hang?.ten_ngan_hang || '']
      }),
      loai_tien: [account.loai_tien],
      loai_tai_khoan: [account.loai_tai_khoan],
      ngay_mo: [this.formatDate(account.ngay_mo)],
      trang_thai: [account.trang_thai]
    });
  }

  newBankAccount(): FormGroup {
    return this.fb.group({
      so_tai_khoan: [''],
      ngan_hang: this.fb.group({
        ma_ngan_hang: [''],
        ten_ngan_hang: ['']
      }),
      loai_tien: ['VND'],
      loai_tai_khoan: ['CURRE'],
      ngay_mo: [''],
      trang_thai: ['']
    });
  }

  editOrganizationSubmit() {
    const isSubmit = confirm('Bạn có chắc chắn muốn sửa tổ chức liên quan đến giao dịch này?');

    if (isSubmit) {
      if (this.editFormOrganization.invalid) {
        return;
      }
      const data = this.editFormOrganization.value;

      const newOrganization = new Organization(data);
      newOrganization.id = this.organization.id;

      this.activeModal.close(newOrganization);
    }

  }

  // Dynamic table in bank account number
  addRow(): void {
    this.bankAccounts.push(this.newBankAccount());
  }

  deleteRow(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      this.bankAccounts.removeAt(index);
    }
  }

  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  closeModal() {
    this.activeModal.close();
  }
}
