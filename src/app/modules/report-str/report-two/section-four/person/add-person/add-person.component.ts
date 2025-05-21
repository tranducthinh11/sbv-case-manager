import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {NgbActiveModal, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {STRCategoryService} from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import {Person} from '../../models/person';
import {BaseDateRangeComponent} from "../../../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../../../common/momentdate";

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.component.html',
  styleUrl: './add-person.component.scss',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})
export class AddPersonComponent extends BaseDateRangeComponent{
  @Input() personList: any[] = [];
  @Input() readOnly: boolean = true;

  addPersonForm!: FormGroup
  currencys: any[] = [];

  constructor(private fb: FormBuilder,
              public activeModal: NgbActiveModal,
              private strCategoryService: STRCategoryService,
  ) {
    super();
  }

  ngOnInit(): void {
    console.log("Initial data this.personList:", this.personList);

    this.addPersonForm = this.fb.group({
      ten_doi_tuong: ["", Validators.required],
      so_dinh_danh: [""],
      tong_so_tien_vao: [""],
      tong_so_giao_dich_vao: [""],
      tong_so_tien_ra: [""],
      tong_so_giao_dich_ra: [""],
      dong_tien_vao: this.fb.array([this.createBankIn()]),
      dong_tien_ra: this.fb.array([this.createBankOut()]),
      mo_ta_dau_hieu_dong_tien: ["", Validators.required],
    });

    // Lấy danh sách loại tiền tệ
    this.strCategoryService.getCurrencys().subscribe(data => {
      this.currencys = data;
    });

    // Lắng nghe sự thay đổi trong FormArray dong_tien_vao để tính tổng tong_so_tien
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

  // Hàm xử lý khi chọn người từ dropdown
  onPersonSelect(event: Event): void {
    const selectedPersonId = (event.target as HTMLSelectElement).value;

    if (selectedPersonId) {
      // Tìm người được chọn trong personList
      const selectedPerson = this.personList.find(person => person.id === selectedPersonId);

      if (selectedPerson) {
        // Lấy ho_ten và so_dinh_danh (từ phần tử đầu tiên trong thong_tin_dinh_danh)
        const tenDoiTuong = selectedPerson.ho_ten;
        const soDinhDanh = selectedPerson.thong_tin_dinh_danh && selectedPerson.thong_tin_dinh_danh.length > 0
          ? selectedPerson.thong_tin_dinh_danh[0].so_dinh_danh
          : '';

        // Điền dữ liệu vào form
        this.addPersonForm.patchValue({
          ten_doi_tuong: tenDoiTuong,
          so_dinh_danh: soDinhDanh
        });
      }
    } else {
      // Nếu chọn "-- Chọn người --", xóa dữ liệu trong các ô input
      this.addPersonForm.patchValue({
        ten_doi_tuong: '',
        so_dinh_danh: ''
      });
    }
  }

  // Dong tien vao
  get bankAccountIns(): FormArray {
    return this.addPersonForm.get('dong_tien_vao') as FormArray;
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

  // Dong tien ra
  get bankAccountOuts(): FormArray {
    return this.addPersonForm.get('dong_tien_ra') as FormArray;
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
    if (confirm('Bạn có chắc chắn muốn xóa dòng tiền vào này?')) {
      this.bankAccountOuts.removeAt(index);
    }
  }

  // Hàm tính tổng tong_so_tien và cập nhật tong_so_tien_vao
  updateTongSoTienVao(): void {
    const dongTienVao = this.bankAccountIns.value;
    const total = dongTienVao.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_tien_quy_doi) || 0; // Chuyển đổi sang số, nếu không hợp lệ thì lấy 0
      return sum + amount;
    }, 0);

    this.addPersonForm.get('tong_so_tien_vao')?.setValue(total.toString(), {emitEvent: false});
  }

  // Hàm tính tổng tong_so_giao_dich và cập nhật tong_so_giao_dich_vao
  updateTongSoGiaoDichVao(): void {
    const dongTienVao = this.bankAccountIns.value;
    const total = dongTienVao.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_giao_dich) || 0; // Chuyển đổi sang số, nếu không hợp lệ thì lấy 0
      return sum + amount;
    }, 0);

    this.addPersonForm.get('tong_so_giao_dich_vao')?.setValue(total.toString(), {emitEvent: false});
  }

  updateTongSoTienRa(): void {
    const dongTienRa = this.bankAccountOuts.value;
    const total = dongTienRa.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_tien_quy_doi) || 0;
      return sum + amount;
    }, 0);

    this.addPersonForm.get('tong_so_tien_ra')?.setValue(total.toString(), {emitEvent: false});
  }

  updateTongSoGiaoDichRa(): void {
    const dongTienRa = this.bankAccountOuts.value;
    const total = dongTienRa.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_giao_dich) || 0;
      return sum + amount;
    }, 0);

    this.addPersonForm.get('tong_so_giao_dich_ra')?.setValue(total.toString(), {emitEvent: false});
  }

  // Hàm submit form
  addPersonSubmit() {
    if (confirm('Bạn có chắc chắn muốn thêm cá nhân liên quan đến giao dịch này?')) {
      if (this.addPersonForm.valid) {
        const data = this.addPersonForm.value;
        const newPerson = new Person(data);
        newPerson.id = new Date(Date.now()).getTime();

        // Trả dữ liệu về Step3Component
        this.activeModal.close(newPerson);
      } else {
        // Hiển thị thông báo lỗi hoặc highlight các trường không hợp lệ
        console.log('Form is invalid');
        this.addPersonForm.markAllAsTouched();
      }
    }

  }

  // Hàm close popup
  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addPersonForm.reset();
    }
  }
}
