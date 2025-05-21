import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, finalize } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttachmentComponent } from './add-attachment/attachment.component';
import { Attachment } from './models/Attachment';
import { AttachmentService } from './services/attachment.service';
import { STRModelService } from './services/str-model.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { STRCategoryService } from '../service-common/str-category.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-step6',
  templateUrl: './step6.component.html',
  styleUrl: './step6.component.scss'
})
export class Step6Component implements OnInit, OnDestroy {
  addStep6Form: FormGroup;
  attachmentTypes: any = [];
  maxFileCount: number;

  @Input() readOnly: boolean = false;
  @Input() strReport: any;
  @Output() savePartSubmited: EventEmitter<any> = new EventEmitter();

  displayDocument$ = new BehaviorSubject<Attachment[]>([]);

  constructor(
    private fb: FormBuilder,
    private attachmentService: AttachmentService,
    private strModelService: STRModelService,
    private modalService: NgbModal,
    private toarService: ToastrService,
    private strCategoryService: STRCategoryService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.maxFileCount = environment.maxFileCount;

    // Subscribe vào danh sách từ AttachmentService
    this.attachmentService.documentList$.subscribe(
      (documents) => {
        this.displayDocument$.next(documents);
      }
    );    

    this.strCategoryService.getCategory({ type: 9, report_type: 'M1' }).subscribe(data => {
      this.attachmentTypes = data;
    });

    if(this.strReport.id)
      this.getData();
  }

  initForm() {
    this.addStep6Form = this.fb.group({
      documents: this.fb.array([])
    });
  }

  ngOnDestroy() {
    this.attachmentService.remove();
  }

  get getAttachments(): Attachment[] {
    return this.displayDocument$.value.filter(doc => doc.status == 'ACTIVE');
  }

  getAttachmentTypeName(info): string {
    return this.attachmentTypes?.find(x => x?.value == info)?.name;
  }

  updateCurrentInputData() {
    if (!this.strReport?.id) {
      this.strReport = { id: null, payload: { Phan_1: {}, Phan_2: {}, Phan_3: {}, Phan_4: {}, Phan_5: {}, Phan_6: {} } }
    }

    if(this.strReport.id && this.displayDocument$.value.length == 0)
      this.getData();

    return this.strReport;
  }

  downloadFile() {
    const link = document.createElement('a');
    link.href = 'assets/template_sao_ke.xlsx';
    link.download = 'template_sao_ke.xlsx';
    link.click();
  }

  addAttachment() {
    if(this.getAttachments.length >= this.maxFileCount) {
      this.toarService.warning(`Tối đa ${this.maxFileCount} file đính kèm`, "Cảnh báo");
      return;
    }
    const modalRef = this.modalService.open(AttachmentComponent, { size: 'xl', backdrop: 'static' });
    modalRef.result.then((newAttachment: Attachment) => {
      if (newAttachment) {
        this.attachmentService.add(newAttachment);
      }
    }).catch(() => { });
  }

  deleteAttachment(attachment, index) {
    if (confirm(`Bạn có chắc chắn muốn xóa file ${attachment.fileName}?`)) {
      this.attachmentService.delete(attachment.id, index);
    }

    // Swal.fire({
    //   title: `Bạn có chắc chắn muốn xóa file ${attachment.fileName}?`,
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Đồng ý',
    //   cancelButtonText: 'Huỷ'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.attachmentService.delete(attachment.id, index);
    //   } 
    // });
  }

