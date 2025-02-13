import { AfterViewInit, Input, Component, EventEmitter, OnDestroy, OnInit, TemplateRef, ViewChild, VERSION, NgModule } from '@angular/core';
import { Config } from 'datatables.net';
import { Observable } from 'rxjs';
import { NgForm, FormsModule } from '@angular/forms'; // Import FormsModule
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import moment from 'moment';
import { LayoutService } from 'src/app/_metronic/layout';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({

  selector: 'app-agency',
  standalone: true,
  imports: [FormsModule],//AddFormsModuletoimports
  templateUrl: './agency.component.html',
  styleUrls: ['./agency.component.scss']
})

export class AgencyComponent implements OnInit {
  @Input() initialData: any;
  agencyRelatedOrganization: any = {
    reportName: '',
    engName: '',
    shortName: '',
    addressDistrict: '',
    addressProvince: '',
    addressNation: '',
    licenseNumber: '',
    licenseCreateDate: '',
    licensePlace: '',
    taxNumber: '',
    taxCreateDate: '',
    taxPlace: '',
    phoneNumber: '',
    agencyBusiness: ''
  };

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() { 
    if (this.initialData) {
      this.agencyRelatedOrganization = { ...this.initialData }; // Copy giá trị nếu có initialData
    }
  }

  addRelatedOrganization(form: NgForm) {
    if (form.valid) {
      Object.assign(this.agencyRelatedOrganization, this.agencyRelatedOrganization);
      console.log("Object sau khi cập nhật:", this.agencyRelatedOrganization);
      this.activeModal.close(this.agencyRelatedOrganization);
    } else {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }
  }

}