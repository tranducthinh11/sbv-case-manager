import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ValidatorFn,
} from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {Person} from '../../models/person';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {
  AddInformationBankAccountComponent
} from '../add-information-bank-account/add-information-bank-account.component';
import {AuthorizedPersonInformation} from '../../models/information-authorized-person';
import {ViewAuthorizedPersonsComponent} from '../view-authorized-persons/view-authorized-persons.component';
import {STRCategoryService} from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import {STRConstant} from 'src/app/common/str-case.constant';
import {Subscription} from "rxjs";
import {PersonService} from "../../services/person.service";
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import {MomentDateFormatter} from "../../../../../../common/momentdate";
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class AddPersonComponent extends BaseDateRangeComponent implements OnInit {
  addForm!: FormGroup
  ageRanges = STRConstant.ageRanges || [];
  genders = STRConstant.genders || [];
  countries: any[] = [];
  currencys: any[] = [];
  jobs: any[] = [];
  identitys: any[] = [];
  typeAccounts: any[] = [];
  typeStatus: any[] = [];

// Lưu trữ validators gốc để khôi phục
  private originalValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private originalNgheNghiepValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private originalDiaChiThuongTruValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private originalNoiOHienTaiValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private khachHangHienHuuSubscription!: Subscription;

  private validatorsArray = {
    main: this.originalValidators,
    ngheNghiep: this.originalNgheNghiepValidators,
    diaChiThuongTru: this.originalDiaChiThuongTruValidators,
    noiOHienTai: this.originalNoiOHienTaiValidators,
  }

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private strCategoryService: STRCategoryService,
    private  personService: PersonService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.listenToKhachHangHienHuuChanges();
    // Cập nhật validators dựa trên giá trị ban đầu (quan trọng)
    this.personService.updateValidators(this.addForm, this.addForm.get('khach_hang_hien_huu')?.value, this.validatorsArray);
  }

  ngOnDestroy(): void {
    if (this.khachHangHienHuuSubscription) {
      this.khachHangHienHuuSubscription.unsubscribe();
    }
  }

  initForm(): void {
    this.addForm = this.fb.group({
      khach_hang_hien_huu: ['1'], // Giá trị mặc định là 'Có'
      ho_ten: ['', Validators.required],
      ngay_sinh: ['', Validators.required],
      do_tuoi: ['', Validators.required],
      gioi_tinh: ['', Validators.required],
      quoc_tich: ['VN', Validators.required],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [null, Validators.required],
        mo_ta: [null, Validators.required]
      }),
      chuc_vu: [''],
      dia_chi_thuong_tru: this.fb.group({
        so_nha: ['', Validators.required],
        quan_huyen: ['', Validators.required],
        tinh_thanh: ['', Validators.required],
        quoc_gia: ['VN', Validators.required]
      }),
      noi_o_hien_tai: this.fb.group({
        so_nha: ['', Validators.required],
        quan_huyen: ['', Validators.required],
        tinh_thanh: ['', Validators.required],
        quoc_gia: ['VN', Validators.required]
      }),
      so_dien_thoai: ['', Validators.required],
      trinh_do_van_hoa: [''],
      email: [''],
      thong_tin_dinh_danh: this.fb.array([]),
      tai_khoan: this.fb.array([])
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
    this.strCategoryService.getCategory({type: 2, report_type: 'M1'}).subscribe(data => {
      this.jobs = data;
    })

    // Lấy danh sách loại định danh
    this.strCategoryService.getCategory({type: 3, report_type: 'M1'}).subscribe(data => {
      this.identitys = data;
    })

    // Lấy danh sách loại tài khoản
    this.strCategoryService.getCategory({type: 6, report_type: 'M1'}).subscribe(data => {
      this.typeAccounts = data;
    });

    // Lấy danh sách trạng thái tài khoản
    this.strCategoryService.getCategory({ type: 4, report_type: 'M1' }).subscribe(data => {
      this.typeStatus = data;
    });

    // Subscribe vào sự thay đổi của ngay_sinh
    this.addForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.personService.setAgeRange(this.addForm, birthDate);
      }
    });

    this.storeOriginalValidators();
  }

  listenToKhachHangHienHuuChanges(): void {
    const control = this.addForm.get('khach_hang_hien_huu');
    if (control) {
      this.khachHangHienHuuSubscription = control.valueChanges.subscribe(value => {
        this.personService.updateValidators(this.addForm, value, this.validatorsArray);
      });
    }
  }

  storeOriginalValidators(): void {
    // Lưu validators của các trường chính
    this.originalValidators['ho_ten'] = this.addForm.get('ho_ten')?.validator;
    this.originalValidators['ngay_sinh'] = this.addForm.get('ngay_sinh')?.validator;
    this.originalValidators['do_tuoi'] = this.addForm.get('do_tuoi')?.validator;
    this.originalValidators['gioi_tinh'] = this.addForm.get('gioi_tinh')?.validator;
    this.originalValidators['quoc_tich'] = this.addForm.get('quoc_tich')?.validator;
    this.originalValidators['so_dien_thoai'] = this.addForm.get('so_dien_thoai')?.validator;

    // Lưu validators cho FormGroup 'nghe_nghiep'
    const ngheNghiepGroup = this.addForm.get('nghe_nghiep') as FormGroup;
    this.originalNgheNghiepValidators['ma_nghe_nghiep'] = ngheNghiepGroup.get('ma_nghe_nghiep')?.validator;
    this.originalNgheNghiepValidators['mo_ta'] = ngheNghiepGroup.get('mo_ta')?.validator;

    // Lưu validators cho FormGroup 'dia_chi_thuong_tru'
    const diaChiThuongTruGroup = this.addForm.get('dia_chi_thuong_tru') as FormGroup;
    Object.keys(diaChiThuongTruGroup.controls).forEach(key => {
      this.originalDiaChiThuongTruValidators[key] = diaChiThuongTruGroup.get(key)?.validator;
    });

    // Lưu validators cho FormGroup 'noi_o_hien_tai'
    const noiOHienTaiGroup = this.addForm.get('noi_o_hien_tai') as FormGroup;
    Object.keys(noiOHienTaiGroup.controls).forEach(key => {
      this.originalNoiOHienTaiValidators[key] = noiOHienTaiGroup.get(key)?.validator;
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

  // Dynamic table in bank account number
  get bankAccounts(): FormArray {
    return this.addForm.get('tai_khoan') as FormArray;
  }

  newBankAccount(): FormGroup {
    return this.fb.group({
      so_tai_khoan: ['', Validators.required],
      ngan_hang: this.fb.group({
        ma_ngan_hang: ['', Validators.required],
        ten_ngan_hang: ['', Validators.required]
      }),
      loai_tien: ['VND', Validators.required],
      loai_tai_khoan: ['CURRE', Validators.required],
      ngay_mo: ['', Validators.required],
      trang_thai: ['ACTIV', Validators.required],
      nguoi_duoc_uy_quyen: this.fb.array([])
    });
  }

  addRow() {
    this.bankAccounts.push(this.newBankAccount());
  }

  deleteRow(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      this.bankAccounts.removeAt(index);
    }
  }

  // Dynamic table for identity number for person
  get identityNumbers(): FormArray {
    return this.addForm.get('thong_tin_dinh_danh') as FormArray;
  }

  newIdentityNumber(): FormGroup {
    let group = this.fb.group({
      loai_dinh_danh: ['100', Validators.required],
      so_dinh_danh: ['', Validators.required],
      ngay_cap: ['', Validators.required],
      ngay_het_han: [null],
      co_quan_cap: ['', Validators.required],
      noi_cap: ['', Validators.required],
    });
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

  addRowIdentityNumber() {
    this.identityNumbers.push(this.newIdentityNumber());
  }

  deleteRowIdentityNumber(index: number) {
    if (confirm('Bạn có chắc chắn muốn thông tin định danh cá nhân này?')) {
      this.identityNumbers.removeAt(index);
    }
  }

  addPersonSubmit() {
    if (confirm('Bạn có chắc chắn muốn thêm đối tượng báo cáo này?')) {
      if (this.addForm.invalid) {
        this.addForm.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      } else {
        const khachHangHienHuu = this.addForm.get('khach_hang_hien_huu')?.value;
        const thongTinDinhDanh = (this.addForm.get('thong_tin_dinh_danh') as FormArray).length > 0 && (this.addForm.get('thong_tin_dinh_danh') as FormArray).valid;
        const taiKhoan = (this.addForm.get('tai_khoan') as FormArray).length > 0 && (this.addForm.get('tai_khoan') as FormArray).valid;

        // Kiểm tra nếu khachHangHienHuu = 1 thì cả thongTinDinhDanh và taiKhoan đều phải có dữ liệu
        if (khachHangHienHuu === '1' && (!thongTinDinhDanh || !taiKhoan)) {
          alert("Bạn phải điền thông tin định danh và tài khoản khi chọn khách hàng hiện hữu đã và đang sử dụng dịch vụ")
          return;
        } else if (khachHangHienHuu === '0' && (!thongTinDinhDanh && !taiKhoan)) {
          alert("Bạn phải điền ít nhất 1 thông tin định danh hoặc tài khoản khi chọn khách hàng hiện hữu đã và đang sử dụng dịch vụ là khác")
          return;
        }

        const data = this.addForm.value;
        const newPerson = new Person(data);
        newPerson.id = new Date(Date.now()).getTime();

        // Trả dữ liệu về Step2Component
        this.activeModal.close(newPerson);

      }
    }
  }

  createInformationAccount(index: number) {

    const modalRef = this.modalService.open(AddInformationBankAccountComponent, {size: 'xl', backdrop: 'static'});
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
          co_quan_cap: [personInfo.co_quan_cap],
          noi_cap: [personInfo.noi_cap]
        }));
      });

      // Add the complete structure to nguoi_duoc_uy_quyen
      authorizedPersonArray.push(authorizedPersonFormGroup);
    }).catch((reason) => {
      console.log('Modal bị đóng với lý do:', reason);
    });
  }

  viewInformationAccount(index: number) {
    const bankAccount = this.bankAccounts.at(index) as FormGroup;
    const authorizedPersonArray = bankAccount.get('nguoi_duoc_uy_quyen') as FormArray;

    if (!authorizedPersonArray || authorizedPersonArray.length === 0) {
      alert("Không có người được ủy quyền nào cho tài khoản này.");
      return;
    }

    // Hiển thị thông tin trong console (hoặc gửi đến modal)
    console.log("Danh sách người được ủy quyền:", authorizedPersonArray.value);

    // Mở modal và truyền dữ liệu
    const modalRef = this.modalService.open(ViewAuthorizedPersonsComponent, {size: 'xl', backdrop: 'static'});
    modalRef.componentInstance.authorizedPersons = authorizedPersonArray.value;
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addForm.reset();
    }
  }
}
