import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Common} from 'src/app/modules/report-str/report-two/service-common/common';
import {STRCategoryService} from 'src/app/modules/report-str/report-two/service-common/str-category.service';


@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrl: './step5.component.scss'
})
export class Step5Component implements OnInit, OnDestroy {
  addStep5Form: FormGroup;
  @Input() strReport: any;
  @Output() savePartSubmited: EventEmitter<any> = new EventEmitter();
  @Input() readOnly: boolean = false;

  responseData: any[] = []; // Lưu trữ dữ liệu từ API
  isDataLoaded = false;


  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private strCategoryService: STRCategoryService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.fetchData();
  }

  private initForm() {
    // console.log("strReport", this.strReport)

    this.addStep5Form = this.fb.group({
      cong_viec_da_xu_ly: this.fb.array([]),
      cong_van_info: this.fb.array([]),
      noi_dung: null,
    });

    // Áp dụng validator tùy chỉnh
    this.addStep5Form.setValidators(Common.atLeastOneCheckedValidator('cong_viec_da_xu_ly'));

    if (!this.readOnly) {
      this.addStep5Form.get('cong_viec_da_xu_ly')?.valueChanges.subscribe(() => {
        this.updateCongVanFields();
        this.updateCongViecKhacContent();
        this.addStep5Form.updateValueAndValidity();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Xử lý khi strReport thay đổi
    if (changes['strReport'] && this.isDataLoaded) {
      this.patchFormDataIfNeeded();
    }
  }

  private patchFormDataIfNeeded() {
    if (this.strReport?.payload?.Phan_5 && this.responseData.length > 0) {
      console.log(this.strReport.payload.Phan_5);
      this.patchFormData(this.strReport.payload.Phan_5);
    }
  }

  get congVanInfoArray(): FormArray {
    return this.addStep5Form.get('cong_van_info') as FormArray;
  }

  createCongVanGroup(loai_cong_van: string): FormGroup {
    return this.fb.group({
      loai_cong_van: [loai_cong_van],
      so_cong_van: ['', Validators.required], // Bắt buộc nhập
      ngay_cong_van: ['', Validators.required], // Bắt buộc nhập
      don_vi: ['', Validators.required] // Bắt buộc nhập
    });
  }

  updateCongVanFields() {
    const congVanArray = this.congVanInfoArray;

    // Lưu trữ dữ liệu hiện tại của cong_van_info trước khi xóa
    const currentCongVanData = congVanArray.value;

    // Lưu trữ dữ liệu của item.value === "6" và item.value === "7" một cách độc lập
    let congVan6: any = null; // Công văn của item.value === "6"
    let congVan7Den: any = null; // Công văn đến của item.value === "7"
    let congVan7TraVe: any = null; // Công văn trả về của item.value === "7"

    // Phân loại dữ liệu dựa trên thứ tự và loai_cong_van
    if (currentCongVanData.length > 0) {
      let index = 0;

      // Nếu trước đó có item.value === "6" (công văn đầu tiên là của "6" nếu có)
      if (currentCongVanData[index] && currentCongVanData[index].loai_cong_van === "0") {
        congVan6 = currentCongVanData[index];
        index++;
      }

      // Nếu trước đó có item.value === "7" (công văn tiếp theo là của "7")
      if (currentCongVanData[index] && currentCongVanData[index].loai_cong_van === "1") {
        congVan7Den = currentCongVanData[index];
        index++;
        if (currentCongVanData[index] && currentCongVanData[index].loai_cong_van === "2") {
          congVan7TraVe = currentCongVanData[index];
        }
      }
    }

    // Xóa dữ liệu cũ
    congVanArray.clear();

    // Tạo lại các FormGroup và khôi phục dữ liệu
    if (this.isValueSixChecked()) {
      congVanArray.push(this.createCongVanGroup("0")); // Công văn đi của "6"
      if (congVan6) {
        congVanArray.at(0).patchValue({
          so_cong_van: congVan6.so_cong_van,
          ngay_cong_van: congVan6.ngay_cong_van,
          don_vi: congVan6.don_vi
        });
      }
    }

    if (this.isValueSevenChecked()) {
      // Thêm công văn đến của "7"
      congVanArray.push(this.createCongVanGroup("1"));
      if (congVan7Den) {
        congVanArray.at(congVanArray.length - 1).patchValue({
          so_cong_van: congVan7Den.so_cong_van,
          ngay_cong_van: congVan7Den.ngay_cong_van,
          don_vi: congVan7Den.don_vi
        });
      }

      // Thêm công văn trả về của "7"
      congVanArray.push(this.createCongVanGroup("2"));
      if (congVan7TraVe) {
        congVanArray.at(congVanArray.length - 1).patchValue({
          so_cong_van: congVan7TraVe.so_cong_van,
          ngay_cong_van: congVan7TraVe.ngay_cong_van,
          don_vi: congVan7TraVe.don_vi
        });
      }
    }
  }

  updateCongViecKhacContent() {
    if (!this.isValueZeroChecked()) {
      this.addStep5Form.patchValue({noi_dung: null});
    }
  }

  isValueSixChecked(): boolean {
    const index = this.responseData.findIndex(item => item.value === "6");
    if (index === -1) return false;
    const formArray = this.addStep5Form.get('cong_viec_da_xu_ly') as FormArray;
    return formArray.at(index).value;
  }

  isValueSevenChecked(): boolean {
    const index = this.responseData.findIndex(item => item.value === "7");
    if (index === -1) return false;
    const formArray = this.addStep5Form.get('cong_viec_da_xu_ly') as FormArray;
    return formArray.at(index).value;
  }

  isValueZeroChecked(): boolean {
    const index = this.responseData.findIndex(item => item.value === "0");
    if (index === -1) return false;
    const formArray = this.addStep5Form.get('cong_viec_da_xu_ly') as FormArray;
    return formArray.at(index).value;
  }

  // Gọi API để lấy danh sách dữ liệu và khởi tạo FormArray
  fetchData() {
    this.strCategoryService.getCategory({type: 10, report_type: 'M1'}).subscribe({
      next: (data) => {
        this.responseData = data || [];
        this.initCheckboxes();
        this.isDataLoaded = true; // Đánh dấu dữ liệu đã sẵn sàng

        // Patch dữ liệu nếu có strReport
        this.patchFormDataIfNeeded();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.responseData = [];
        this.initCheckboxes();
      }
    });
  }

  private patchFormData(payload: any) {
    if (!payload || !payload.cong_viec_da_xu_ly) return;

    const congViecDaXuLyArray = this.addStep5Form.get('cong_viec_da_xu_ly') as FormArray;
    const congVanInfoArray = this.addStep5Form.get('cong_van_info') as FormArray;

    // Lưu trữ dữ liệu hiện tại của cong_van_info trước khi patch
    const currentCongVanData = congVanInfoArray.value;
    let congVan6: any = null;
    let congVan7Den: any = null;
    let congVan7TraVe: any = null;

    if (currentCongVanData.length > 0) {
      let index = 0;
      if (currentCongVanData[index] && currentCongVanData[index].loai_cong_van === "0") {
        congVan6 = currentCongVanData[index];
        index++;
      }
      if (currentCongVanData[index] && currentCongVanData[index].loai_cong_van === "1") {
        congVan7Den = currentCongVanData[index];
        index++;
        if (currentCongVanData[index] && currentCongVanData[index].loai_cong_van === "2") {
          congVan7TraVe = currentCongVanData[index];
        }
      }
    }

    // Patch dữ liệu cho checkbox (cong_viec_da_xu_ly)
    const selectedValues = payload.cong_viec_da_xu_ly.map((item: any) => item.ma_cong_viec);
    this.responseData.forEach((item, index) => {
      const isChecked = selectedValues.includes(item.value);
      congViecDaXuLyArray.at(index).patchValue(isChecked, {emitEvent: false});
    });

    // Patch dữ liệu cho cong_van_info
    congVanInfoArray.clear();
    payload.cong_viec_da_xu_ly.forEach((cv: any) => {
      if (cv.cong_van && cv.cong_van.length > 0) {
        if (cv.ma_cong_viec === "6") {
          const congVan = cv.cong_van[0];
          const newGroup = this.createCongVanGroup("0");
          congVanInfoArray.push(newGroup);
          newGroup.patchValue({
            so_cong_van: congVan.so_cong_van || congVan6?.so_cong_van || '',
            ngay_cong_van: this.formatDate(congVan.ngay_cong_van) || congVan6?.ngay_cong_van || '',
            don_vi: congVan.don_vi || congVan6?.don_vi || ''
          });
        } else if (cv.ma_cong_viec === "7") {
          cv.cong_van.forEach((congVan: any) => {
            const newGroup = this.createCongVanGroup(congVan.loai_cong_van);
            congVanInfoArray.push(newGroup);
            if (congVan.loai_cong_van === "1") {
              newGroup.patchValue({
                so_cong_van: congVan.so_cong_van || congVan7Den?.so_cong_van || '',
                ngay_cong_van: this.formatDate(congVan.ngay_cong_van) || congVan7Den?.ngay_cong_van || '',
                don_vi: congVan.don_vi || congVan7Den?.don_vi || ''
              });
            } else if (congVan.loai_cong_van === "2") {
              newGroup.patchValue({
                so_cong_van: congVan.so_cong_van || congVan7TraVe?.so_cong_van || '',
                ngay_cong_van: this.formatDate(congVan.ngay_cong_van) || congVan7TraVe?.ngay_cong_van || '',
                don_vi: congVan.don_vi || congVan7TraVe?.don_vi || ''
              });
            }
          });
        }
      }
      if (cv.ma_cong_viec === "0") {
        this.addStep5Form.patchValue({noi_dung: cv.noi_dung});
      }
    });

    if (this.readOnly == true) {
      this.addStep5Form?.disable({emitEvent: false});
    }
  }

  // Khởi tạo checkbox dựa trên responseData
  private initCheckboxes() {
    const formArray = this.addStep5Form.get('cong_viec_da_xu_ly') as FormArray;
    formArray.clear(); // Xóa các control cũ (nếu có)
    this.responseData.forEach(() => {
      formArray.push(this.fb.control(false)); // Thêm control với giá trị false
    });
  }

  updateCurrentInputData() {
    if (!this.strReport?.id) {
      this.strReport = {id: null, payload: {Phan_1: {}, Phan_2: {}, Phan_3: {}, Phan_4: {}, Phan_5: {}, Phan_6: {}}};
    }

    const selectedValues = this.addStep5Form.value.cong_viec_da_xu_ly
      .map((checked: boolean, index: number) => (checked ? this.responseData[index] : null))
      .filter(value => value !== null);

    const requestBody: any = {
      cong_viec_da_xu_ly: selectedValues.map(item => ({
        ma_cong_viec: item.value,
        mo_ta: item.name,
        cong_van: [],
        //  noi_dung:null
      }))
    };

    const congVanInfoArray = this.addStep5Form.value.cong_van_info;

    // Xử lý công văn cho ma_cong_viec: "6"
    if (this.isValueSixChecked()) {
      const congVanInfo = congVanInfoArray[0]; // Công văn đầu tiên là công văn đi của "6"
      const congViec6 = requestBody.cong_viec_da_xu_ly.find((cv: any) => cv.ma_cong_viec === "6");
      if (congViec6) {
        congViec6.cong_van.push({
          loai_cong_van: "0",
          so_cong_van: congVanInfo.so_cong_van,
          ngay_cong_van: congVanInfo.ngay_cong_van,
          don_vi: congVanInfo.don_vi
        });
      }
    }

    // Xử lý công văn cho ma_cong_viec: "7"
    if (this.isValueSevenChecked()) {
      const congViec7 = requestBody.cong_viec_da_xu_ly.find((cv: any) => cv.ma_cong_viec === "7");
      if (congViec7) {
        const startIndex = this.isValueSixChecked() ? 1 : 0; // Nếu "6" được chọn, công văn của "7" bắt đầu từ index 1
        const congVanDen = congVanInfoArray[startIndex]; // Công văn đến
        const congVanTraVe = congVanInfoArray[startIndex + 1]; // Công văn trả về

        congViec7.cong_van.push(
          {
            loai_cong_van: "1",
            so_cong_van: congVanDen.so_cong_van,
            ngay_cong_van: congVanDen.ngay_cong_van,
            don_vi: congVanDen.don_vi
          },
          {
            loai_cong_van: "2",
            so_cong_van: congVanTraVe.so_cong_van,
            ngay_cong_van: congVanTraVe.ngay_cong_van,
            don_vi: congVanTraVe.don_vi
          }
        );
      }
    }
    if (this.isValueZeroChecked()) {
      const congViecKhac = requestBody.cong_viec_da_xu_ly.find((cv: any) => cv.ma_cong_viec === "0");
      const noiDung = this.addStep5Form.get('noi_dung')?.value;
      if (congViecKhac) {
        congViecKhac.noi_dung = noiDung;
      }
    }
    this.strReport.payload.Phan_5 = requestBody;
    this.strReport.cong_viec_da_xu_ly = requestBody.cong_viec_da_xu_ly;

    return this.strReport;
  }

  addStep5Submit() {
    if (confirm('Bạn có chắc chắn muốn gửi các công việc đã xử lí này?')) {
      this.addStep5Form.markAllAsTouched();

      if (this.addStep5Form.invalid) {
        this.addStep5Form.markAllAsTouched();
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
        return;
      } else {
        this.updateCurrentInputData();
        this.savePartSubmited.emit(this.strReport);
        this.patchFormData(this.strReport.payload.Phan_5);
      }
    }
  }


  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  ngOnDestroy() {
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addStep5Form.reset();
    }
  }
}
