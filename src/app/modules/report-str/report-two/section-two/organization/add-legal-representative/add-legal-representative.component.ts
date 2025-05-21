import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import {NgbActiveModal, NgbDateParserFormatter, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { LegalRepresentative } from "../../models/legal-representative";
import { OrganizationService } from "../../services/organization.service";
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";

@Component({
  selector: 'app-add-legal-representative',
  templateUrl: './add-legal-representative.component.html',
  styleUrl: './add-legal-representative.component.scss',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class AddLegalRepresentativeComponent extends BaseDateRangeComponent implements OnInit {
  @Input() organizationId: Number;
  addLegalRepresentativeForm!: FormGroup

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
    this.addLegalRepresentativeForm = this.fb.group({
      ho_ten: ['', Validators.required],
      ngay_sinh: ['', Validators.required],
      quoc_tich: ['VN', Validators.required],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [null, Validators.required],
        mo_ta: [null]
      }),
      chuc_vu: [''],
      so_dien_thoai: ['', Validators.required],
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
      thong_tin_dinh_danh: this.fb.array([this.newIdentityNumber()]),
    });

    // Lấy danh sách quốc gia
    this.strCategoryService.getCountries().subscribe(data => {
      this.countries = data;
    });

    // Lấy danh sách công việc
    this.strCategoryService.getCategory({type: 2, report_type: 'M1' }).subscribe(data => {
      this.jobs = data;
    })

    // Lấy danh sách loại định danh
    this.strCategoryService.getCategory({type: 3, report_type: 'M1' }).subscribe(data => {
      this.identitys = data;
    })
  }

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.addLegalRepresentativeForm.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  // Dynamic table for identity number for person
  get identityNumbers(): FormArray {
    return this.addLegalRepresentativeForm.get('thong_tin_dinh_danh') as FormArray;
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

  addLegalRepresentativeSubmit() {
    if (confirm('Bạn có chắc chắn muốn thêm thông tin về người đại diện này?')) {
      if (this.addLegalRepresentativeForm.valid) {
        const data = this.addLegalRepresentativeForm.value;
        const newLegalRepresentative = new LegalRepresentative(data);
        const id = new Date(Date.now()).getTime();
        newLegalRepresentative.id = id;

        if (!this.organizationService.addLegalRepresentative(this.organizationId, newLegalRepresentative)) {
        } else {
          this.addLegalRepresentativeForm.reset();
        }
        this.activeModal.close();

      } else {
        this.addLegalRepresentativeForm.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      }
    }

  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addLegalRepresentativeForm.reset();
    }
  }
}
