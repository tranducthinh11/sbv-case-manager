import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Person } from '../../models/person';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { STRConstant } from 'src/app/common/str-case.constant';
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import { Common } from '../../../service-common/common';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { MomentDateFormatter } from 'src/app/common/momentdate';

@Component({
  selector: 'app-add-or-edit-person',
  templateUrl: './add-or-edit-person.component.html',
  styleUrls: ['./add-or-edit-person.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
   ]
})
export class AddOrEditPersonComponent implements OnInit {
  @Input() person!: Person; // Nhận dữ liệu từ Step3Component
  @Input() readOnly: boolean = false; //Kiểm tra đang view hay edit
  personForm!: FormGroup
  ageRanges = STRConstant.ageRanges || [];
  genders = STRConstant.genders || [];

  countries: any[] = [];
  currencys: any[] = [];
  jobs: any[] = [];
  identitys: any[] = [];
  typeAccounts: any[] = [];
  banks: any[] = [];
  typeStatus: any[] = [];

  nowDate: { year: number, month: number, day: number };
  minDate: { year: number, month: number, day: number };
  maxDate: { year: number, month: number, day: number };

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
    private toarService: ToastrService
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.nowDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.minDate = { year: 1945, month: 1, day: 1 };
    this.maxDate = { year: today.getFullYear() + 100, month: 12, day: 31 };

    this.personForm = this.fb.group({
      id: [this.person?.id],
      ho_ten: [this.person?.ho_ten, Validators.required],
      ngay_sinh: [Common.convertDateToNgbDate(this.person?.ngay_sinh), [ValidateHelper.ngayCapValidator]],
      do_tuoi: [this.person?.do_tuoi],
      gioi_tinh: [this.person?.gioi_tinh],
      quoc_tich: [this.person?.quoc_tich ?? 'VN'],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [this.person?.nghe_nghiep?.ma_nghe_nghiep],
        mo_ta: [this.person?.nghe_nghiep?.mo_ta]
      }),
      chuc_vu: [this.person?.chuc_vu],
      dia_chi_thuong_tru: this.fb.group({
        so_nha: [this.person?.dia_chi_thuong_tru?.so_nha],
        quan_huyen: [this.person?.dia_chi_thuong_tru?.quan_huyen],
        tinh_thanh: [this.person?.dia_chi_thuong_tru?.tinh_thanh],
        quoc_gia: [this.person?.dia_chi_thuong_tru?.quoc_gia ?? 'VN'],
      }),
      noi_o_hien_tai: this.fb.group({
        so_nha: [this.person?.noi_o_hien_tai?.so_nha],
        quan_huyen: [this.person?.noi_o_hien_tai?.quan_huyen],
        tinh_thanh: [this.person?.noi_o_hien_tai?.tinh_thanh],
        quoc_gia: [this.person?.noi_o_hien_tai?.quoc_gia ?? 'VN'],
      }),
      thong_tin_dinh_danh: this.fb.array(this.initIdentityPerson()),
      so_dien_thoai: [this.person?.so_dien_thoai],
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

    // Lấy danh sách công việc
    this.strCategoryService.getCategory({ type: 2, report_type: 'M1' }).subscribe(data => {
      this.jobs = data;
    })

    // Lấy danh sách loại định danh
    this.strCategoryService.getCategory({ type: 3, report_type: 'M1' }).subscribe(data => {
      this.identitys = data;
    })

    // Lấy danh sách loại tài khoản
    this.strCategoryService.getCategory({ type: 6, report_type: 'M1' }).subscribe(data => {
      this.typeAccounts = data;
    })

    // Lấy danh sách trạng thái tài khoản
    this.strCategoryService.getCategory({ type: 4, report_type: 'M1' }).subscribe(data => {
      this.typeStatus = data;
    });


    // Lấy danh sách ngân hàng
    this.strCategoryService.getBanks().subscribe(data => {
      this.banks = data;
    })

