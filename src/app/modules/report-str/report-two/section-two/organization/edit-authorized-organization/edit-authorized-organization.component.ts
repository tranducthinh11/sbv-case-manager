import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal, NgbDateParserFormatter} from "@ng-bootstrap/ng-bootstrap";
import {STRCategoryService} from "../../../service-common/str-category.service";
import {AuthorizedPersonInformation} from "../../models/information-authorized-person";
import {Common} from "../../../service-common/common";
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";

@Component({
  selector: 'app-edit-authorized-person',
  templateUrl: './edit-authorized-organization.component.html',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class EditAuthorizedOrganizationComponent extends BaseDateRangeComponent implements OnInit {
  @Input() authorizedPerson: any | undefined;
  editAuthorizedPerson!: FormGroup;

  identitys: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
  ) {
    super();
  }

  ngOnInit(): void {
    console.log("Initial data:", this.authorizedPerson);

    this.editAuthorizedPerson = this.fb.group({
      ho_ten: [this.authorizedPerson.ho_ten, Validators.required],
      quan_he_voi_chu_tai_khoan: [this.authorizedPerson.quan_he_voi_chu_tai_khoan],
      thong_tin_dinh_danh: this.fb.array(this.authorizedPerson?.thong_tin_dinh_danh ? this.authorizedPerson.thong_tin_dinh_danh.map(ide => this.createIdentityPerson(ide)) : [this.createPersonallyInformation()]),
    });

    // Lấy danh sách loại định danh
    this.strCategoryService.getCategory({type: 3, report_type: 'M1' }).subscribe(data => {
      this.identitys = data;
    })
  }

  get personallyInformations(): FormArray {
    return this.editAuthorizedPerson.get('thong_tin_dinh_danh') as FormArray;
  }

  createIdentityPerson(identity: any): FormGroup {
    let group = this.fb.group({
      loai_dinh_danh: [identity.loai_dinh_danh, Validators.required],
      so_dinh_danh: [identity.so_dinh_danh, Validators.required],
      ngay_cap: [Common.convertDateToNgbDate(identity.ngay_cap)],
      ngay_het_han: [Common.convertDateToNgbDate(identity.ngay_het_han)],
      co_quan_cap: [identity.co_quan_cap],
      noi_cap: [identity.noi_cap]
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

  createPersonallyInformation(): FormGroup {
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


  addRow(): void {
    this.personallyInformations.push(this.createPersonallyInformation());
  }

  deleteRow(index: number): void {
    this.personallyInformations.removeAt(index);
  }

  editAuthorizedPersonSubmit(): void {

    if (this.editAuthorizedPerson.invalid) {
      this.editAuthorizedPerson.markAllAsTouched(); // Đánh dấu tất cả field để hiển thị lỗi
      return;
    }

    console.log("Submit thành công", this.editAuthorizedPerson.value);

    if (this.editAuthorizedPerson.valid) {
      console.log("Submitted data:", this.editAuthorizedPerson.value);
      const newInformationAuthozied = new AuthorizedPersonInformation(this.editAuthorizedPerson.value);

      this.activeModal.close(newInformationAuthozied);
    } else {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.editAuthorizedPerson.reset();
    }
  }
}
