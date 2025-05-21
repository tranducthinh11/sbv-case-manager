import { Component, Input, OnInit } from '@angular/core';
import { STRConstant } from 'src/app/common/str-case.constant';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorizedPersonInformation} from "../../models/information-authorized-person";
import {EditAuthorizedPersonComponent} from "../edit-authorized-person/edit-authorized-person.component";
import {FormBuilder, FormGroup} from "@angular/forms";


@Component({
  selector: 'app-view-authorized-persons',
  templateUrl: './view-authorized-persons.component.html',
  styleUrl: './view-authorized-persons.component.scss'
})
export class ViewAuthorizedPersonsComponent implements OnInit {
  @Input() authorizedPersons: any[] = [];
  @Input() readOnly: boolean = false;
  viewAuthorizedPerson!: FormGroup

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    console.log("Initial data:", this.authorizedPersons);
    this.viewAuthorizedPerson = this.fb.group({

    })
  }

  getLoaiDinhDanhText(code: string): string {
    const mapping = STRConstant.identity_mapping;
    return mapping[code] || "Không xác định";
  }

  openEditModal(auth: AuthorizedPersonInformation, index: number) {
    const modalRef = this.modalService.open(EditAuthorizedPersonComponent, { size: 'xl', backdrop: 'static' });
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

  closeModal() {
    this.activeModal.close();
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.viewAuthorizedPerson.reset();
    }
  }
}
