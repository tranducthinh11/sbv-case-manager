import {Component, OnInit, Input} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {BankAccountNumber} from "../models/bank-account-number";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LegalRepresentative} from "../models/legal-representative";
import {OrganizationService} from "../services/organization.service";

@Component({
  selector: 'app-add-legal-representative',
  templateUrl: './add-legal-representative.component.html',
  styleUrl: './add-legal-representative.component.scss'
})
export class AddLegalRepresentativeComponent implements OnInit {
  @Input() organizationId: Number;
  addLegalRepresentative!: FormGroup
  isSubmit = false
  showAlert = false
  isExisting = false
  isSuccess = false
  bankAccountNumber: BankAccountNumber[] = [];

  constructor(private fb: FormBuilder,  public activeModal: NgbActiveModal, private organizationService: OrganizationService) {
  }

  ngOnInit(): void {
    this.addLegalRepresentative = this.fb.group({
      ho_ten: [''],
      ngay_sinh: [''],
      quoc_tich: [''],
      nghe_nghiep: [''],
      chuc_vu: [''],
      so_dien_thoai: ['']
    });
  }

  addLegalRepresentativeSubmit() {
    this.isSubmit = true;
    const isSubmit = confirm('Bạn có chắc chắn muốn thêm thông tin về người đại diện này?');

    if (isSubmit) {
      if (this.addLegalRepresentative.invalid) {
        return;
      }
      const data = this.addLegalRepresentative.value;
      const newLegalRepresentative = new LegalRepresentative(data);
      const id = new Date(Date.now()).getTime();
      newLegalRepresentative.id = id;

      if (!this.organizationService.addLegalRepresentative(this.organizationId, newLegalRepresentative)) {
        this.showAlert = true;
        this.isExisting = true;
        this.isSuccess = false;
      } else {
        this.showAlert = true;
        this.isExisting = false;
        this.isSuccess = true;
        this.isSubmit = false;
        this.addLegalRepresentative.reset();
        this.bankAccountNumber = [];
      }
      this.activeModal.close();
    }

  }
}
