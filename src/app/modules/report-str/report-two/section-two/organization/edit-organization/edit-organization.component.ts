import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Organization } from '../../models/organization';
import { AddOrganizationInformationAccountComponent } from '../add-organization-information-account/add-organization-information-account.component';
import { AuthorizedPersonInformation } from '../../models/information-authorized-person';
import { ViewAuthorizedOrganizationComponent } from '../view-authorized-organization/view-authorized-organization.component';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { Common} from "../../../service-common/common";
import {Subscription} from "rxjs";
import {OrganizationService} from "../../services/organization.service";
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrl: './edit-organization.component.scss',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class EditOrganizationComponent extends BaseDateRangeComponent{
  @Input() organization!: Organization;
  @Input() readOnly: boolean = false; //Kiểm tra đang view hay edit
  editFormOrganization!: FormGroup

  currencys: any[] = [];
  countries: any[] = [];
  typeAccounts: any[] = [];
  typeOrganization: any[] = [];
  typeStatus: any[] = [];

  // Thuộc tính để lưu trữ validators gốc cho addFormOrganization
  private originalOrgValidators: { [key: string]: any } = {};
  private originalOrgLoaiHinhToChucValidators: { [key: string]: any } = {};
  private originalOrgDiaChiValidators: { [key: string]: any } = {};
  // private originalOrgGiayPhepValidators: { [key: string]: any } = {}; // Không có trường required trong ví dụ
  private originalOrgMaSoDoanhNghiepValidators: { [key: string]: any } = {};

  private khachHangHienHuuOrgSub!: Subscription;

  private validatorsArray = {
    main: this.originalOrgValidators,
    loaiHinhToChuc: this.originalOrgLoaiHinhToChucValidators,
    diaChi: this.originalOrgDiaChiValidators,
    maSoDoanhNghiep: this.originalOrgMaSoDoanhNghiepValidators
  }

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private strCategoryService: STRCategoryService,
    private organizationService: OrganizationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormOrganization();
    this.listenToKhachHangHienHuuOrgChanges();
    // Cập nhật validators dựa trên giá trị ban đầu
    this.organizationService.updateOrganizationValidators(this.editFormOrganization, this.editFormOrganization.get('khach_hang_hien_huu')?.value, this.validatorsArray);
  }

  ngOnDestroy(): void {
    if (this.khachHangHienHuuOrgSub) {
      this.khachHangHienHuuOrgSub.unsubscribe();
    }
  }

  initFormOrganization(): void {

    this.editFormOrganization = this.fb.group({
      khach_hang_hien_huu: [this.organization?.khach_hang_hien_huu],
      ten_to_chuc: [this.organization?.ten_to_chuc, Validators.required],
      ten_tieng_nuoc_ngoai: [this.organization?.ten_tieng_nuoc_ngoai || ''],
      ten_viet_tat: [this.organization?.ten_viet_tat || ''],
      loai_hinh_to_chuc: this.fb.group({
        ma_loai_hinh: [this.organization?.loai_hinh_to_chuc?.ma_loai_hinh, Validators.required],
        mo_ta: [this.organization?.loai_hinh_to_chuc?.mo_ta]
      }),

      dia_chi: this.fb.group({
        so_nha: [this.organization.dia_chi?.so_nha, Validators.required],
        quan_huyen: [this.organization.dia_chi?.quan_huyen, Validators.required],
        tinh_thanh: [this.organization.dia_chi?.tinh_thanh, Validators.required],
        quoc_gia: [this.organization.dia_chi?.quoc_gia, Validators.required],
      }),

      giay_phep_thanh_lap: this.fb.group({
        so_giay_phep: [this.organization.giay_phep_thanh_lap?.so_giay_phep || ''],
        ngay_cap: [Common.convertDateToNgbDate(this.organization.giay_phep_thanh_lap.ngay_cap)],
        noi_cap: [this.organization.giay_phep_thanh_lap?.noi_cap || ''],
      }),

      ma_so_doanh_nghiep: this.fb.group({
        ma_so: [this.organization.ma_so_doanh_nghiep?.ma_so, [Validators.required, ValidateHelper.mstValidator]],
        ngay_cap: [Common.convertDateToNgbDate(this.organization.ma_so_doanh_nghiep.ngay_cap)],
        noi_cap: [this.organization.ma_so_doanh_nghiep?.noi_cap || ''],
      }),

      nganh_nghe_kinh_doanh: [this.organization?.nganh_nghe_kinh_doanh || '', Validators.required],
      so_dien_thoai: [this.organization?.so_dien_thoai, Validators.required],
      website: [this.organization?.website || ''],
      tai_khoan: this.fb.array(this.organization.tai_khoan ? this.organization.tai_khoan.map(acc => this.createBankAccount(acc)) : [this.newBankAccount()])
    });

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.editFormOrganization?.disable({ emitEvent: false });
    }

    // Lấy danh sách loại tiền tệ
    this.strCategoryService.getCurrencys().subscribe(data => {
      this.currencys = data;
    });

    // Lấy danh sách quốc gia
    this.strCategoryService.getCountries().subscribe(data => {
      this.countries = data;
    });

    // Lấy danh sách loại tài khoản
    this.strCategoryService.getCategory({ type: 6, report_type: 'M1' }).subscribe(data => {
      this.typeAccounts = data;
    });

    // Lấy danh sách loại hình tổ chức
    this.strCategoryService.getCategory({ type: 5, report_type: 'M1' }).subscribe(data => {
      this.typeOrganization = data;
    });

    // Lấy danh sách trạng thái tài khoản
    this.strCategoryService.getCategory({ type: 4, report_type: 'M1' }).subscribe(data => {
      this.typeStatus = data;
    });

    this.storeOriginalOrganizationValidators();
  }

  storeOriginalOrganizationValidators(): void {
    this.originalOrgValidators['ten_to_chuc'] = this.editFormOrganization.get('ten_to_chuc')?.validator;
    this.originalOrgValidators['so_dien_thoai'] = this.editFormOrganization.get('so_dien_thoai')?.validator;
    this.originalOrgValidators['nganh_nghe_kinh_doanh'] = this.editFormOrganization.get('nganh_nghe_kinh_doanh')?.validator;

    const loaiHinhGroup = this.editFormOrganization.get('loai_hinh_to_chuc') as FormGroup;
    if (loaiHinhGroup) {
      this.originalOrgLoaiHinhToChucValidators['ma_loai_hinh'] = loaiHinhGroup.get('ma_loai_hinh')?.validator;
    }


    const diaChiGroup = this.editFormOrganization.get('dia_chi') as FormGroup;
    if (diaChiGroup) {
      this.originalOrgDiaChiValidators['so_nha'] = diaChiGroup.get('so_nha')?.validator;
      this.originalOrgDiaChiValidators['quan_huyen'] = diaChiGroup.get('quan_huyen')?.validator;
      this.originalOrgDiaChiValidators['tinh_thanh'] = diaChiGroup.get('tinh_thanh')?.validator;
    }


    const msdnGroup = this.editFormOrganization.get('ma_so_doanh_nghiep') as FormGroup;
    if (msdnGroup) {
      this.originalOrgMaSoDoanhNghiepValidators['ma_so'] = msdnGroup.get('ma_so')?.validator;
    }
  }

  listenToKhachHangHienHuuOrgChanges(): void {
    const control = this.editFormOrganization.get('khach_hang_hien_huu');
    if (control) {
      this.khachHangHienHuuOrgSub = control.valueChanges.subscribe(value => {
        this.organizationService.updateOrganizationValidators(this.editFormOrganization, value, this.validatorsArray);
      });
    }
  }

  updateTypeOrganization(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const typeValue = selectElement.value;

    const selectedJob = this.typeOrganization.find(type => type.value === typeValue);
    if (selectedJob) {
      this.editFormOrganization.get('loai_hinh_to_chuc.mo_ta')?.setValue(selectedJob.name);
    }
  }

  get bankAccounts(): FormArray {
    return this.editFormOrganization.get('tai_khoan') as FormArray;
  }

  newBankAccount(): FormGroup {
    return this.fb.group({
      so_tai_khoan: [''],
      ngan_hang: this.fb.group({
        ma_ngan_hang: ['', Validators.required],
        ten_ngan_hang: ['', Validators.required]
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

  createAuthorizedPerson(info: any): FormGroup {
    return this.fb.group({
      ho_ten: [info.ho_ten],
      quan_he_voi_chu_tai_khoan: [info.quan_he_voi_chu_tai_khoan],
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
            so_dinh_danh: [idInfo.so_dinh_danh],
            ngay_cap: [idInfo.ngay_cap],
            ngay_het_han: [idInfo.ngay_het_han],
            noi_cap: [idInfo.noi_cap],
            co_quan_cap: [idInfo.co_quan_cap]
          }))
          : []
      )
    });
  }

  editOrganizationSubmit() {
    if (confirm('Bạn có chắc chắn muốn sửa tổ chức thực hiện giao dịch này?')) {

      if (this.editFormOrganization.invalid) {
        this.editFormOrganization.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      } else {
        const khachHangHienHuu = this.editFormOrganization.get('khach_hang_hien_huu')?.value;
        const taiKhoan = (this.editFormOrganization.get('tai_khoan') as FormArray).length > 0 && (this.editFormOrganization.get('tai_khoan') as FormArray).valid;
        const maSoDoanhNghiep = this.editFormOrganization.get('ma_so_doanh_nghiep.ma_so')?.value.length > 0;

        // Kiểm tra nếu khachHangHienHuu = 1 thì cả thongTinDinhDanh và taiKhoan đều phải có dữ liệu
        if (khachHangHienHuu === '1' && (!taiKhoan || !maSoDoanhNghiep)) {
          alert("Bạn phải nhập thông tin tài khoản và mã số thuế/ mã số doanh nghiệp khi chọn khách hàng hiện hữu đã và đang sử dụng dịch vụ")
          return;
        } else if (khachHangHienHuu === '0' && (!taiKhoan && !maSoDoanhNghiep)) {
          alert("Bạn phải nhập ít nhất 1 thông tin tài khoản hoặc mã số thuế/ mã số doanh nghiệp  khi chọn khách hàng hiện hữu đã và đang sử dụng dịch vụ là khác")
          return;
        }

        const data = this.editFormOrganization.value;

        const newOrganization = new Organization(data);
        newOrganization.id = this.organization.id;
        newOrganization.nguoi_dai_dien = this.organization.nguoi_dai_dien;

        this.activeModal.close(newOrganization);
      }
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
          noi_cap: [personInfo.noi_cap],
          co_quan_cap: [personInfo.co_quan_cap]
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

    // Mở modal và truyền dữ liệu
    const modalRef = this.modalService.open(ViewAuthorizedOrganizationComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.authorizedPersons = authorizedPersonArray.value;
    modalRef.componentInstance.readOnly = this.readOnly;

    // Khi modal trả về danh sách người được ủy quyền đã cập nhật
    modalRef.result.then((updatedAuthorizedPersons: AuthorizedPersonInformation[]) => {
      if (updatedAuthorizedPersons) {
        // Cập nhật lại FormArray
        // const updatedFormArray = new FormArray(
        //   updatedAuthorizedPersons.map(person => this.fb.group(person))
        // );
        // bankAccount.setControl('nguoi_duoc_uy_quyen', updatedFormArray);
      }
    }).catch(err => {
      // Modal bị đóng hoặc dismiss => không cần xử lý gì thêm
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.editFormOrganization.reset();
    }
  }
}