    // Subscribe vào sự thay đổi của ngay_sinh
    this.personForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.setAgeRange(birthDate);
      }
    });

    if (this.person?.ngay_sinh) {
      this.setAgeRange(Common.convertDateToNgbDate(this.person.ngay_sinh));
    }

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.personForm?.disable({ emitEvent: false });
    }
  }

  initIdentityPerson(): any {
    if(!this.person?.thong_tin_dinh_danh)
      // return [this.createIdentityPerson()];
      return [];

    return this.person.thong_tin_dinh_danh.map(ide => {
      let group = this.fb.group({
        loai_dinh_danh: [ide.loai_dinh_danh],
        so_dinh_danh: [ide.so_dinh_danh, Validators.required],
        ngay_cap: [Common.convertDateToNgbDate(ide.ngay_cap), [ValidateHelper.ngayCapValidator]],
        ngay_het_han: [Common.convertDateToNgbDate(ide.ngay_het_han)],
        co_quan_cap: [ide.co_quan_cap],
        noi_cap: [ide.noi_cap]
      }, { validators: ValidateHelper.ngayHetHanValidator });
      this.validateIdentity(group);
      return group;
    });
  }

  createIdentityPerson(): FormGroup {
    let group = this.fb.group({
      loai_dinh_danh: ['100'],
      so_dinh_danh: ['', Validators.required],
      ngay_cap: [null, [ValidateHelper.ngayCapValidator]],
      ngay_het_han: [null],
      co_quan_cap: [''],
      noi_cap: [''],
    }, { validators: ValidateHelper.ngayHetHanValidator });
    this.validateIdentity(group);
    return group;
  }

  validateIdentity(group: FormGroup) {
    // Set validator cho so_dinh_danh, phụ thuộc loai_dinh_danh
    group.get('so_dinh_danh')?.setValidators([
      Validators.required,
      ValidateHelper.soDinhDanhValidator(() => group.get('loai_dinh_danh')?.value)
    ]);

    // Update lại validator mỗi khi thay đổi loại định danh
    group.get('loai_dinh_danh')?.valueChanges.subscribe(() => {
      group.get('so_dinh_danh')?.updateValueAndValidity();
    });
  }

  initBankAccount(): any {
    if(!this.person?.tai_khoan)
      // return [this.createBankAccount()];
      return [];

    return this.person.tai_khoan.map(acc => {
      let group = this.fb.group({
        so_tai_khoan: [acc.so_tai_khoan, Validators.required],
        ngan_hang: this.fb.group({
          ma_ngan_hang: [acc.ngan_hang?.ma_ngan_hang],
          ten_ngan_hang: [acc.ngan_hang?.ten_ngan_hang]
        }),
        loai_tien: [acc.loai_tien],
        loai_tai_khoan: [acc.loai_tai_khoan],
        ngay_mo: [Common.convertDateToNgbDate(acc.ngay_mo), [ValidateHelper.ngayCapValidator]],
        trang_thai: [acc.trang_thai]
      });
      this.validateBankAccount(group);
      return group;
    });
  }

  createBankAccount(): FormGroup {
    let group = this.fb.group({
      so_tai_khoan: ['', Validators.required],
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

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.personForm.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  get bankAccounts(): FormArray {
    return this.personForm.get('tai_khoan') as FormArray;
  }

  get identityNumbers(): FormArray {
    return this.personForm.get('thong_tin_dinh_danh') as FormArray;
  }


  addIdentityNumber() {
    // Đánh dấu tất cả controls trong FormArray là "touched" để hiện lỗi nếu có
    this.identityNumbers.markAllAsTouched();
    // Kiểm tra nếu tất cả đều hợp lệ
    if (this.identityNumbers.valid) {
      this.identityNumbers.push(this.createIdentityPerson());
    } else {
      this.toarService.warning("Hãy điền thông tin hợp lệ để tiếp tục thêm mới!", "Cảnh báo");
    }
  }

  deleteIdentityNumber(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa thông tin định danh này?')) {
      this.identityNumbers.removeAt(index);
    }

    // Swal.fire({
    //   title: `Bạn có chắc chắn muốn xóa thông tin định danh này?`,
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Đồng ý',
    //   cancelButtonText: 'Huỷ'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.identityNumbers.removeAt(index);
    //   }
    // });
  }

  addBankAccount() {
    this.bankAccounts.markAllAsTouched();
    // Kiểm tra nếu tất cả đều hợp lệ
    if (this.identityNumbers.valid) {
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

  setAgeRange(birthDate: { year: number; month: number; day: number } | null) {
    if (!birthDate) {
      this.personForm.get('do_tuoi')?.setValue(null);
      return;
    }

    const birthDateObj = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    const today = new Date();

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    let rangeValue: string | null = null;
    if (age < 20) {
      rangeValue = '1';
    } else if (age < 30) {
      rangeValue = '2';
    } else if (age < 40) {
      rangeValue = '3';
    } else if (age < 50) {
      rangeValue = '4';
    } else {
      rangeValue = '5';
    }

    this.personForm.get('do_tuoi')?.setValue(rangeValue);
  }

  closeModal() {
    this.activeModal.close();
  }

  personSubmit() {
    if (this.personForm.valid) {
      const isSubmit = confirm('Bạn có chắc chắn muốn lưu cá nhân liên quan đến giao dịch này?');
      if (isSubmit) {
        const data = this.personForm.value;
        const person = new Person(data);

        if(!person.id)
          person.id = new Date(Date.now()).getTime();
        // Trả dữ liệu về Step3Component
        this.activeModal.close(person);
      }

      // Swal.fire({
      //       title: `Bạn có chắc chắn muốn lưu cá nhân liên quan đến giao dịch này?`,
      //       icon: 'question',
      //       showCancelButton: true,
      //       confirmButtonText: 'Đồng ý',
      //       cancelButtonText: 'Huỷ'
      //     }).then((result) => {
      //       if (result.isConfirmed) {
      //         const data = this.personForm.value;
      //         const person = new Person(data);

      //         if(!person.id)
      //           person.id = new Date(Date.now()).getTime();
      //         // Trả dữ liệu về Step3Component
      //         this.activeModal.close(person);
      //       }
      //     });
    } else {
      // Hiển thị thông báo lỗi và highlight các trường không hợp lệ
      this.personForm.markAllAsTouched();
      this.toarService.warning("Thông tin không hợp lệ!", "Cảnh báo");
    }
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.personForm.reset();
    }
  }
}
