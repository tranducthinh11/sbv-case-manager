import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { OtherOwner } from '../../models/other-owner';
import { STRConstant } from 'src/app/common/str-case.constant';
import { Common } from '../../../service-common/common';
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";
import {PersonService} from "../../services/person.service";

@Component({
  selector: 'app-add-other-owner',
  templateUrl: './add-other-owner.component.html',
  styleUrls: ['./add-other-owner.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class AddOtherOwnerComponent extends BaseDateRangeComponent implements OnInit {
  addOtherOwnerForm!: FormGroup
  ageRanges = STRConstant.ageRanges || [];
  genders = STRConstant.genders || [];

  countries: any[] = [];
  currencys: any[] = [];
  jobs: any[] = [];
  identitys: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
    private personService: PersonService
  ) {
    super();
  }

  ngOnInit(): void {
    this.addOtherOwnerForm = this.fb.group({
      ho_ten: ['', Validators.required],
      ngay_sinh: ['', Validators.required],
      do_tuoi: ['', Validators.required],
      gioi_tinh: ['', Validators.required],
      quoc_tich: ['VN', Validators.required],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [null, Validators.required],
        mo_ta: [null]
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
      thong_tin_dinh_danh: this.fb.array([this.newIdentityNumber()]),
      so_dien_thoai: ['', Validators.required],
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
    this.strCategoryService.getCategory({type: 2, report_type: 'M1' }).subscribe(data => {
      this.jobs = data;
    })

    // Lấy danh sách loại định danh
    this.strCategoryService.getCategory({type: 3, report_type: 'M1' }).subscribe(data => {
      this.identitys = data;
    })

    // Subscribe vào sự thay đổi của ngay_sinh
    this.addOtherOwnerForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.personService.setAgeRange(this.addOtherOwnerForm, birthDate);
      }
    });
  }

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.addOtherOwnerForm.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  validateDate(event: any) {
    let inputValue = event.target.value;
    const dateParts = inputValue.split('-');

    if (dateParts.length === 3 && dateParts[0].length > 4) {
      dateParts[0] = dateParts[0].substring(0, 4); // Giới hạn năm tối đa 4 ký tự
      event.target.value = dateParts.join('-'); // Cập nhật lại giá trị input
    }
  }

  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  // Dynamic table for identity number for person
  get identityNumbers(): FormArray {
    return this.addOtherOwnerForm.get('thong_tin_dinh_danh') as FormArray;
  }

  newIdentityNumber(): FormGroup {
    return this.fb.group({
      loai_dinh_danh: ['100', Validators.required],
      so_dinh_danh: ['', Validators.required],
      ngay_cap: ['', Validators.required],
      ngay_het_han: '',
      co_quan_cap: ['', Validators.required],
      noi_cap: ['', Validators.required],
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

  addOtherOwnerSubmit() {
    if (confirm('Bạn có chắc chắn muốn thêm đối tượng báo cáo này?')) {
      if (this.addOtherOwnerForm.valid) {
        const data = this.addOtherOwnerForm.value;
        const newOtherOwner = new OtherOwner(data);
        newOtherOwner.id = new Date(Date.now()).getTime();

        // Trả dữ liệu về Step2Component
        this.activeModal.close(newOtherOwner);

      } else {
        this.addOtherOwnerForm.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      }
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

    if (rangeValue) {
      this.addOtherOwnerForm.get('do_tuoi')?.setValue(rangeValue);
    } else {
      this.addOtherOwnerForm.get('do_tuoi')?.setValue(null);
    }
  }

  closeModal() {
    this.activeModal.close();
  }
}
