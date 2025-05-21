import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { STRCategoryService } from 'src/app/modules/report-str/report-two/service-common/str-category.service';
import { Attachment } from '../models/Attachment';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from 'src/app/modules/list-str/services/utils.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrl: './attachment.component.scss'
})
export class AttachmentComponent implements OnInit {
  attachmentInfo!: FormGroup;
  attachmentTypes: any = [];
  maxFileSize: number;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private strCategoryService: STRCategoryService,
    private toarService: ToastrService
  ) { }

  ngOnInit(): void {
    this.strCategoryService.getCategory({ type: 9, report_type: 'M1' }).subscribe(data => {
      this.attachmentTypes = data;
    });
    
    this.maxFileSize = environment.maxFileSize;

    this.attachmentInfo = this.fb.group({
      attachmentType: ['STM', Validators.required],
      file: [],
      fileType: [],
      pageCount: ['', [
          Validators.required,
          Validators.min(1),
          this.integerValidator
        ]
      ],
      description: ['', Validators.required],
      status: 'ACTIVE',
      fileName: ['', Validators.required]
    });
  }

  integerValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value == null || value === '') return null; // để required validator xử lý
    if (!Number.isInteger(value)) {
      return { notInteger: true };
    }
    return null;
  }
  

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Lấy file đầu tiên
      if (file.size > this.maxFileSize * 1024 * 1024) { // 15 MB
        this.toarService.warning(`File vượt quá giới hạn ${this.maxFileSize}MB! Vui lòng chọn file nhỏ hơn`, "Cảnh báo");
        input.value = ''; // Xóa file đã chọn
        return;
      }

      const allowedMimeTypes = [
        'application/pdf', // PDF
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        this.toarService.warning("Chỉ cho phép file PDF hoặc Excel!", "Cảnh báo");
        input.value = ''; // Xóa file đã chọn
        return;
      }      

      this.attachmentInfo.patchValue({
        fileName: new UtilService().getlink(file.name),
        localPath: input.value,
        file: file
      });
    }
  }

  onAttachmentSubmit() {
    if (this.attachmentInfo.valid) {
      const data = this.attachmentInfo.value;
      const attachment = new Attachment(data);
      // Trả dữ liệu về Step6Component
      this.activeModal.close(attachment);
    } else {
      this.attachmentInfo.markAllAsTouched();
      this.toarService.warning("Vui lòng nhập đầy đủ thông tin bắt buộc", "Cảnh báo");
    }
  }
  
  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.attachmentInfo.reset();
    }
  }
}
