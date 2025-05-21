import {Component, OnInit, Input} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Person} from '../../models/person';
import {AuthorizedPersonInformation} from "../../models/information-authorized-person";
import {
  AddInformationBankAccountComponent
} from "../add-information-bank-account/add-information-bank-account.component";
import {ViewAuthorizedPersonsComponent} from "../view-authorized-persons/view-authorized-persons.component";
import {STRCategoryService} from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import {STRConstant} from 'src/app/common/str-case.constant';
import {Common} from '../../../service-common/common';
import {Subscription} from "rxjs";
import {PersonService} from "../../services/person.service";
import {ValidateHelper} from "../../../../ValidateHelper";
import {MomentDateFormatter} from "../../../../../../common/momentdate";
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";

@Component({
  selector: 'app-edit-person',
  templateUrl: './edit-person.component.html',
  styleUrls: ['./edit-person.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class EditPersonComponent extends BaseDateRangeComponent implements OnInit {
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

  // Lưu trữ validators gốc để khôi phục
  private originalValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private originalNgheNghiepValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private originalDiaChiThuongTruValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private originalNoiOHienTaiValidators: { [key: string]: ValidatorFn | ValidatorFn[] | null } = {};
  private khachHangHienHuuSubscription!: Subscription;

  private validatorsArray =  {
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
    private personService: PersonService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.listenToKhachHangHienHuuChanges();
    // Cập nhật validators dựa trên giá trị ban đầu (quan trọng)
    this.personService.updateValidators(this.editForm, this.editForm.get('khach_hang_hien_huu')?.value, this.validatorsArray);
  }

  ngOnDestroy(): void {
    if (this.khachHangHienHuuSubscription) {
      this.khachHangHienHuuSubscription.unsubscribe();
    }
  }

  initForm(): void {

    this.editForm = this.fb.group({
      khach_hang_hien_huu: ['1'],
      ho_ten: [this.person?.ho_ten, Validators.required],
      ngay_sinh: [Common.convertDateToNgbDate(this.person?.ngay_sinh), Validators.required],
      do_tuoi: [this.person?.do_tuoi, Validators.required],
      gioi_tinh: [this.person?.gioi_tinh, Validators.required],
      quoc_tich: [this.person?.quoc_tich, Validators.required],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [this.person.nghe_nghiep?.ma_nghe_nghiep, Validators.required],
        mo_ta: [this.person.nghe_nghiep?.mo_ta, Validators.required]
      }),
      chuc_vu: [this.person?.chuc_vu],
      dia_chi_thuong_tru: this.fb.group({
        so_nha: [this.person.dia_chi_thuong_tru?.so_nha, Validators.required],
        quan_huyen: [this.person.dia_chi_thuong_tru?.quan_huyen, Validators.required],
        tinh_thanh: [this.person.dia_chi_thuong_tru?.tinh_thanh, Validators.required],
        quoc_gia: [this.person.dia_chi_thuong_tru?.quoc_gia, Validators.required],
      }),
      noi_o_hien_tai: this.fb.group({
        so_nha: [this.person.noi_o_hien_tai?.so_nha, Validators.required],
        quan_huyen: [this.person.noi_o_hien_tai?.quan_huyen, Validators.required],
        tinh_thanh: [this.person.noi_o_hien_tai?.tinh_thanh, Validators.required],
        quoc_gia: [this.person.noi_o_hien_tai?.quoc_gia, Validators.required],
      }),
      thong_tin_dinh_danh: this.fb.array(this.person?.thong_tin_dinh_danh ? this.person.thong_tin_dinh_danh.map(ide => this.createIdentityPerson(ide)) : [this.newIdentityNumber()]),
      so_dien_thoai: [this.person?.so_dien_thoai, Validators.required],
      trinh_do_van_hoa: [this.person?.trinh_do_van_hoa],
      email: [this.person?.email],
      tai_khoan: this.fb.array(this.person?.tai_khoan ? this.person.tai_khoan.map(acc => this.createBankAccount(acc)) : [this.newBankAccount()])
    });

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.editForm?.disable({emitEvent: false});
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
    this.editForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.personService.setAgeRange(this.editForm, birthDate);
      }
    });

    // if (this.person?.ngay_sinh) {
    //   this.personService.setAgeRange(this.editForm, Common.convertDateToNgbDate(this.person.ngay_sinh));
    // }

    this.storeOriginalValidators();
  }

  storeOriginalValidators(): void {
    // Lưu validators của các trường chính
    this.originalValidators['ho_ten'] = this.editForm.get('ho_ten')?.validator;
    this.originalValidators['ngay_sinh'] = this.editForm.get('ngay_sinh')?.validator;
    this.originalValidators['do_tuoi'] = this.editForm.get('do_tuoi')?.validator;
    this.originalValidators['gioi_tinh'] = this.editForm.get('gioi_tinh')?.validator;
    this.originalValidators['quoc_tich'] = this.editForm.get('quoc_tich')?.validator;
    this.originalValidators['so_dien_thoai'] = this.editForm.get('so_dien_thoai')?.validator;

    // Lưu validators cho FormGroup 'nghe_nghiep'
    const ngheNghiepGroup = this.editForm.get('nghe_nghiep') as FormGroup;
    this.originalNgheNghiepValidators['ma_nghe_nghiep'] = ngheNghiepGroup.get('ma_nghe_nghiep')?.validator;
    this.originalNgheNghiepValidators['mo_ta'] = ngheNghiepGroup.get('mo_ta')?.validator;

    // Lưu validators cho FormGroup 'dia_chi_thuong_tru'
    const diaChiThuongTruGroup = this.editForm.get('dia_chi_thuong_tru') as FormGroup;
    Object.keys(diaChiThuongTruGroup.controls).forEach(key => {
      this.originalDiaChiThuongTruValidators[key] = diaChiThuongTruGroup.get(key)?.validator;
    });

    // Lưu validators cho FormGroup 'noi_o_hien_tai'
    const noiOHienTaiGroup = this.editForm.get('noi_o_hien_tai') as FormGroup;
    Object.keys(noiOHienTaiGroup.controls).forEach(key => {
      this.originalNoiOHienTaiValidators[key] = noiOHienTaiGroup.get(key)?.validator;
    });
  }

  listenToKhachHangHienHuuChanges(): void {
    const control = this.editForm.get('khach_hang_hien_huu');
    if (control) {
      this.khachHangHienHuuSubscription = control.valueChanges.subscribe(value => {
        this.personService.updateValidators(this.editForm, value, this.validatorsArray);
      });
    }
  }

  get bankAccounts(): FormArray {
    return this.editForm.get('tai_khoan') as FormArray;
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

  createBankAccount(account: any): FormGroup {
    return this.fb.group({
      so_tai_khoan: [account.so_tai_khoan, Validators.required],
      ngan_hang: this.fb.group({
        ma_ngan_hang: [account.ngan_hang?.ma_ngan_hang || '', Validators.required],
        ten_ngan_hang: [account.ngan_hang?.ten_ngan_hang || '', Validators.required]
      }),
      loai_tien: [account.loai_tien, Validators.required],
      loai_tai_khoan: [account.loai_tai_khoan, Validators.required],
      ngay_mo: [Common.convertDateToNgbDate(account.ngay_mo), Validators.required],
      trang_thai: [account.trang_thai, Validators.required],
      nguoi_duoc_uy_quyen: this.fb.array(
        account.nguoi_duoc_uy_quyen
          ? account.nguoi_duoc_uy_quyen.map((info: AuthorizedPersonInformation) => this.createAuthorizedPerson(info))
          : []
      )
    });
  }

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.editForm.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  createIdentityPerson(identity: any): FormGroup {
    let group = this.fb.group({
      loai_dinh_danh: [identity.loai_dinh_danh, Validators.required],
      so_dinh_danh: [identity.so_dinh_danh, Validators.required],
      ngay_cap: [Common.convertDateToNgbDate(identity.ngay_cap), Validators.required],
      ngay_het_han: [Common.convertDateToNgbDate(identity.ngay_het_han)],
      co_quan_cap: [identity.co_quan_cap, Validators.required],
      noi_cap: [identity.noi_cap, Validators.required],
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

  createAuthorizedPerson(info: any): FormGroup {
    let group = this.fb.group({
      ho_ten: [info.ho_ten],
      thong_tin_dinh_danh: this.fb.array(
        info.thong_tin_dinh_danh
          ? info.thong_tin_dinh_danh.map((idInfo: {
            loai_dinh_danh: string;
            so_dinh_danh: string;
            ngay_cap: Date;
            ngay_het_han: string;
            noi_cap: string;
            co_quan_cap: string;
          }) => this.fb.group({
            loai_dinh_danh: [idInfo.loai_dinh_danh],
            so_dinh_danh: [idInfo.so_dinh_danh, Validators.required],
            ngay_cap: [idInfo.ngay_cap],
            ngay_het_han: [idInfo.ngay_het_han],
            co_quan_cap: [idInfo.co_quan_cap],
            noi_cap: [idInfo.noi_cap]
          }))
          : []
      )
    });
    this.validateIdentity(group);
    return group;
  }

  deleteRow(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      this.bankAccounts.removeAt(index);
    }
  }

  addRow() {
    this.bankAccounts.push(this.newBankAccount());
  }

  // Dynamic table for identity number for person
  get identityNumbers(): FormArray {
    return this.editForm.get('thong_tin_dinh_danh') as FormArray;
  }

  newIdentityNumber(): FormGroup {
    let group = this.fb.group({
      loai_dinh_danh: ['100', Validators.required],
      so_dinh_danh: ['', Validators.required],
      ngay_cap: ['', Validators.required],
      ngay_het_han: [''],
      co_quan_cap: ['', Validators.required],
      noi_cap: ['', Validators.required],
    });
    this.validateIdentity(group);
    return group;
  }

  addRowIdentityNumber() {
    this.identityNumbers.push(this.newIdentityNumber());
  }

  deleteRowIdentityNumber(index: number) {
    if (confirm('Bạn có chắc chắn muốn thông tin định danh cá nhân này?')) {
      this.identityNumbers.removeAt(index);
    }
  }

  updatePersonSubmit() {
    if (confirm('Bạn có chắc chắn muốn cập nhật thông tin này?')) {

      if (this.editForm.invalid) {
        this.editForm.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      } else {
        const khachHangHienHuu = this.editForm.get('khach_hang_hien_huu')?.value;
        const thongTinDinhDanh = (this.editForm.get('thong_tin_dinh_danh') as FormArray).length > 0 && (this.editForm.get('thong_tin_dinh_danh') as FormArray).valid;
        const taiKhoan = (this.editForm.get('tai_khoan') as FormArray).length > 0 && (this.editForm.get('tai_khoan') as FormArray).valid;

        // Kiểm tra nếu khachHangHienHuu = 1 thì cả thongTinDinhDanh và taiKhoan đều phải có dữ liệu
        if (khachHangHienHuu === '1' && (!thongTinDinhDanh || !taiKhoan)) {
          alert("Bạn phải điền thông tin định danh và tài khoản khi chọn khách hàng hiện hữu đã và đang sử dụng dịch vụ")
          return;
        } else if (khachHangHienHuu === '0' && (!thongTinDinhDanh && !taiKhoan)) {
          alert("Bạn phải điền ít nhất 1 thông tin định danh hoặc tài khoản khi chọn khách hàng hiện hữu đã và đang sử dụng dịch vụ là khác")
          return;
        }

        const data = this.editForm.value;
        const newPerson = new Person(data);
        newPerson.id = this.person.id;

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
          noi_cap: [personInfo.noi_cap],
          co_quan_cap: [personInfo.co_quan_cap],
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
    modalRef.componentInstance.readOnly = this.readOnly;
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.editForm.reset();
    }
  }
}
