import { Component, Input, OnInit } from '@angular/core';
import { STRConstant } from "../../../../../../common/str-case.constant";
import { NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { EditAuthorizedOrganizationComponent} from "../edit-authorized-organization/edit-authorized-organization.component";
import { AuthorizedPersonInformation} from "../../models/information-authorized-person";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-view-authorized-organization',
  templateUrl: './view-authorized-organization.component.html',
  styleUrl: './view-authorized-organization.component.scss'
})
export class ViewAuthorizedOrganizationComponent implements OnInit {
  @Input() authorizedPersons: any[] = [];
  @Input() readOnly: boolean = false;

  viewAuthorizedPerson!: FormGroup

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    console.log("Initial data view authrized:", this.authorizedPersons);
    this.viewAuthorizedPerson = this.fb.group({

    })
  }

  getLoaiDinhDanhText(code: string): string {
    const mapping = STRConstant.identity_mapping;
    return mapping[code] || "Không xác định";
  }

  closeModal() {
    this.activeModal.close();
  }

  openEditModal(auth: AuthorizedPersonInformation, index: number) {
    const modalRef = this.modalService.open(EditAuthorizedOrganizationComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.authorizedPerson = auth;

    modalRef.result.then((authPerson: AuthorizedPersonInformation) => {
      if (authPerson) {
        // Gán lại phần tử tại vị trí index
        this.authorizedPersons[index] = authPerson;
      }
    }).catch(err => {
      // Modal bị dismiss thì không làm gì
    });
  }

  submitAuthorizedPerson() {
    if (confirm('Bạn có chắc chắn muốn thay đổi thông tin về người ủy quyền cho tài khoản này ?')) {
      if (this.viewAuthorizedPerson.valid) {
        this.activeModal.close(this.authorizedPersons);
      } else {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      }
    }

  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.viewAuthorizedPerson.reset();
    }
  }
}
