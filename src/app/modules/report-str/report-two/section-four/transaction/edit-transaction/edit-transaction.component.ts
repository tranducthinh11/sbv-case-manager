import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrl: './edit-transaction.component.scss'
})
export class EditTransactionComponent {
  @Input() transactionMenuList: any[] = [];
  @Input() transactionToEdit: any; // Dữ liệu của người cần chỉnh sửa
  @Input() readOnly: boolean = true;

  editTransactionForm!: FormGroup;
  selectedTransactionId: string | null = null; // Lưu ID của người được chọn từ dropdown

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService
  ) { }

  ngOnInit(): void {
    console.log("Transaction to edit:", this.transactionToEdit);
    console.log("Transaction list:", this.transactionMenuList);

    // Khởi tạo form
    this.editTransactionForm = this.fb.group({
      ten_doi_tuong: [''],
      so_dinh_danh: [''],
      tong_so_tien_vao: [''],
      tong_so_giao_dich_vao: [''],
      tong_so_tien_ra: [''],
      tong_so_giao_dich_ra: [''],
      dong_tien_vao: this.fb.array([]),
      dong_tien_ra: this.fb.array([])
    });

    // Patch dữ liệu của người cần chỉnh sửa vào form
    if (this.transactionToEdit) {
      this.selectedTransactionId = this.transactionToEdit.id;
      this.patchTransactionData(this.transactionToEdit);
    }
  }

  // Patch dữ liệu của người cần chỉnh sửa vào form
  patchTransactionData(transaction: any): void {
    // Patch các trường cơ bản
    this.editTransactionForm.patchValue({
      ten_doi_tuong: transaction.ten_doi_tuong || '',
      so_dinh_danh: transaction.so_dinh_danh || '',
      tong_so_tien_vao: transaction.tong_so_tien_vao || '',
      tong_so_giao_dich_vao: transaction.tong_so_giao_dich_vao || '',
      tong_so_tien_ra: transaction.tong_so_tien_ra || '',
      tong_so_giao_dich_ra: transaction.tong_so_giao_dich_ra || ''
    });

    // Patch dữ liệu cho dong_tien_vao
    const dongTienVaoArray = this.editTransactionForm.get('dong_tien_vao') as FormArray;
    dongTienVaoArray.clear();
    if (transaction.dong_tien_vao && transaction.dong_tien_vao.length > 0) {
      transaction.dong_tien_vao.forEach((item: any) => {
        dongTienVaoArray.push(this.fb.group({
          ho_ten_nguon: [item.ho_ten_nguon || ''],
          so_dinh_danh_nguon: [item.so_dinh_danh_nguon || ''],
          so_tai_khoan_nguon: [item.so_tai_khoan_nguon || ''],
          ten_ngan_hang_nguon: [item.ten_ngan_hang_nguon || ''],
          tong_so_tien: [item.tong_so_tien || ''],
          tong_so_giao_dich: [item.tong_so_giao_dich || ''],
          khoang_thoi_gian_giao_dich: [item.khoang_thoi_gian_giao_dich || ''],
          loai_tien: [item.loai_tien || 'VND'],
          noi_dung: [item.noi_dung || '']
        }));
      });
    } else {
      dongTienVaoArray.push(this.createBankIn()); // Thêm một dòng mặc định nếu không có dữ liệu
    }

    // Patch dữ liệu cho dong_tien_ra
    const dongTienRaArray = this.editTransactionForm.get('dong_tien_ra') as FormArray;
    dongTienRaArray.clear();
    if (transaction.dong_tien_ra && transaction.dong_tien_ra.length > 0) {
      transaction.dong_tien_ra.forEach((item: any) => {
        dongTienRaArray.push(this.fb.group({
          ho_ten_dich: [item.ho_ten_dich || ''],
          so_dinh_danh_dich: [item.so_dinh_danh_dich || ''],
          so_tai_khoan_dich: [item.so_tai_khoan_dich || ''],
          ten_ngan_hang_dich: [item.ten_ngan_hang_dich || ''],
          tong_so_tien: [item.tong_so_tien || ''],
          tong_so_giao_dich: [item.tong_so_giao_dich || ''],
          khoang_thoi_gian_giao_dich: [item.khoang_thoi_gian_giao_dich || ''],
          loai_tien: [item.loai_tien || 'VND'],
          noi_dung: [item.noi_dung || '']
        }));
      });
    } else {
      dongTienRaArray.push(this.createBankOut()); // Thêm một dòng mặc định nếu không có dữ liệu
    }
  }

  // Hàm xử lý khi chọn người từ dropdown
  onTransactionSelect(event: Event): void {
    const selectedTransactionId = (event.target as HTMLSelectElement).value;

    if (selectedTransactionId) {
      // Tìm người được chọn trong personList
      const selectedTransaction = this.transactionMenuList.find(transaction => transaction.id === selectedTransactionId);

      if (selectedTransaction) {
        // Lấy ho_ten và so_dinh_danh (từ phần tử đầu tiên trong thong_tin_dinh_danh)
        const tenDoiTuong = selectedTransaction.ho_ten;
        const soDinhDanh = selectedTransaction.thong_tin_dinh_danh && selectedTransaction.thong_tin_dinh_danh.length > 0
          ? selectedTransaction.thong_tin_dinh_danh[0].so_dinh_danh
          : '';

        // Điền dữ liệu vào form
        this.editTransactionForm.patchValue({
          ten_doi_tuong: tenDoiTuong,
          so_dinh_danh: soDinhDanh
        });

        this.selectedTransactionId = selectedTransactionId;
      }
    } else {
      // Nếu chọn "-- Chọn người --", xóa dữ liệu trong các ô input
      this.editTransactionForm.patchValue({
        ten_doi_tuong: '',
        so_dinh_danh: ''
      });
      this.selectedTransactionId = null;
    }
  }

  get bankAccountIns(): FormArray {
    return this.editTransactionForm.get('dong_tien_vao') as FormArray;
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

  get bankAccountOuts(): FormArray {
    return this.editTransactionForm.get('dong_tien_ra') as FormArray;
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
    if (confirm('Bạn có chắc chắn muốn xóa dòng tiền ra này?')) {
      this.bankAccountOuts.removeAt(index);
    }
  }

  editTransactionSubmit() {
    if (confirm('Bạn có chắc chắn muốn cập nhật thông tin cá nhân này?')) {
      if (this.editTransactionForm.valid) {
        const data = this.editTransactionForm.value;
        const updatedTransaction = new Transaction(data);
        updatedTransaction.id = this.transactionToEdit.id; // Giữ nguyên ID của người được chỉnh sửa

        // Trả dữ liệu về component cha (Step3Component)
        this.activeModal.close(updatedTransaction);
      } else {
        // Hiển thị thông báo lỗi hoặc highlight các trường không hợp lệ
        console.log('Form is invalid');
        this.editTransactionForm.markAllAsTouched();
      }
    }
  }

  closeModal() {
    this.activeModal.close();
  }
}
