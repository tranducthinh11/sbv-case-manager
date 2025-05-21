import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Person } from '../../models/person';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { STRConstant } from 'src/app/common/str-case.constant';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.scss']
})
export class AddPersonComponent implements OnInit {
  addForm!: FormGroup
  ageRanges = STRConstant.ageRanges || [];
  genders = STRConstant.genders || [];

  countries: any[] = [];
  currencys: any[] = [];
  jobs: any[] = [];
  identitys: any[] = [];
  typeAccounts: any[] = [];
  typeStatus: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
  ) { }

  ngOnInit(): void {
    this.addForm = this.fb.group({
      ho_ten: [''],
      ngay_sinh: [''],
      do_tuoi: [''],
      gioi_tinh: [''],
      quoc_tich: ['VN'],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: ['1'],
        mo_ta: ['Công chức/viên chức']
      }),
      chuc_vu: [''],
      dia_chi_thuong_tru: this.fb.group({
        so_nha: [''],
        quan_huyen: [''],
        tinh_thanh: [''],
        quoc_gia: ['VN'],
      }),
      noi_o_hien_tai: this.fb.group({
        so_nha: [''],
        quan_huyen: [''],
        tinh_thanh: [''],
        quoc_gia: ['VN'],
      }),
      thong_tin_dinh_danh: this.fb.array([this.newIdentityNumber()]),
      so_dien_thoai: [''],
      tai_khoan: this.fb.array([this.newBankAccount()])
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

    // Subscribe vào sự thay đổi của ngay_sinh
    this.addForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.calculateAndSetAgeRange(birthDate);
      }
    });

  }

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.addForm.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  get bankAccounts(): FormArray {
    return this.addForm.get('tai_khoan') as FormArray;
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
      trang_thai: ['ACTIV'],
      nguoi_duoc_uy_quyen: this.fb.array([])
    });
  }

  // Dynamic indentity number
  get identityNumbers(): FormArray {
    return this.addForm.get('thong_tin_dinh_danh') as FormArray;
  }

  newIdentityNumber(): FormGroup {
    return this.fb.group({
      loai_dinh_danh: ['100'],
      so_dinh_danh: [''],
      ngay_cap: [''],
      ngay_het_han: [''],
      co_quan_cap: [''],
      noi_cap: [''],
    });
  }

  addRowIdentityNumber() {
    this.identityNumbers.push(this.newIdentityNumber());
  }

  deleteRowIdentityNumber(index: number) {
    if (confirm('Bạn có chắc chắn muốn thông tin định danh cá nhân này?')) {
      this.identityNumbers.removeAt(index);
    }
  }

  addPersonSubmit() {
    if (confirm('Bạn có chắc chắn muốn thêm cá nhân liên quan đến giao dịch này?')) {
      if (this.addForm.valid) {
        const data = this.addForm.value;
        const newPerson = new Person(data);
        newPerson.id = new Date(Date.now()).getTime();

        // Trả dữ liệu về Step3Component
        this.activeModal.close(newPerson);
      } else {
        // Hiển thị thông báo lỗi hoặc highlight các trường không hợp lệ
        console.log('Form is invalid');
        this.addForm.markAllAsTouched();
      }
    }

  }

  // Dynamic table in bank account number
  addRow() {
    this.bankAccounts.push(this.newBankAccount());
  }

  deleteRow(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      this.bankAccounts.removeAt(index);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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

    if (rangeValue) {
      this.addForm.get('do_tuoi')?.setValue(rangeValue);
    } else {
      this.addForm.get('do_tuoi')?.setValue(null);
    }
  }

  closeModal() {
    this.activeModal.close();
  }
}
