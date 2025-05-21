import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.scss'
})
export class AddTransactionComponent {
  @Input() transactionList: any[] = [];
  @Input() readOnly: boolean = true;

  addTransactionForm!: FormGroup

  constructor(private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
  ) { }

  ngOnInit(): void {
    console.log("Initial data this.transactionList:", this.transactionList);

    this.addTransactionForm = this.fb.group({
      ten_doi_tuong: [""],
      so_dinh_danh: [""],
      tong_so_tien_vao: [""],
      tong_so_giao_dich_vao: [""],
      tong_so_tien_ra: [""],
      tong_so_giao_dich_ra: [""],
      dong_tien_vao: this.fb.array([this.createBankIn()]),
      dong_tien_ra: this.fb.array([this.createBankOut()])
    });

    // Lắng nghe sự thay đổi trong FormArray dong_tien_vao để tính tổng tong_so_tien
    this.bankAccountIns.valueChanges.subscribe(() => {
      this.updateTongSoTienVao();
      this.updateTongSoGiaoDichVao();
    });

  }

  // Hàm xử lý khi chọn người từ dropdown
  onTransactionSelect(event: Event): void {
    const selectedTransactionId = (event.target as HTMLSelectElement).value;

    if (selectedTransactionId) {
      // Tìm người được chọn trong transactionList
      const selectedTransaction = this.transactionList.find(transaction => transaction.id === selectedTransactionId);

      if (selectedTransaction) {
        // Lấy ho_ten và so_dinh_danh (từ phần tử đầu tiên trong thong_tin_dinh_danh)
        const tenDoiTuong = selectedTransaction.ho_ten;
        const soDinhDanh = selectedTransaction.thong_tin_dinh_danh && selectedTransaction.thong_tin_dinh_danh.length > 0
          ? selectedTransaction.thong_tin_dinh_danh[0].so_dinh_danh
          : '';

        // Điền dữ liệu vào form
        this.addTransactionForm.patchValue({
          ten_doi_tuong: tenDoiTuong,
          so_dinh_danh: soDinhDanh
        });
      }
    } else {
      // Nếu chọn "-- Chọn người --", xóa dữ liệu trong các ô input
      this.addTransactionForm.patchValue({
        ten_doi_tuong: '',
        so_dinh_danh: ''
      });
    }
  }

  // Dong tien vao
  get bankAccountIns(): FormArray {
    return this.addTransactionForm.get('dong_tien_vao') as FormArray;
  }

  createBankIn(): FormGroup {
    return this.fb.group({
      ho_ten_nguon: [''],
      so_dinh_danh_nguon: [''],
      so_tai_khoan_nguon: [''],
      ten_ngan_hang_nguon: [''],
      tong_so_tien: [''],
      tong_so_giao_dich: [''],
      khoang_thoi_gian_giao_dich: [''],
      loai_tien: ['VND'],
      noi_dung: ['']
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
    return this.addTransactionForm.get('dong_tien_ra') as FormArray;
  }

  createBankOut(): FormGroup {
    return this.fb.group({
      ho_ten_dich: [''],
      so_dinh_danh_dich: [''],
      so_tai_khoan_dich: [''],
      ten_ngan_hang_dich: [''],
      tong_so_tien: [''],
      tong_so_giao_dich: [''],
      khoang_thoi_gian_giao_dich: [''],
      loai_tien: ['VND'],
      noi_dung: ['']
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
      const amount = parseFloat(item.tong_so_tien) || 0; // Chuyển đổi sang số, nếu không hợp lệ thì lấy 0
      return sum + amount;
    }, 0);

    this.addTransactionForm.get('tong_so_tien_vao')?.setValue(total.toString(), { emitEvent: false });
  }

  // Hàm tính tổng tong_so_giao_dich và cập nhật tong_so_giao_dich_vao
  updateTongSoGiaoDichVao(): void {
    const dongTienVao = this.bankAccountIns.value;
    const total = dongTienVao.reduce((sum: number, item: any) => {
      const amount = parseFloat(item.tong_so_luong_giao_dich) || 0; // Chuyển đổi sang số, nếu không hợp lệ thì lấy 0
      return sum + amount;
    }, 0);

    this.addTransactionForm.get('tong_so_giao_dich_vao')?.setValue(total.toString(), { emitEvent: false });
  }

  // Hàm submit form
  addTransactionSubmit() {
    if (confirm('Bạn có chắc chắn muốn thêm cá nhân liên quan đến giao dịch này?')) {
      if (this.addTransactionForm.valid) {
        const data = this.addTransactionForm.value;
        const newTransaction = new Transaction(data);
        newTransaction.id = new Date(Date.now()).getTime();

        // Trả dữ liệu về Step3Component
        this.activeModal.close(newTransaction);
      } else {
        // Hiển thị thông báo lỗi hoặc highlight các trường không hợp lệ
        console.log('Form is invalid');
        this.addTransactionForm.markAllAsTouched();
      }
    }

  }

  // Hàm close popup
  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addTransactionForm.reset();
    }
  }
}
