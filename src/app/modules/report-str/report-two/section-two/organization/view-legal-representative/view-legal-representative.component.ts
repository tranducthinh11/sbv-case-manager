import { Component, Input } from '@angular/core';
import { LegalRepresentative } from "../../models/legal-representative";
import { STRConstant } from 'src/app/common/str-case.constant';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EditLegalRepresentativeComponent} from "../edit-legal-representative/edit-legal-representative.component";
import {FormBuilder, FormGroup} from "@angular/forms";
import {OrganizationService} from "../../services/organization.service";


@Component({
  selector: 'app-view-legal-representative',
  templateUrl: './view-legal-representative.component.html',
  styleUrl: './view-legal-representative.component.scss'
})
export class ViewLegalRepresentativeComponent {
  @Input() legalRepresentatives: LegalRepresentative[] = [];
  @Input() organizationId: number;
  @Input() readOnly: boolean = false;
  viewLegalRepresentative!: FormGroup

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private organizationService: OrganizationService,
  ) { }

  ngOnInit(): void {
    console.log("Initial data view legal representative:", this.legalRepresentatives);
    // Khởi tạo form rỗng để tránh lỗi khi Angular xử lý [formGroup]
    this.viewLegalRepresentative = this.fb.group({

    })
  }

  openEditModal(rep: LegalRepresentative) {
    const modalRef = this.modalService.open(EditLegalRepresentativeComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.legalRepresentative = rep;

    modalRef.result.then((updatedRep: LegalRepresentative) => {
      if (updatedRep) {
        // Tìm index phần tử cũ
        const index = this.legalRepresentatives.findIndex(r => r.id === updatedRep.id);
        if (index !== -1) {
          this.legalRepresentatives[index] = updatedRep;
        }
      }
    }).catch(err => {
      // Modal bị dismiss thì không làm gì
    });
  }

  getLoaiDinhDanhText(code: string): string {
    const mapping = STRConstant.identity_mapping;
    return mapping[code] || "Không xác định";
  }

  getNgheNghiep(code: string): string {
    const mapping = STRConstant.mapping_job;
    return mapping[code] || "Không xác định";
  }

  submitViewLegalRepresentative() {
    if (confirm('Bạn có chắc chắn muốn thay đổi thông tin về người đại diện?')) {
      if (this.viewLegalRepresentative.valid) {

        if (!this.organizationService.editLegalRepresentative(this.organizationId, this.legalRepresentatives)) {
        } else {
          this.viewLegalRepresentative.reset();
        }

        this.activeModal.close(this.legalRepresentatives);

      } else {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      }
    }

  }

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.viewLegalRepresentative.reset();
    }
  }
}
