import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal, NgbDateParserFormatter} from "@ng-bootstrap/ng-bootstrap";
import {OrganizationService} from "../../services/organization.service";
import {STRCategoryService} from "../../../service-common/str-category.service";
import {LegalRepresentative} from "../../models/legal-representative";
import {Common} from "../../../service-common/common";
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";

@Component({
  selector: 'app-edit-legal-representative',
  templateUrl: './edit-legal-representative.component.html',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class EditLegalRepresentativeComponent extends BaseDateRangeComponent implements OnInit {
  @Input() legalRepresentative: any;
  editLegalRepresentative!: FormGroup

  countries: any[] = [];
  jobs: any[] = [];
  identitys: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private organizationService: OrganizationService,
    private strCategoryService: STRCategoryService,
  ) {
    super();
  }

  ngOnInit(): void {
    console.log("legalRepresentative: ", this.legalRepresentative);

    this.editLegalRepresentative = this.fb.group({
      ho_ten: [this.legalRepresentative?.ho_ten || '', Validators.required],
      ngay_sinh: [Common.convertDateToNgbDate(this.legalRepresentative?.ngay_sinh), Validators.required],
      quoc_tich: [this.legalRepresentative?.quoc_tich || 'VN', Validators.required],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [this.legalRepresentative?.nghe_nghiep?.ma_nghe_nghiep, Validators.required],
        mo_ta: [this.legalRepresentative?.nghe_nghiep?.mo_ta]
      }),
      chuc_vu: [this.legalRepresentative?.chuc_vu || ''],
      so_dien_thoai: [this.legalRepresentative?.so_dien_thoai || '', Validators.required],
      dia_chi_thuong_tru: this.fb.group({
        so_nha: [this.legalRepresentative?.dia_chi_thuong_tru?.so_nha || '', Validators.required],
        quan_huyen: [this.legalRepresentative?.dia_chi_thuong_tru?.quan_huyen || '', Validators.required],
        tinh_thanh: [this.legalRepresentative?.dia_chi_thuong_tru?.tinh_thanh || '', Validators.required],
        quoc_gia: [this.legalRepresentative?.dia_chi_thuong_tru?.quoc_gia || 'VN', Validators.required]
      }),
      noi_o_hien_tai: this.fb.group({
        so_nha: [this.legalRepresentative?.noi_o_hien_tai?.so_nha || '', Validators.required],
        quan_huyen: [this.legalRepresentative?.noi_o_hien_tai?.quan_huyen || '', Validators.required],
        tinh_thanh: [this.legalRepresentative?.noi_o_hien_tai?.tinh_thanh || '', Validators.required],
        quoc_gia: [this.legalRepresentative?.noi_o_hien_tai?.quoc_gia || 'VN', Validators.required]
      }),
      thong_tin_dinh_danh: this.fb.array(
        this.legalRepresentative?.thong_tin_dinh_danh?.map(item => this.fb.group({
          loai_dinh_danh: [item.loai_dinh_danh, Validators.required],
          so_dinh_danh: [item.so_dinh_danh, Validators.required],
          ngay_cap: [Common.convertDateToNgbDate(item.ngay_cap), Validators.required],
          ngay_het_han: [Common.convertDateToNgbDate(item.ngay_het_han)],
          noi_cap: [item.noi_cap, Validators.required],
          co_quan_cap: [item.co_quan_cap, Validators.required],
        })) || [this.newIdentityNumber()]
      )
    });

    this.loadDropdownData();
  }

  loadDropdownData(): void {
    this.strCategoryService.getCountries().subscribe(data => {
      this.countries = data;
    });

    this.strCategoryService.getCategory({ type: 2, report_type: 'M1' }).subscribe(data => {
      this.jobs = data;
    });

    this.strCategoryService.getCategory({ type: 3, report_type: 'M1' }).subscribe(data => {
      this.identitys = data;
    });
  }

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.editLegalRepresentative.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  // Dynamic table for identity number for person
  get identityNumbers(): FormArray {
    return this.editLegalRepresentative.get('thong_tin_dinh_danh') as FormArray;
  }

  newIdentityNumber(): FormGroup {
    let group = this.fb.group({
      loai_dinh_danh: ['100', Validators.required],
      so_dinh_danh: ['', Validators.required],
      ngay_cap: ['', Validators.required],
      ngay_het_han: '',
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

  editLegalRepresentativeSubmit() {
    if (confirm('Bạn có chắc chắn muốn thêm thông tin về người đại diện này?')) {
      if (this.editLegalRepresentative.valid) {
        const data = this.editLegalRepresentative.value;
        const newLegalRepresentative = new LegalRepresentative(data);
        newLegalRepresentative.id = this.legalRepresentative.id;

        this.activeModal.close(newLegalRepresentative);

      } else {
        this.editLegalRepresentative.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      }
    }

  }

  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.editLegalRepresentative.reset();
    }
  }
}
