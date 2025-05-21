import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Organization } from '../../models/organization';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { Common } from '../../../service-common/common';
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { MomentDateFormatter } from 'src/app/common/momentdate';

@Component({
  selector: 'add-or-edit-organization',
  templateUrl: './add-or-edit-organization.component.html',
  styleUrl: './add-or-edit-organization.component.scss',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class AddOrEditOrganizationComponent {
  @Input() organization!: Organization; // Nhận dữ liệu từ Step3Component
  @Input() readOnly: boolean = false; //Kiểm tra đang view hay edit
  organizationForm!: FormGroup

  currencys: any[] = [];
  typeAccounts: any[] = [];
  countries: any[] = [];
  banks: any[] = [];
  typeStatus: any[] = [];

  nowDate: { year: number, month: number, day: number };
  minDate: { year: number, month: number, day: number };
  maxDate: { year: number, month: number, day: number };

  constructor(private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
    private toarService: ToastrService
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.nowDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.minDate = { year: 1945, month: 1, day: 1 };
    this.maxDate = { year: today.getFullYear() + 100, month: 12, day: 31 };

    this.organizationForm = this.fb.group({
      id: [this.organization?.id],
      ten_to_chuc: [this.organization?.ten_to_chuc, Validators.required],
      ten_tieng_nuoc_ngoai: [this.organization?.ten_tieng_nuoc_ngoai],
      ten_viet_tat: [this.organization?.ten_viet_tat],
      loai_hinh_to_chuc: [null],
      dia_chi: this.fb.group({
        so_nha: [this.organization?.dia_chi?.so_nha],
        quan_huyen: [this.organization?.dia_chi?.quan_huyen],
        tinh_thanh: [this.organization?.dia_chi?.tinh_thanh],
        quoc_gia: [this.organization?.dia_chi?.quoc_gia || 'VN']
      }),
      giay_phep_thanh_lap: this.fb.group({
        so_giay_phep: [this.organization?.giay_phep_thanh_lap?.so_giay_phep],
        ngay_cap: [Common.convertDateToNgbDate(this.organization?.giay_phep_thanh_lap.ngay_cap), [ValidateHelper.ngayCapValidator]],
        noi_cap: [this.organization?.giay_phep_thanh_lap?.noi_cap]
      }),
      ma_so_doanh_nghiep: this.fb.group({
        ma_so: [this.organization?.ma_so_doanh_nghiep?.ma_so, [ValidateHelper.mstValidator]],
        ngay_cap: [Common.convertDateToNgbDate(this.organization?.ma_so_doanh_nghiep.ngay_cap), [ValidateHelper.ngayCapValidator]],
        noi_cap: [this.organization?.ma_so_doanh_nghiep?.noi_cap]
      }),
      nganh_nghe_kinh_doanh: [this.organization?.nganh_nghe_kinh_doanh],
      so_dien_thoai: [this.organization?.so_dien_thoai],
      website: [this.organization?.website || ''],
      tai_khoan: this.fb.array(this.initBankAccount())
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

    // Lấy danh sách ngân hàng
    this.strCategoryService.getBanks().subscribe(data => {
      this.banks = data;
    })

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.organizationForm?.disable({ emitEvent: false });
    }
  }

  get bankAccounts(): FormArray {
    return this.organizationForm.get('tai_khoan') as FormArray;
  }

  initBankAccount(): any {
    if(!this.organization?.tai_khoan)
      // return [this.createBankAccount()];
      return [];

    return this.organization.tai_khoan.map(ide => {
      let group = this.fb.group({
        so_tai_khoan: [ide.so_tai_khoan],
        ngan_hang: this.fb.group({
          ma_ngan_hang: [ide.ngan_hang?.ma_ngan_hang || ''],
          ten_ngan_hang: [ide.ngan_hang?.ten_ngan_hang || '']
        }),
        loai_tien: [ide.loai_tien],
        loai_tai_khoan: [ide.loai_tai_khoan],
        ngay_mo: [Common.convertDateToNgbDate(ide.ngay_mo), [ValidateHelper.ngayCapValidator]],
        trang_thai: [ide.trang_thai]
        });
      this.validateBankAccount(group);
      return group;
    });
  }

  createBankAccount(): FormGroup {
    let group = this.fb.group({
      so_tai_khoan: [''],
      ngan_hang: this.fb.group({
        ma_ngan_hang: [''],
        ten_ngan_hang: ['']
      }),
      loai_tien: ['VND'],
      loai_tai_khoan: ['CURRE'],
      ngay_mo: [null, [ValidateHelper.ngayCapValidator]],
      trang_thai: ['ACTIV'],
      nguoi_duoc_uy_quyen: this.fb.array([])
    });
    this.validateBankAccount(group);
    return group;
  }

  validateBankAccount(group: FormGroup) {
    // Đăng ký valueChanges cho từng group ngân hàng mới thêm
    group.get('ngan_hang.ma_ngan_hang')?.valueChanges.subscribe(ma => {
      const bank = this.banks.find(b => b.report_entity_code === ma);
      group.get('ngan_hang.ten_ngan_hang')?.setValue(bank?.report_entity_name || '');
    });
  }

  addBankAccount() {
    this.bankAccounts.markAllAsTouched();
    // Kiểm tra nếu tất cả đều hợp lệ
    if (this.bankAccounts.valid) {
      this.bankAccounts.push(this.createBankAccount());
    } else {
      this.toarService.warning("Hãy điền thông tin hợp lệ để tiếp tục thêm mới!", "Cảnh báo");
    }
  }

  deleteBankAccount(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      this.bankAccounts.removeAt(index);
    }

    // Swal.fire({
    //   title: `Bạn có chắc chắn muốn xóa tài khoản này?`,
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Đồng ý',
    //   cancelButtonText: 'Huỷ'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.bankAccounts.removeAt(index);
    //   }
    // });
  }

  closeModal() {
    this.activeModal.close();
  }

  organizationSubmit() {
    if (this.organizationForm.valid) {
      const isSubmit = confirm('Bạn có chắc chắn muốn lưu tổ chức liên quan đến giao dịch này?');
      if (isSubmit) {
        const data = this.organizationForm.value;
        const organization = new Organization(data);
        if(!organization.id)
          organization.id = new Date(Date.now()).getTime();
        // Trả dữ liệu về Step3Component
        this.activeModal.close(organization);
      }

      // Swal.fire({
      //       title: `Bạn có chắc chắn muốn lưu tổ chức liên quan đến giao dịch này?`,
      //       icon: 'question',
      //       showCancelButton: true,
      //       confirmButtonText: 'Đồng ý',
      //       cancelButtonText: 'Huỷ'
      //     }).then((result) => {
      //       if (result.isConfirmed) {
      //         const data = this.organizationForm.value;

      //         const organization = new Organization(data);
      //         if(!organization.id)
      //           organization.id = new Date(Date.now()).getTime();
      //         // Trả dữ liệu về Step3Component
      //         this.activeModal.close(organization);
      //       }
      //     });
    } else {
      // Hiển thị thông báo lỗi và highlight các trường không hợp lệ
      this.organizationForm.markAllAsTouched();
      this.toarService.warning("Thông tin không hợp lệ!", "Cảnh báo");
    }
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.organizationForm.reset();
    }
  }
}
