import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { AuthorizedPersonInformation } from '../../models/information-authorized-person';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { ValidateHelper } from 'src/app/modules/report-str/ValidateHelper';
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";


@Component({
  selector: 'app-add-information-bank-account',
  templateUrl: './add-information-bank-account.component.html',
  styleUrl: './add-information-bank-account.component.scss',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class AddInformationBankAccountComponent extends BaseDateRangeComponent implements OnInit {
  @Input() initialData: number | undefined;
  addPersonBankAccountForm!: FormGroup;

  identitys: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
  ) {
    super();
  }

  ngOnInit(): void {
    console.log("Initial data:", this.initialData);

    this.addPersonBankAccountForm = this.fb.group({
      ho_ten: ['', Validators.required],
      quan_he_voi_chu_tai_khoan: [''],
      thong_tin_dinh_danh: this.fb.array([this.createPersonallyInformation()])
    });

    // Lấy danh sách loại định danh
    this.strCategoryService.getCategory({type: 3, report_type: 'M1' }).subscribe(data => {
      this.identitys = data;
    })
  }

  get personallyInformations(): FormArray {
    return this.addPersonBankAccountForm.get('thong_tin_dinh_danh') as FormArray;
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

  addRow(): void {
    this.personallyInformations.push(this.createPersonallyInformation());
  }

  deleteRow(index: number): void {
    this.personallyInformations.removeAt(index);
  }

  addOrganizationSubmit(): void {
    if (this.addPersonBankAccountForm.valid) {
      const newInformationAuthozied = new AuthorizedPersonInformation(this.addPersonBankAccountForm.value);

      this.activeModal.close(newInformationAuthozied);
    } else {
      this.addPersonBankAccountForm.markAllAsTouched();
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addPersonBankAccountForm.reset();
    }
  }
}
