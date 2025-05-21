import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription, BehaviorSubject, forkJoin } from 'rxjs';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { Person } from './models/person';
import { Organization } from './models/organization';
import {NgbDateParserFormatter, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddPersonComponent } from './person/add-person/add-person.component';
import { PersonService } from './services/person.service';
import { EditPersonComponent } from './person/edit-person/edit-person.component';
import { Common } from '../service-common/common';
import {BaseDateRangeComponent} from "../service-common/base-date-range-component";
import {MomentDateFormatter} from "../../../../common/momentdate";

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrl: './step4.component.scss',
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatter }
  ]
})

export class Step4Component extends BaseDateRangeComponent implements OnInit, OnDestroy {
  @Input() strReport: any;
  @Output() savePartSubmited: EventEmitter<any> = new EventEmitter();
  @Input() readOnly: boolean = false;

  addStep4Form: FormGroup;
  private unsubscribe: Subscription[] = [];
  currencys: any[] = [];

  reportTypes: any[] = [];
  suspiciousSigns: any[] = [];
  finalConclusion: any[] = [];

  displayPerson$ = new BehaviorSubject<Person[]>([]);

  constructor(
    private fb: FormBuilder,
    private strCategoryService: STRCategoryService,
    private cdRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private personService: PersonService
  ) {
    super();}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Patch dữ liệu khi strReport thay đổi
    if (this.readOnly) {
      this.loadData();
    }
    if (changes['strReport'] && this.strReport?.payload?.Phan_4 && this.addStep4Form) {
      this.patchFormData(this.strReport.payload.Phan_4);
    }
  }

  loadData() {
    forkJoin({
      reportTypes: this.strCategoryService.getCategory({ type: 7, report_type: 'M1' }),
      suspiciousSigns: this.strCategoryService.getCategory({ type: 8, report_type: 'M1' }),
      finalConclusion: this.strCategoryService.getCategoryCrime(),
      currencys: this.strCategoryService.getCurrencys()
    }).subscribe({
      next: ({ reportTypes, suspiciousSigns, finalConclusion, currencys }) => {
        this.reportTypes = reportTypes.map(item => ({ key: item.value, value: item.name }));
        this.suspiciousSigns = suspiciousSigns.map(item => ({
          key: item.value,
          value: item.name,
          ...(item.value === 'khac'
            ? { noi_dung_khac_dang_ngo: item.noi_dung_khac_dang_ngo }
            : {})
        }));
        this.finalConclusion = finalConclusion.map(item => ({
          key: item.crimeCode,
          value: item.crimeName,
          ...(item.crimeCode === '401'
            ? { noi_dung_khac_toi_pham_dang_ngo: item.noi_dung_khac_toi_pham_dang_ngo }
            : {})
        }));
        this.currencys = currencys;

        // Khởi tạo form sau khi dữ liệu từ API đã sẵn sàng
        this.initForm();

        // Patch dữ liệu ngay sau khi form được khởi tạo
        if (this.strReport?.payload?.Phan_4) {
          this.patchFormData(this.strReport.payload.Phan_4);
        }
      },
      error: (err) => console.error('Error loading data:', err)
    });
  }

  initForm() {
    const groupConditions: { [key: string]: FormControl } = {};
    this.reportTypes.forEach(item => groupConditions[item.key] = this.fb.control(false));
    this.suspiciousSigns.forEach(item => groupConditions[item.key] = this.fb.control(false));
    this.finalConclusion.forEach(item => groupConditions[item.key] = this.fb.control(false));

    // Khởi tạo FormGroup với đầy đủ các trường
    this.addStep4Form = this.fb.group({
      ngay_phat_hien: ['', Validators.required],
      thuc_hien_giao_dich: ['0'],
      tu_ngay: [null],
      den_ngay: [null],
      tong_so_tien_giao_dich: [''],
      so_tien_giao_dich: this.fb.array([this.newTransactionMoney()]),
      ...groupConditions,
      phan_tich: [''],
      so_thong_bao: [''],
      co_so_nghi_ngo: [''],
      diem_b_co_so_nghi_ngo: [''],
      noi_dung_khac_dang_ngo: null,
      noi_dung_khac_toi_pham_dang_ngo: null
    });

    // Lấy danh sách cá nhân từ person service
    this.personService.personList$.subscribe(persons => {
      this.displayPerson$.next(persons || []);
    });

    // Subscription cho thuc_hien_giao_dich
    this.addStep4Form.get('thuc_hien_giao_dich')?.valueChanges.subscribe(value => {
      if (value === '1') {
        this.addStep4Form.get('tu_ngay')?.setValidators([Validators.required]);
        this.addStep4Form.get('den_ngay')?.setValidators([Validators.required]);
        this.addStep4Form.get('tong_so_tien_giao_dich')?.setValidators([Validators.required]);
        this.tractionMoneys.controls.forEach((control: any) => {
          control.get('loai_tien')?.setValidators([Validators.required]);
          control.get('so_tien')?.setValidators([Validators.required]);
          control.get('loai_tien')?.updateValueAndValidity();
          control.get('so_tien')?.updateValueAndValidity();
        });
      } else {
        this.addStep4Form.get('tu_ngay')?.clearValidators();
        this.addStep4Form.get('den_ngay')?.clearValidators();
        this.addStep4Form.get('tong_so_tien_giao_dich')?.clearValidators();
        this.tractionMoneys.controls.forEach((control: any) => {
          control.get('loai_tien')?.clearValidators();
          control.get('so_tien')?.clearValidators();
          control.get('loai_tien')?.updateValueAndValidity();
          control.get('so_tien')?.updateValueAndValidity();
        });
        this.addStep4Form.get('tu_ngay')?.reset();
        this.addStep4Form.get('den_ngay')?.reset();
        this.addStep4Form.get('tong_so_tien_giao_dich')?.reset();
        this.tractionMoneys.clear();
        this.tractionMoneys.push(this.newTransactionMoney());
      }
      this.addStep4Form.get('tu_ngay')?.updateValueAndValidity();
      this.addStep4Form.get('den_ngay')?.updateValueAndValidity();
      this.addStep4Form.get('tong_so_tien_giao_dich')?.updateValueAndValidity();
    });

    // Disable form nếu readOnly là true
    if (this.readOnly) {
      this.addStep4Form.disable({ emitEvent: false });
    }
  }

  // Patch dữ liệu từ strReport.payload.Phan_4 vào form
  patchFormData(payload: any) {
    // Patch các trường cơ bản
    this.addStep4Form.patchValue({
      ngay_phat_hien: Common.convertDateToNgbDate(payload.ngay_phat_hien) || '',
      thuc_hien_giao_dich: payload.thong_tin_giao_dich?.hien_trang_giao_dich || '0',
      tu_ngay: Common.convertDateToNgbDate(payload.thong_tin_giao_dich?.thoi_gian_giao_dich?.tu_ngay) || null,
      den_ngay: Common.convertDateToNgbDate(payload.thong_tin_giao_dich?.thoi_gian_giao_dich?.den_ngay) || null,
      tong_so_tien_giao_dich: this.formatCurrency(payload.thong_tin_giao_dich?.tong_tien_giao_dich_quy_doi) || '',
      so_thong_bao: payload.phan_tich?.co_so_phap_ly?.diem_a?.so_thong_bao || '',
      co_so_nghi_ngo: payload.phan_tich?.co_so_phap_ly?.diem_a?.co_so_nghi_ngo || '',
      diem_b_co_so_nghi_ngo: payload.phan_tich?.co_so_phap_ly?.diem_b?.co_so_nghi_ngo || ''
    });

    this.personService.setPerson(payload.phan_tich?.dong_tien || []);

    // Patch các checkbox reportTypes
    if (payload.loai_bao_cao?.dieu_khoan_bao_cao) {
      payload.loai_bao_cao.dieu_khoan_bao_cao.forEach((item: any) => {
        if (this.addStep4Form.get(item.ma_dieu_khoan)) {
          this.addStep4Form.get(item.ma_dieu_khoan)?.setValue(true);
        }
      });
    }

    // Patch các checkbox suspiciousSigns
    if (payload.loai_bao_cao?.dau_hieu_dang_ngo) {
      payload.loai_bao_cao.dau_hieu_dang_ngo.forEach((item: any) => {
        if (this.addStep4Form.get(item.ma_dau_hieu)) {
          this.addStep4Form.get(item.ma_dau_hieu)?.setValue(true);
          if (item.ma_dau_hieu === 'khac') {
            this.addStep4Form.get('noi_dung_khac_dang_ngo')?.setValue(item.noi_dung_khac_dang_ngo);
          }
        }
      });
    }

    // Patch các checkbox finalConclusion
    if (payload.ket_luan) {
      payload.ket_luan.forEach((item: any) => {
        if (this.addStep4Form.get(item.ma_toi_pham)) {
          this.addStep4Form.get(item.ma_toi_pham)?.setValue(true);
          if (item.ma_toi_pham === '401') {
            this.addStep4Form.get('noi_dung_khac_toi_pham_dang_ngo')?.setValue(item.noi_dung_khac_toi_pham_dang_ngo);
          }
        }
      });
    }

    // Patch dữ liệu cho so_tien_giao_dich (FormArray)
    const soTienGiaoDichArray = this.addStep4Form.get('so_tien_giao_dich') as FormArray;
    soTienGiaoDichArray.clear();
    if (payload.thong_tin_giao_dich?.so_tien_giao_dich && payload.thong_tin_giao_dich.so_tien_giao_dich.length > 0) {
      payload.thong_tin_giao_dich.so_tien_giao_dich.forEach((item: any) => {
        soTienGiaoDichArray.push(this.fb.group({
          loai_tien: [item.loai_tien || 'VND'],
          so_tien: [item.so_tien || '']
        }));
      });
    } else {
      soTienGiaoDichArray.push(this.newTransactionMoney());
    }

    // Disable form nếu readOnly là true
    if (this.readOnly) {
      this.addStep4Form.disable({ emitEvent: false });
    }
  }

  // CODE FOR PERSON (3.1)
  createPerson() {
    const modalRef = this.modalService.open(AddPersonComponent, {
      fullscreen: true,
      backdrop: 'static',
      windowClass: 'custom-modal-fullscreen'

    });

    // Lấy danh sách cá nhân
    const caNhanList = this.strReport.payload.Phan_2.ca_nhan_thuc_hien_giao_dich || [];

    // Lấy danh sách tổ chức và ánh xạ thành cấu trúc tương tự caNhanList
    const toChucList = (this.strReport.payload.Phan_2.to_chuc_thuc_hien_giao_dich || []).map((toChuc: any) => ({
      id: toChuc.id, // Giữ nguyên id
      ho_ten: toChuc.ten_to_chuc || '', // Ánh xạ ten_to_chuc thành ho_ten
      so_dien_thoai: toChuc.so_dien_thoai || '', // Giữ nguyên so_dien_thoai (nếu có)
      thong_tin_dinh_danh: [
        {
          so_dinh_danh: toChuc.ma_so_doanh_nghiep?.ma_so || '' // Ánh xạ ma_so_doanh_nghiep.ma_so thành so_dinh_danh
        }
      ]
    }));

    // Gộp danh sách cá nhân và tổ chức
    const combinedList = [...caNhanList, ...toChucList];

    // Truyền danh sách gộp vào AddPersonComponent
    modalRef.componentInstance.personList = combinedList;

    modalRef.result.then((newPerson: Person) => {
      if (newPerson) {
        this.personService.addPerson(newPerson);
        const currentPersons = this.personService.getPersons();
        this.displayPerson$.next(currentPersons);
      }
    }).catch(() => { });
  }

  editPerson(person: Person) {
    const modalRef = this.modalService.open(EditPersonComponent, { fullscreen: true, backdrop: 'static' });
    modalRef.componentInstance.readOnly = this.readOnly;

    // Lấy danh sách cá nhân
    const caNhanList = this.strReport.payload.Phan_2.ca_nhan_thuc_hien_giao_dich || [];

    // Lấy danh sách tổ chức và ánh xạ thành cấu trúc tương tự caNhanList
    const toChucList = (this.strReport.payload.Phan_2.to_chuc_thuc_hien_giao_dich || []).map((toChuc: any) => ({
      id: toChuc.id, // Giữ nguyên id
      ho_ten: toChuc.ten_to_chuc || '', // Ánh xạ ten_to_chuc thành ho_ten
      so_dien_thoai: toChuc.so_dien_thoai || '', // Giữ nguyên so_dien_thoai (nếu có)
      thong_tin_dinh_danh: [
        {
          so_dinh_danh: toChuc.ma_so_doanh_nghiep?.ma_so || '' // Ánh xạ ma_so_doanh_nghiep.ma_so thành so_dinh_danh
        }
      ]
    }));

    // Gộp danh sách cá nhân và tổ chức
    const combinedList = [...caNhanList, ...toChucList];

    modalRef.componentInstance.personList = combinedList;
    modalRef.componentInstance.personToEdit = person;

    modalRef.result.then((updatedPerson: Person) => {
      if (updatedPerson) {
        this.personService.updatePerson(updatedPerson);
        // Cập nhật displayPerson$ thủ công để đảm bảo
        const currentPersons = this.personService.getPersons();
        this.displayPerson$.next(currentPersons);
      }
    }).catch(() => { });
  }

  // Số tiền giao dịch trong mục thông tin giao dịch
  newTransactionMoney(): FormGroup {
    return this.fb.group({
      loai_tien: ['VND'],
      so_tien: ['']
    });
  }

  get tractionMoneys(): FormArray {
    return this.addStep4Form.get('so_tien_giao_dich') as FormArray;
  }

  deleteTransactionMoney(index: number) {
    if (confirm('Bạn có chắc chắn muốn xóa số tiền giao dịch này?')) {
      this.tractionMoneys.removeAt(index);
    }
  }

  addRowTransactionMoney() {
    this.tractionMoneys.push(this.newTransactionMoney());
    if (this.addStep4Form.get('thuc_hien_giao_dich')?.value === '1') {
      const newControl = this.tractionMoneys.controls[this.tractionMoneys.length - 1];
      newControl.get('loai_tien')?.setValidators([Validators.required]);
      newControl.get('so_tien')?.setValidators([Validators.required]);
    }
  }

  updateCurrentInputData() {
    if (!this.strReport?.id) {
      this.strReport = { id: null, payload: { Phan_1: {}, Phan_2: {}, Phan_3: {}, Phan_4: {}, Phan_5: {}, Phan_6: {} } };
    }

    if (!this.isValueOtherOneChecked()) {
      this.addStep4Form.patchValue({ noi_dung_khac_dang_ngo: null });
    }
    if (!this.isValueOtherTwoChecked()) {
      this.addStep4Form.patchValue({ noi_dung_khac_toi_pham_dang_ngo: null });
    }
    // Lấy danh sách các checkbox đã được chọn report type
    const selectedReportType = this.reportTypes
      .filter(condition => this.addStep4Form.value[condition.key])
      .map(condition => ({
        ma_dieu_khoan: condition.key,
        mo_ta: condition.value
      }));

    // Lấy danh sách các checkbox đã được chọn suspiciousSigns
    const selectedSuspiciousSigns = this.suspiciousSigns
      .filter(condition => this.addStep4Form.value[condition.key])
      .map(condition => ({
        ma_dau_hieu: condition.key,
        mo_ta: condition.value,
        ...(condition.key === 'khac' ? { noi_dung_khac_dang_ngo: this.addStep4Form.get('noi_dung_khac_dang_ngo')?.value } : {})
      }));

    // Lấy danh sách các checkbox đã được chọn final conclusion
    const selectedFinalConclusion = this.finalConclusion
      .filter(condition => this.addStep4Form.value[condition.key])
      .map(condition => ({
        ma_toi_pham: condition.key,
        mo_ta: condition.value,
        ...(condition.key === '401' ? { noi_dung_khac_toi_pham_dang_ngo: this.addStep4Form.get('noi_dung_khac_toi_pham_dang_ngo')?.value } : {})
      }));

    const rawValueTongSoTien = this.addStep4Form.get('tong_so_tien_giao_dich')?.value.replace(/\./g, '');

    // Cập nhật phần Phan_4
    this.strReport.payload.Phan_4 = {
      loai_bao_cao: {
        dieu_khoan_bao_cao: selectedReportType,
        dau_hieu_dang_ngo: selectedSuspiciousSigns
      },
      thong_tin_giao_dich: {
        hien_trang_giao_dich: this.addStep4Form.value['thuc_hien_giao_dich'],
        thoi_gian_giao_dich: {
          tu_ngay: Common.convertNgbDateToDate(this.addStep4Form.value['tu_ngay']),
          den_ngay: Common.convertNgbDateToDate(this.addStep4Form.value['den_ngay'])
        },
        so_tien_giao_dich: this.addStep4Form.value['so_tien_giao_dich'],
        tong_tien_giao_dich_quy_doi: parseInt(rawValueTongSoTien, 10),
      },
      phan_tich: {
        dong_tien: this.personService.getPersons(),
        co_so_phap_ly: {
          diem_a: {
            so_thong_bao: this.addStep4Form.value['so_thong_bao'],
            co_so_nghi_ngo: this.addStep4Form.value['co_so_nghi_ngo']
          },
          diem_b: {
            co_so_nghi_ngo: this.addStep4Form.value['diem_b_co_so_nghi_ngo']
          }
        }
      },
      ket_luan: selectedFinalConclusion,
      ngay_phat_hien: Common.convertNgbDateToDate(this.addStep4Form.value['ngay_phat_hien'])
    };
    this.strReport.ngay_phat_hien = Common.convertNgbDateToDate(this.addStep4Form.value['ngay_phat_hien']);
    this.strReport.ket_luan = selectedFinalConclusion;
    this.strReport.dieu_khoan_bao_cao = selectedReportType;
    this.strReport.dau_hieu_dang_ngo = selectedSuspiciousSigns;

    return this.strReport;
  }


  addStep4Submit() {
    if (this.addStep4Form.invalid) {
      this.addStep4Form.markAllAsTouched();
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    const form = this.addStep4Form;

    if (!this.personService.validateAtLeastOneReportType(form, this.reportTypes)) {
      alert("Phải chọn ít nhất 1 loại báo cáo giao dịch đáng ngờ (1.1).");
      return;
    }

    if (!this.personService.validateSuspiciousSignsIfNeeded(form, this.suspiciousSigns)) {
      alert("Nếu chọn điểm b khoản 1 Điều 26, bạn phải chọn ít nhất một 'Dấu hiệu đáng ngờ' (1.2).");
      return;
    }

    const persons = this.personService.getPersons();
    if (!this.personService.validateTransactionExecution(form, persons)) {
      alert("Bạn phải thêm mô tả dòng tiền (3.a) khi đã chọn thực hiện giao dịch (2.1).");
      return;
    }

    if (!this.personService.validatePointADetails(form)) {
      alert("Khi chọn điểm a khoản 1 Điều 26, vui lòng nhập đầy đủ thông tin 'Số thông báo' và 'Cơ sở nghi ngờ' tại (3.b)");
      return;
    }

    if (!this.personService.validatePointBDetails(form)) {
      alert("Khi chọn điểm b khoản 1 Điều 26, vui lòng nhập đầy đủ thông tin 'Cơ sở nghi ngờ' tại (3.c)");
      return;
    }

    if (!this.personService.validateFinalConclusion(form, this.finalConclusion)) {
      alert("Vui lòng chọn nhận định về loại tội phạm có thể liên quan đến giao dịch đáng ngờ (4).");
      return;
    }

    if (confirm('Bạn có chắc chắn muốn thêm thông tin về giao dịch đáng ngờ này?')) {
      this.updateCurrentInputData();
      this.savePartSubmited.emit(this.strReport);
    }
  }

  isValueOtherOneChecked(): boolean {
    const condition = this.addStep4Form.get('khac')?.value;
    return condition && condition
  }
  isValueOtherTwoChecked(): boolean {
    const condition = this.addStep4Form.get('401')?.value;
    return condition && condition
  }

  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  formatCurrencyInput(event: any): void {
    let input = event.target.value;

    // Loại bỏ toàn bộ ký tự không phải số
    input = input.replace(/[^\d]/g, '');

    if (input === '') {
      this.addStep4Form.get('tong_so_tien_giao_dich')?.setValue('', { emitEvent: false });
      return;
    }

    // Format theo nhóm 3 số với dấu `.`
    const formatted = input.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Cập nhật lại input
    this.addStep4Form.get('tong_so_tien_giao_dich')?.setValue(formatted, { emitEvent: false });
  }

  private formatCurrency(value: number | string): string {
    if (!value) return '';

    // Đảm bảo là string, loại bỏ ký tự không phải số nếu có
    const cleaned = value.toString().replace(/[^\d]/g, '');

    // Format lại thành chuỗi có dấu chấm ngăn cách
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addStep4Form.reset();
    }
  }
}
