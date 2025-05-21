import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
import { STRModelService } from '../section-two/services/str-model.service'
import { AuthService } from 'src/app/modules/auth';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { ActivatedRoute } from '@angular/router';
import { STRConstant } from 'src/app/common/str-case.constant';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrl: './step1.component.scss'
})
export class Step1Component implements OnInit, OnDestroy, OnChanges {
  @Input() readOnly: boolean = false;
  @Input() strReport: any;
  @Input() onSaveAllCb!: (value: any) => void;
  @Output() savePartSubmited: EventEmitter<any> = new EventEmitter();
  @Input() category!: string;

  addStep1Form!: FormGroup;

  onSelectResponsiblePerson = true;
  onSelectReporter = true;
  reportId: string | null = null; // Lưu ID lấy từ URL
  showReportType = false;
  previousReports: any[] = [];
  countries: any[] = [];

  constructor(
    private fb: FormBuilder,
    private strModelService: STRModelService,
    private authService: AuthService,
    private strCategoryService: STRCategoryService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initForm();

    // Nếu là tạo mới thì cần fill thông tin vào đối tượng báo cáo
    this.route.params.subscribe(params => {
      this.reportId = params['id'];
      if (!this.reportId) {
        let data = this.authService.getEntityFromLocalStorage()
        this.updateForm(data);
      }
    });

    // Lấy danh sách quốc gia
    this.strCategoryService.getCountries().subscribe(data => {
      this.countries = data;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.strReport) {
      console.log('ngOnChanges Step1Component', this.strReport);

      var ngayBaoCao = this.strReport.payload.Thong_tin_chung.ngay_bao_cao;

      setTimeout(() => {
        const formData = {
          ma_bao_cao_noi_bo: this.strReport.str_internal_number,
          ngay_bao_cao: ngayBaoCao ? formatDate(ngayBaoCao, 'yyyy-MM-dd', 'en-US') : null,
          so_bao_cao: this.strReport.payload.Thong_tin_chung.so_bao_cao,
          doi_tuong_bao_cao: this.strReport.payload.Phan_1.doi_tuong_bao_cao,
          nguoi_chiu_trach_nhiem: this.strReport.payload.Phan_1.nguoi_chiu_trach_nhiem,
          nguoi_lap_bao_cao: this.strReport.payload.Phan_1.nguoi_lap_bao_cao,
        };

        this.addStep1Form.patchValue(formData);

        // ✅ Patch riêng từng giá trị của `sua_doi_bo_sung`
        this.addStep1Form.get('sua_doi_bo_sung')?.patchValue({
          loai_thay_doi: this.strReport.payload.Thong_tin_chung.sua_doi_bo_sung.loai_thay_doi,
          so_bao_cao: this.strReport.payload.Thong_tin_chung.sua_doi_bo_sung.so_bao_cao,
          ngay_bao_cao: this.strReport.payload.Thong_tin_chung.sua_doi_bo_sung.ngay_bao_cao,
        });

        // ✅ Đợi một chút rồi mới gọi hàm kiểm tra để đảm bảo form đã cập nhật
        setTimeout(() => {
          this.onChangeReportType();
        });
      });
    }
  }

  initForm() {
    this.addStep1Form = this.fb.group({
      ngay_bao_cao: [''],
      so_bao_cao: [''],
      sua_doi_bo_sung: this.fb.group({
        loai_thay_doi: [0],
        so_bao_cao: [''],
        ngay_bao_cao: [''],
      }),
      ma_bao_cao_noi_bo: ['', Validators.required],

      doi_tuong_bao_cao: this.fb.group({
        ten_doi_tuong_bao_cao: [''],
        ma_doi_tuong_bao_cao: [''],
        dia_chi: this.fb.group({
          so_nha: [''],
          dien_thoai: [''],
          quan_huyen: [''],
          tinh_thanh: [''],
          quoc_gia: ['']
        }),

        dia_diem_phat_sinh: this.fb.group({
          ten_diem_phat_sinh_giao_dich: ['', Validators.required],
          so_nha: ['', Validators.required],
          dien_thoai: ['', Validators.required],
          quan_huyen: ['', Validators.required],
          tinh_thanh: ['', Validators.required],
          quoc_gia: ['VN', Validators.required]
        }),

        email: [''],
      }),

      nguoi_chiu_trach_nhiem: this.fb.group({
        ho_ten: [''],
        dien_thoai_noi_lam_viec: [''],
        dien_thoai_di_dong: [''],
        chuc_vu: ['']
      }),
      nguoi_lap_bao_cao: this.fb.group({
        ho_ten: ['', Validators.required],
        dien_thoai_noi_lam_viec: ['', Validators.required],
        dien_thoai_di_dong: ['', Validators.required],
        bo_phan_cong_tac: ['', Validators.required],
      }),
    });

    if (this.readOnly == true) {
      this.addStep1Form?.disable({ emitEvent: false });
    }
  }

  updateForm(data: any) {
    console.log("Data", data);
    this.addStep1Form.patchValue({
      ma_bao_cao_noi_bo: data?.str_internal_number || '',
      doi_tuong_bao_cao: {
        ten_doi_tuong_bao_cao: data?.report_entity_name || '',
        ma_doi_tuong_bao_cao: data?.report_entity_code || '',
        dia_chi: {
          so_nha: data?.address || '',
          dien_thoai: data?.phone || '',
          quan_huyen: data?.district || '',
          tinh_thanh: data?.province || '',
          quoc_gia: data?.country || ''
        },
        email: data?.email || ''
      }
    });
  }

  ngOnDestroy() {
  }


  updateCurrentInputData() {
    if (this.addStep1Form.invalid) {
      return this.strReport = null;
    }

    // Kiểm tra không phải chỉnh sửa thì tạo thông tin strReport mới
    if (!this.strReport?.id) {
      this.strReport = {
        id: null,
        str_internal_number: this.addStep1Form.value['ma_bao_cao_noi_bo'],
        str_type: 'M1',
        creation_status: STRConstant.statusList[0].code,
        payload: { Thong_tin_chung: {}, Phan_1: {}, Phan_2: {}, Phan_3: {}, Phan_4: {}, Phan_5: {}, Phan_6: {} }
      }
    }

    // Lấy dữ liệu từ form
    const formData = this.addStep1Form.value;

    // Gán dữ liệu vào strReport.payload.Phan_1
    this.strReport.payload.Phan_1 = {
      doi_tuong_bao_cao: {
        ten_doi_tuong_bao_cao: formData.doi_tuong_bao_cao.ten_doi_tuong_bao_cao,
        ma_doi_tuong_bao_cao: formData.doi_tuong_bao_cao.ma_doi_tuong_bao_cao,
        dia_chi: formData.doi_tuong_bao_cao.dia_chi,
        dia_diem_phat_sinh: formData.doi_tuong_bao_cao.dia_diem_phat_sinh,
        email: formData.doi_tuong_bao_cao.email
      },
      nguoi_chiu_trach_nhiem: formData.nguoi_chiu_trach_nhiem,
      nguoi_lap_bao_cao: formData.nguoi_lap_bao_cao
    };
    // Gán dữ liệu phần thông tin chung
    this.strReport.payload.Thong_tin_chung = {
      ngay_bao_cao: formData.ngay_bao_cao,
      so_bao_cao: formData.so_bao_cao,
      sua_doi_bo_sung: formData.sua_doi_bo_sung,
      ten_doi_tuong_bao_cao: formData.doi_tuong_bao_cao.ten_doi_tuong_bao_cao,
      ma_doi_tuong_bao_cao: formData.doi_tuong_bao_cao.ma_doi_tuong_bao_cao,
      mau_bao_cao: 'M1'
    }

    return this.strReport;
  }

  // Method khi gọi button submit
  addStep1Submit() {
    const maBaoCaoNoiBoControl = this.addStep1Form.get('ma_bao_cao_noi_bo');
    const maDoiTuongBaoCao = this.addStep1Form.get('doi_tuong_bao_cao.ma_doi_tuong_bao_cao')?.value;

    // Nếu đang ở chế độ edit, bỏ qua bước kiểm tra duplicate
    if (this.reportId || maBaoCaoNoiBoControl?.disabled) {
      this.handleFormSubmission();
      return;
    }

    const maBaoCaoNoiBo = maBaoCaoNoiBoControl?.value;

    // Nếu là tạo mới, kiểm tra duplicate
    this.strModelService.checkDuplicateInternalNumber({ internalNumber: maBaoCaoNoiBo, maDoiTuongBaoCao: maDoiTuongBaoCao })
      .subscribe((exists) => {
        if (exists) {
          alert('Mã báo cáo nội bộ đã tồn tại. Vui lòng nhập mã khác!');
          // this.addStep1Form.get('ma_bao_cao_noi_bo')?.setErrors({ duplicate: true });
          return;
        }

        this.handleFormSubmission();
      });
  }

  handleFormSubmission() {
    // Kiểm tra form hợp lệ trước khi lưu
    if (this.addStep1Form.invalid) {
      this.addStep1Form.markAllAsTouched();
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    } else {

      const suaDoiBoSung = this.addStep1Form.get('sua_doi_bo_sung.loai_thay_doi').value;
      const soBaoCao = this.addStep1Form.get('sua_doi_bo_sung.so_bao_cao').value;
      if ((suaDoiBoSung === '1' || suaDoiBoSung === '2') && soBaoCao.length == 0){
        alert("Vui lòng chọn mã số báo cáo thay thế / bổ sung");
        return
      }

      if (confirm('Bạn có muốn lưu dữ liệu không?')) {
        this.updateCurrentInputData();
        this.savePartSubmited.emit(this.strReport);
      }

      this.addStep1Form.get('ma_bao_cao_noi_bo')?.disable();
    }
  }

  // Lấy danh sách mã báo cáo và ngày báo cáo trước đây
  loadPreviousReportData(): void {
    const reportCode = this.addStep1Form.get('doi_tuong_bao_cao.ma_doi_tuong_bao_cao')?.value;

    if (!reportCode) {
      console.error("Không có mã đối tượng báo cáo!");
      return;
    }

    this.strModelService.getInforReport({ report_entity_code: reportCode }).subscribe({
      next: (res: any) => {
        if (res.body && res.body.content) {
          console.log("Dữ liệu báo cáo cũ:", res.body.content);
          this.previousReports = res.body.content;
        } else {
          console.error("Không có dữ liệu trong response body!");
          this.previousReports = [];
        }
      },
      error: (err) => {
        console.error("Lỗi khi lấy dữ liệu từ API:", err);
        this.previousReports = [];
      }
    });
  }

  // Hàm xử lý khi thay đổi loại thay đổi (Khi chọn thay thế hoặc bổ sung)
  onChangeReportType(): void {
    const selectedValue = this.addStep1Form.get('sua_doi_bo_sung.loai_thay_doi')?.value;

    if (selectedValue === 1 || selectedValue === 2 || selectedValue === "1" || selectedValue === "2") {
      this.showReportType = true;
      this.loadPreviousReportData(); // Gọi API lấy danh sách báo cáo trước đây
    } else {
      this.showReportType = false;
      this.previousReports = []; // Xóa danh sách cũ nếu chọn lại "Không"

      // Reset giá trị của form control
      this.addStep1Form.patchValue({
        sua_doi_bo_sung: {
          so_bao_cao: '',
          ngay_bao_cao: ''
        }
      });
    }
  }

  // Khi chọn mã báo cáo, cập nhật ngày báo cáo tương ứng
  onReportCodeChange(event: Event): void {
    const selectedReportCode = (event.target as HTMLSelectElement).value;

    if (!selectedReportCode) {
      this.addStep1Form.get('sua_doi_bo_sung.ngay_bao_cao')?.reset();
      return;
    }

    const selectedReport = this.previousReports.find(report => report.so_bao_cao === selectedReportCode);

    if (selectedReport && selectedReport.ngay_bao_cao) {
      const dateObj = new Date(selectedReport.ngay_bao_cao);
      const formattedDate = dateObj.toLocaleDateString('vi-VN');
      this.addStep1Form.get('sua_doi_bo_sung.ngay_bao_cao')?.setValue(formattedDate);
    }
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.route.params.subscribe(params => {
        this.reportId = params['id'];
        let data = this.authService.getEntityFromLocalStorage()
          this.addStep1Form.reset({
            ma_bao_cao_noi_bo: data?.str_internal_number || '',
            doi_tuong_bao_cao: {
              ten_doi_tuong_bao_cao: data?.report_entity_name || '',
              ma_doi_tuong_bao_cao: data?.report_entity_code || '',
              dia_chi: {
                so_nha: data?.address || '',
                dien_thoai: data?.phone || '',
                quan_huyen: data?.district || '',
                tinh_thanh: data?.province || '',
                quoc_gia: data?.country || ''
              },
              email: data?.email || ''
            }
          });
      });
    }
  }
}