  clearAttachment() {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.attachmentService.clear();
    }
  }

  downloadAttachment(at: Attachment) {
    this.strModelService.downloadFile(at.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = at.fileName; // Đặt tên file tải về
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, error => {
      this.toarService.error(error, 'Lỗi khi tải file');
    });
  }

  getData() {
    this.attachmentService.remove(); // Xóa danh sách cũ trước khi thêm mới
    this.strModelService.getPart6(this.strReport.id).subscribe(
      (res) => {
        res.forEach(doc => this.attachmentService.add(doc)); // Thêm từng document vào service
      },
      (error) => {
        this.toarService.error("Không lấy được tài liệu đính kèm: " + error.statusText);
      }
    );
  }

  addStep6Submit() {
    let attachments = this.displayDocument$.value.filter(doc => !doc.id  || doc.status === 'delete');
    if(attachments.length == 0) {
      this.toarService.warning("Không có thay đổi để cập nhật", "Cảnh báo");
      return;
    }
    // Đối với STR đã tick chọn giao dịch đã thực hiện thì : (i) Hồ sơ mở tài khoản, (ii) sao kê tài khoản, (iii) minh họa dòng tiền là bắt buộc
    if(this.strReport?.payload?.Phan_4?.thong_tin_giao_dich?.hien_trang_giao_dich == '1') {
      const hasAllTypes = ['STM', 'FLW', 'ACC'].every(type =>
        this.displayDocument$.value.filter(doc => doc.status != 'delete').some(item => item.attachmentType == type)
      );
      if(!hasAllTypes) {
        this.toarService.warning("Đối với STR thuộc loại giao dịch đã thực hiện thì: (i) Hồ sơ mở tài khoản, (ii) sao kê tài khoản, (iii) minh họa dòng tiền là bắt buộc", "Cảnh báo");
        return;
      }
    }

    const isSubmit = confirm('Bạn có chắc chắn muốn lưu tài liệu đính kèm này?');
    if (isSubmit) {
      if (!this.strReport?.id) {
        this.strModelService.saveSTRModel(this.strReport).subscribe(
          (res) => {  
            if (res.id) {
              this.strReport = res;
              this.toarService.success("STR vừa tạo có mã nội bộ: " + res.str_internal_number, "Lưu thành công")
            }
          },
          (error) => {
            console.error('Lỗi khi lưu:', error);
            this.toarService.error("STR vừa tạo bị lỗi, vui lòng kiểm tra lại đầy đủ thông tin");
          }
        );  
      }

      if(!this.strReport?.id)
        return;

      attachments.forEach(element => {
        element.strId = this.strReport?.id
        element.status = element.status.toUpperCase();
      });
      attachments.sort((a, b) => a.status.localeCompare(b.status));
  
      Swal.fire({
        title: 'Đang xử lý...',
        allowOutsideClick: false, 
        didOpen: () => {
          Swal.showLoading();
        }
      });
      this.strModelService.savePart6(attachments)
      .pipe(
        finalize(() => {
          Swal.close();
        })
      )
      .subscribe(
        (res) => {
          console.log('Lưu thành công:', res);
          this.getData();
          this.toarService.success("Cập nhật thành công")
        },
        (error) => {
          console.error('Lỗi khi lưu:', error);
          this.toarService.error("STR vừa cập nhật bị lỗi");
        }
      );
    }

    // Swal.fire({
    //   title: 'Bạn có chắc chắn muốn lưu tài liệu đính kèm này?',
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Đồng ý',
    //   cancelButtonText: 'Huỷ'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     if (!this.strReport?.id) {
    //       this.strModelService.saveSTRModel(this.strReport).subscribe(
    //         (res) => {  
    //           if (res.id) {
    //             this.strReport = res;
    //             this.toarService.success("STR vừa tạo có mã nội bộ: " + res.str_internal_number, "Lưu thành công")
    //           }
    //         },
    //         (error) => {
    //           console.error('Lỗi khi lưu:', error);
    //           this.toarService.error("STR vừa tạo bị lỗi, vui lòng kiểm tra lại đầy đủ thông tin");
    //         }
    //       );  
    //     }
  
    //     if(!this.strReport?.id)
    //       return;

    //     attachments.forEach(element => {
    //       element.strId = this.strReport?.id
    //       element.status = element.status.toUpperCase();
    //     });
    //     attachments.sort((a, b) => a.status.localeCompare(b.status));
    
    //     Swal.fire({
    //       title: 'Đang xử lý...',
    //       allowOutsideClick: false, 
    //       didOpen: () => {
    //         Swal.showLoading();
    //       }
    //     });
    //     this.strModelService.savePart6(attachments)
    //     .pipe(
    //       finalize(() => {
    //         Swal.close();
    //       })
    //     )
    //     .subscribe(
    //       (res) => {
    //         console.log('Lưu thành công:', res);
    //         this.getData();
    //         this.toarService.success("Cập nhật thành công")
    //       },
    //       (error) => {
    //         console.error('Lỗi khi lưu:', error);
    //         this.toarService.error("STR vừa cập nhật bị lỗi");
    //       }
    //     );
    //   } 
    // });

    // this.savePartSubmited.emit(this.strReport);
  }
}
