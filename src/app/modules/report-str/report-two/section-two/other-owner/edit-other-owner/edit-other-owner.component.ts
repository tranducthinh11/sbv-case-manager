import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { OtherOwner } from '../../models/other-owner';
import { STRConstant } from 'src/app/common/str-case.constant';
import {Common} from "../../../service-common/common";
import {PersonService} from "../../services/person.service";
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";

@Component({
  selector: 'app-edit-other-owner',
  templateUrl: './edit-other-owner.component.html',
  styleUrls: ['./edit-other-owner.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class EditOtherOwnerComponent extends BaseDateRangeComponent implements OnInit {
  @Input() otherOwner!: OtherOwner; // Nhận dữ liệu từ Step2Component
  @Input() readOnly: boolean = false; //Kiểm tra đang view hay edit
  editOtherOwnerForm!: FormGroup;

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
    this.editOtherOwnerForm = this.fb.group({
      ho_ten: [this.otherOwner.ho_ten, Validators.required],
      ngay_sinh: [Common.convertDateToNgbDate(this.otherOwner?.ngay_sinh), Validators.required],

      do_tuoi: [this.otherOwner.do_tuoi, Validators.required],
      gioi_tinh: [this.otherOwner.gioi_tinh, Validators.required],
      quoc_tich: [this.otherOwner.quoc_tich, Validators.required],
      nghe_nghiep: this.fb.group({
        ma_nghe_nghiep: [this.otherOwner.nghe_nghiep?.ma_nghe_nghiep, Validators.required],
        mo_ta: [this.otherOwner.nghe_nghiep?.mo_ta]
      }),
      chuc_vu: [this.otherOwner.chuc_vu],
      dia_chi_thuong_tru: this.fb.group({
        so_nha: [this.otherOwner.dia_chi_thuong_tru.so_nha, Validators.required],
        quan_huyen: [this.otherOwner.dia_chi_thuong_tru.quan_huyen, Validators.required],
        tinh_thanh: [this.otherOwner.dia_chi_thuong_tru.tinh_thanh, Validators.required],
        quoc_gia: [this.otherOwner.dia_chi_thuong_tru.quoc_gia, Validators.required],
      }),
      noi_o_hien_tai: this.fb.group({
        so_nha: [this.otherOwner.noi_o_hien_tai.so_nha, Validators.required],
        quan_huyen: [this.otherOwner.noi_o_hien_tai.quan_huyen, Validators.required],
        tinh_thanh: [this.otherOwner.noi_o_hien_tai.tinh_thanh, Validators.required],
        quoc_gia: [this.otherOwner.noi_o_hien_tai.quoc_gia, Validators.required],
      }),
      so_dien_thoai: [this.otherOwner.so_dien_thoai, Validators.required],
      thong_tin_dinh_danh: this.fb.array(this.otherOwner?.thong_tin_dinh_danh ? this.otherOwner.thong_tin_dinh_danh.map(ide => this.createIdentityPerson(ide)) : [this.newIdentityNumber()]),
    });

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.editOtherOwnerForm?.disable({ emitEvent: false });
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
    this.strCategoryService.getCategory({type: 2, report_type: 'M1' }).subscribe(data => {
      this.jobs = data;
    })

    // Lấy danh sách loại định danh
    this.strCategoryService.getCategory({type: 3, report_type: 'M1' }).subscribe(data => {
      this.identitys = data;
    })

    // Subscribe vào sự thay đổi của ngay_sinh
    this.editOtherOwnerForm.get('ngay_sinh')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        this.personService.setAgeRange(this.editOtherOwnerForm, birthDate);
      }
    });

    // if (this.otherOwner?.ngay_sinh) {
    //   this.calculateAndSetAgeRange(this.otherOwner.ngay_sinh);
    // }
  }

  updateJobDescription(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobValue = selectElement.value;

    const selectedJob = this.jobs.find(job => job.value === jobValue);
    if (selectedJob) {
      this.editOtherOwnerForm.get('nghe_nghiep.mo_ta')?.setValue(selectedJob.name);
    }
  }

  // Dynamic table for identity number for person
  get identityNumbers(): FormArray {
    return this.editOtherOwnerForm.get('thong_tin_dinh_danh') as FormArray;
  }

  createIdentityPerson(identity: any): FormGroup {
    return this.fb.group({
      loai_dinh_danh: [identity.loai_dinh_danh, Validators.required],
      so_dinh_danh: [identity.so_dinh_danh, Validators.required],
      ngay_cap: [Common.convertDateToNgbDate(identity.ngay_cap), Validators.required],
      ngay_het_han: [Common.convertDateToNgbDate(identity.ngay_het_han)],
      co_quan_cap: [identity.co_quan_cap, Validators.required],
      noi_cap: [identity.noi_cap, Validators.required],
    });
  }

  newIdentityNumber(): FormGroup {
    return this.fb.group({
      loai_dinh_danh: ['100', Validators.required],
      so_dinh_danh: ['', Validators.required],
      ngay_cap: ['', Validators.required],
      ngay_het_han: [''],
      co_quan_cap: ['', Validators.required],
      noi_cap: ['', Validators.required],
    });
  }


  editOtherOwnerSubmit() {
    if (confirm('Bạn có chắc chắn muốn cập nhật thông tin này?')) {
      if (this.editOtherOwnerForm.valid) {
        const updatedData = this.editOtherOwnerForm.value;
        const updatedOtherOwner = { ...this.otherOwner, ...updatedData };

        // Trả dữ liệu về Step2Component
        this.activeModal.close(updatedOtherOwner);

      } else {
        this.editOtherOwnerForm.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      }
    }
  }

  deleteRowIdentityNumber(index: number) {
    if (confirm('Bạn có chắc chắn muốn thông tin định danh cá nhân này?')) {
      this.identityNumbers.removeAt(index);
    }
  }

  addRowIdentityNumber() {
    this.identityNumbers.push(this.newIdentityNumber());
  }

  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.editOtherOwnerForm.reset();
    }
  }
}
