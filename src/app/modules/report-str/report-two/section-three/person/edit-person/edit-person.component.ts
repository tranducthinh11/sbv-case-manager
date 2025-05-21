import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Person } from '../../models/person';
import { Input } from '@angular/core';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { STRConstant } from 'src/app/common/str-case.constant';
import { Common} from "../../../service-common/common";

@Component({
  selector: 'app-edit-person',
  templateUrl: './edit-person.component.html',
  styleUrl: './edit-person.component.scss',
})
export class EditPersonComponent implements OnInit {
  @Input() person!: Person; // Nhận dữ liệu từ Step2Component
  @Input() readOnly: boolean = false; //Kiểm tra đang view hay edit
  editForm!: FormGroup;
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
    private modalService: NgbModal,
    private strCategoryService: STRCategoryService,
  ) { }

  ngOnInit(): void {
    this.editForm = this.fb.group({
      ho_ten: [this.person?.ho_ten],
      // ngay_sinh: [this.person?.ngay_sinh ? Common.formatDate(this.person?.ngay_sinh) : ''],
      do_tuoi: [this.person?.do_tuoi],
      gioi_tinh: [this.person?.gioi_tinh],
      quoc_tich: [this.person?.quoc_tich],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [this.person.nghe_nghiep?.ma_nghe_nghiep],
        mo_ta: [this.person.nghe_nghiep?.mo_ta]
      }),
      chuc_vu: [this.person?.chuc_vu],
      dia_chi_thuong_tru: this.fb.group({
        so_nha: [this.person.dia_chi_thuong_tru?.so_nha],
        quan_huyen: [this.person.dia_chi_thuong_tru?.quan_huyen],
        tinh_thanh: [this.person.dia_chi_thuong_tru?.tinh_thanh],
        quoc_gia: [this.person.dia_chi_thuong_tru?.quoc_gia]
      }),
      noi_o_hien_tai: this.fb.group({
        so_nha: [this.person.noi_o_hien_tai?.so_nha],
        quan_huyen: [this.person.noi_o_hien_tai?.quan_huyen],
        tinh_thanh: [this.person.noi_o_hien_tai?.tinh_thanh],
        quoc_gia: [this.person.noi_o_hien_tai?.quoc_gia]
      }),
      thong_tin_dinh_danh: this.fb.array(this.person?.thong_tin_dinh_danh ? this.person.thong_tin_dinh_danh.map(ide => this.createIdentityPerson(ide)) : [this.newIdentityNumber()]),
      so_dien_thoai: [this.person?.so_dien_thoai],
      tai_khoan: this.fb.array(this.person?.tai_khoan ? this.person.tai_khoan.map(acc => this.createBankAccount(acc)) : [this.newBankAccount()])
    });

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.editForm?.disable({ emitEvent: false });
    }

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
    });

    // Lấy danh sách trạng thái tài khoản
    this.strCategoryService.getCategory({ type: 4, report_type: 'M1' }).subscribe(data => {
      this.typeStatus = data;
    });

    // Cập nhật độ tuổi khi thay đổi ngày sinh
    this.editForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.calculateAndSetAgeRange(birthDate);
      }
    });

    if (this.person?.ngay_sinh) {
      // this.calculateAndSetAgeRange(this.person.ngay_sinh);
    }
  }

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.editForm.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  get bankAccounts(): FormArray {
    return this.editForm.get('tai_khoan') as FormArray;
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

  // Dynamic table for identity number for person
  get identityNumbers(): FormArray {
    return this.editForm.get('thong_tin_dinh_danh') as FormArray;
  }

  newIdentityNumber(): FormGroup {
    return this.fb.group({
      loai_dinh_danh: ['100'],
      so_dinh_danh: [''],
      ngay_cap: [''],
      ngay_het_han: [''],
      co_quan_cap: ['1'],
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

  createIdentityPerson(identity: any): FormGroup {
    return this.fb.group({
      loai_dinh_danh: [identity.loai_dinh_danh],
      so_dinh_danh: [identity.so_dinh_danh],
      ngay_cap: [this.formatDate(identity.ngay_cap)],
      ngay_het_han: [this.formatDate(identity.ngay_het_han)],
      co_quan_cap: [identity.co_quan_cap],
      noi_cap: [identity.noi_cap]
    });
  }

  // Dynamic table for bank account number
  deleteRow(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      this.bankAccounts.removeAt(index);
    }
  }

  addRow() {
    this.bankAccounts.push(this.newBankAccount());
  }

  editPersonSubmit() {
    if (confirm('Bạn có chắc chắn muốn cập nhật thông tin này?')) {
      if (this.editForm.invalid) {
        return;
      }

      const updatedData = this.editForm.value;
      const updatedPerson = new Person(updatedData);
      updatedPerson.id = this.person.id;

      // Trả dữ liệu về Step2Component
      this.activeModal.close(updatedPerson);
    }
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

    this.editForm.get('do_tuoi')?.setValue(rangeValue);
  }

  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  closeModal() {
    this.activeModal.close();
  }
}
