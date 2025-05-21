import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {STRCategoryService} from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import {Person} from '../../models/person';
import {Common} from "../../../service-common/common";
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";

@Component({
  selector: 'app-edit-person',
  templateUrl: './edit-person.component.html',
  styleUrls: ['./edit-person.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class EditPersonComponent extends BaseDateRangeComponent implements OnInit {
  @Input() personList: any[] = [];
  @Input() personToEdit: Person | null = null;
  @Input() readOnly: boolean = false;

  editPersonForm!: FormGroup;
  currencys: any[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();

    // Lấy danh sách loại tiền tệ
    this.strCategoryService.getCurrencys().subscribe(data => {
      this.currencys = data;
    });

    if (this.personToEdit) {
      this.patchFormData(this.personToEdit);
    }

    // Lắng nghe sự thay đổi trong FormArray dong_tien_vao để tính tổng
    this.bankAccountIns.valueChanges.subscribe(() => {
      this.updateTongSoTienVao();
      this.updateTongSoGiaoDichVao();
    });

    // Lắng nghe sự thay đổi trong FormArray dong_tien_ra để tính tổng
    this.bankAccountOuts.valueChanges.subscribe(() => {
      this.updateTongSoTienRa();
      this.updateTongSoGiaoDichRa();
    });
  }

  initForm(): void {
    this.editPersonForm = this.fb.group({
      ten_doi_tuong: [{value: '', disabled: true}, Validators.required],
      so_dinh_danh: [{value: '', disabled: true}],
      tong_so_tien_vao: [{value: '', disabled: true}],
      tong_so_giao_dich_vao: [{value: '', disabled: true}],
      tong_so_tien_ra: [{value: '', disabled: true}],
      tong_so_giao_dich_ra: [{value: '', disabled: true}],
      dong_tien_vao: this.fb.array([]),
      dong_tien_ra: this.fb.array([]),
      mo_ta_dau_hieu_dong_tien: ["", Validators.required],
    });

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.editPersonForm?.disable({emitEvent: false});
    }
  }

  patchFormData(person: Person): void {
    this.editPersonForm.patchValue({
      ten_doi_tuong: person.ten_doi_tuong || '',
      so_dinh_danh: person.so_dinh_danh || '',
      tong_so_tien_vao: person.tong_so_tien_vao || '',
      tong_so_giao_dich_vao: person.tong_so_giao_dich_vao || '',
      tong_so_tien_ra: person.tong_so_tien_ra || '',
      tong_so_giao_dich_ra: person.tong_so_giao_dich_ra || '',
      mo_ta_dau_hieu_dong_tien: person.mo_ta_dau_hieu_dong_tien || '',
    });

    const dongTienVaoArray = this.bankAccountIns;
    dongTienVaoArray.clear();
    if (person.dong_tien_vao && person.dong_tien_vao.length > 0) {
      person.dong_tien_vao.forEach((item: any) => {
        dongTienVaoArray.push(this.fb.group({
          ho_ten_nguon: [item.ho_ten_nguon || ''],
          so_dinh_danh_nguon: [item.so_dinh_danh_nguon || ''],
          so_tai_khoan_nguon: [item.so_tai_khoan_nguon || ''],
          ten_ngan_hang_nguon: [item.ten_ngan_hang_nguon || ''],
          ma_ngan_hang_nguon: [item.ma_ngan_hang_nguon || ''],
          tong_so_tien: [item.tong_so_tien || ''],
          tong_so_tien_quy_doi: [item.tong_so_tien_quy_doi || ''],
          tong_so_giao_dich: [item.tong_so_giao_dich || ''],
          giao_dich_tu_ngay: [Common.convertDateToNgbDate(item.giao_dich_tu_ngay)],
          giao_dich_den_ngay: [Common.convertDateToNgbDate(item.giao_dich_den_ngay)],
          loai_tien: [item.loai_tien || 'VND'],
          noi_dung: [item.noi_dung || '']
        }));
      });
    } else {
      dongTienVaoArray.push(this.createBankIn());
    }

    const dongTienRaArray = this.bankAccountOuts;
    dongTienRaArray.clear();
    if (person.dong_tien_ra && person.dong_tien_ra.length > 0) {
      person.dong_tien_ra.forEach((item: any) => {
        dongTienRaArray.push(this.fb.group({
          ho_ten_dich: [item.ho_ten_dich || ''],
          so_dinh_danh_dich: [item.so_dinh_danh_dich || ''],
          so_tai_khoan_dich: [item.so_tai_khoan_dich || ''],
          ten_ngan_hang_dich: [item.ten_ngan_hang_dich || ''],
          ma_ngan_hang_dich: [item.ma_ngan_hang_dich || ''],
          tong_so_tien: [item.tong_so_tien || ''],
          tong_so_tien_quy_doi: [item.tong_so_tien_quy_doi || ''],
          tong_so_giao_dich: [item.tong_so_giao_dich || ''],
          giao_dich_tu_ngay: [Common.convertDateToNgbDate(item.giao_dich_tu_ngay)],
          giao_dich_den_ngay: [Common.convertDateToNgbDate(item.giao_dich_den_ngay)],
          loai_tien: [item.loai_tien || 'VND'],
          noi_dung: [item.noi_dung || '']
        }));
      });
    } else {
      dongTienRaArray.push(this.createBankOut());
    }

    //Disable form nếu là Xem chi tiết
    if (this.readOnly == true) {
      this.editPersonForm?.disable({emitEvent: false});
    }
  }

  onPersonSelect(event: Event): void {
    const selectedPersonId = (event.target as HTMLSelectElement).value;

    if (selectedPersonId) {
      const selectedPerson = this.personList.find(person => person.id === selectedPersonId);

      if (selectedPerson) {
        const tenDoiTuong = selectedPerson.ho_ten;
        const soDinhDanh = selectedPerson.thong_tin_dinh_danh && selectedPerson.thong_tin_dinh_danh.length > 0
          ? selectedPerson.thong_tin_dinh_danh[0].so_dinh_danh
          : '';

        this.editPersonForm.patchValue({
          ten_doi_tuong: tenDoiTuong,
          so_dinh_danh: soDinhDanh
        });
      }
    } else {
      this.editPersonForm.patchValue({
        ten_doi_tuong: '',
        so_dinh_danh: ''
      });
    }
  }

  get bankAccountIns(): FormArray {
    return this.editPersonForm.get('dong_tien_vao') as FormArray;
  }

  createBankIn(): FormGroup {
    return this.fb.group({
      ho_ten_nguon: ['', Validators.required],
      so_dinh_danh_nguon: ['', Validators.required],
      so_tai_khoan_nguon: ['', Validators.required],
      ten_ngan_hang_nguon: ['', Validators.required],
      ma_ngan_hang_nguon: ['', Validators.required],
      tong_so_tien: ['', Validators.required],
      tong_so_tien_quy_doi: ['', Validators.required],
      tong_so_giao_dich: ['', Validators.required],
      giao_dich_tu_ngay: ['', Validators.required],
      giao_dich_den_ngay: ['', Validators.required],
      loai_tien: ['VND', Validators.required],
      noi_dung: ['', Validators.required]
    });
  }

  addRowIn(): void {
    this.bankAccountIns.push(this.createBankIn());
  }

  deleteBankIn(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa dòng tiền vào này?')) {
      this.bankAccountIns.removeAt(index);
    }
  }

  get bankAccountOuts(): FormArray {
    return this.editPersonForm.get('dong_tien_ra') as FormArray;
  }

  createBankOut(): FormGroup {
    return this.fb.group({
      ho_ten_dich: ['', Validators.required],
      so_dinh_danh_dich: ['', Validators.required],
      so_tai_khoan_dich: ['', Validators.required],
      ten_ngan_hang_dich: ['', Validators.required],
      ma_ngan_hang_dich: ['', Validators.required],
      tong_so_tien: ['', Validators.required],
      tong_so_tien_quy_doi: ['', Validators.required],
      tong_so_giao_dich: ['', Validators.required],
      giao_dich_tu_ngay: ['', Validators.required],
      giao_dich_den_ngay: ['', Validators.required],
      loai_tien: ['VND', Validators.required],
      noi_dung: ['', Validators.required]
    });
  }

  addRowOut(): void {
    this.bankAccountOuts.push(this.createBankOut());
  }

  deleteBankOut(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa dòng tiền ra này?')) {
      this.bankAccountOuts.removeAt(index);
    }
  }

  updateTongSoTienVao(): void {
    const dongTienVao = this.bankAccountIns.value;
    const total = dongTienVao.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_tien_quy_doi) || 0;
      return sum + amount;
    }, 0);

    this.editPersonForm.get('tong_so_tien_vao')?.setValue(total.toString(), {emitEvent: false});
  }

  updateTongSoGiaoDichVao(): void {
    const dongTienVao = this.bankAccountIns.value;
    const total = dongTienVao.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_giao_dich) || 0;
      return sum + amount;
    }, 0);

    this.editPersonForm.get('tong_so_giao_dich_vao')?.setValue(total.toString(), {emitEvent: false});
  }

  updateTongSoTienRa(): void {
    const dongTienRa = this.bankAccountOuts.value;
    const total = dongTienRa.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_tien_quy_doi) || 0;
      return sum + amount;
    }, 0);

    this.editPersonForm.get('tong_so_tien_ra')?.setValue(total.toString(), {emitEvent: false});
  }

  updateTongSoGiaoDichRa(): void {
    const dongTienRa = this.bankAccountOuts.value;
    const total = dongTienRa.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_giao_dich) || 0;
      return sum + amount;
    }, 0);

    this.editPersonForm.get('tong_so_giao_dich_ra')?.setValue(total.toString(), {emitEvent: false});
  }

  editPersonSubmit() {
    if (confirm('Bạn có chắc chắn muốn cập nhật thông tin cá nhân này?')) {
      if (this.editPersonForm.valid) {
        const data = this.editPersonForm.getRawValue();
        const updatedPerson = new Person(data);
        updatedPerson.id = this.personToEdit?.id;

        this.activeModal.close(updatedPerson);
      } else {
        console.log('Form is invalid');
        this.editPersonForm.markAllAsTouched();
      }
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.editPersonForm.reset();
    }
  }
}
