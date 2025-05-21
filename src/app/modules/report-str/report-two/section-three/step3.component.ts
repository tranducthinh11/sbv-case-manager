import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PersonService } from './services/person.service';
import { Person } from './models/person';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddPersonComponent } from './person/add-person/add-person.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { EditPersonComponent } from './person/edit-person/edit-person.component';
import { AddOrganizationComponent } from './organization/add-organization/add-organization.component';
import { OrganizationService } from './services/organization.service';
import { Organization } from './models/organization';
import { EditOrganizationComponent } from './organization/edit-organization/edit-organization.component';
import { STRModelService } from '../section-two/services/str-model.service';
import { ActivatedRoute } from '@angular/router';
import { Common } from 'src/app/modules/report-str/report-two/service-common/common';
import { AddOrEditPersonComponent } from './person/add-or-edit-person/add-or-edit-person.component';
import { AddOrEditOrganizationComponent } from './organization/add-or-edit-organization/add-or-edit-organization.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss']
})

export class Step3Component implements OnInit, OnDestroy {
  @Input() strReport: any;
  @Output() savePartSubmited: EventEmitter<any> = new EventEmitter();
  @Input() readOnly: boolean = false;

  addStep3Form: FormGroup;
  displayPerson$ = new BehaviorSubject<Person[]>([]);
  displayOrganizations$ = new BehaviorSubject<Organization[]>([]);

  private unsubscribe: Subscription[] = [];
  reportId: string | null = null; // Lưu ID lấy từ URL

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private modalService: NgbModal,
    private organizationService: OrganizationService,
    private strModelService: STRModelService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Load danh sách cá nhân và tổ chức thực hiện giao dịch
    this.initForm();

    // Lấy danh sách cá nhân từ person service
    this.personService.personList$.subscribe(persons => {
      this.displayPerson$.next(persons || []);
    });

    // Lấy danh sách tổ chức từ organization service
    this.organizationService.organizationList$.subscribe(organizations => {
      this.displayOrganizations$.next(organizations || []);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.strReport.payload.Phan_3);

    if (this.strReport) {
      this.personService.setPerson(this.strReport.payload.Phan_3.ca_nhan_lien_quan || []);
      this.organizationService.setOrganization(this.strReport.payload.Phan_3.to_chuc_lien_quan || []);
      if (this.addStep3Form === undefined) {
        this.initForm();
      }
      this.addStep3Form.patchValue(this.strReport.payload.Phan_3);
    }
  }

  initForm() {
    this.addStep3Form = this.fb.group({
      persons: this.fb.array(this.personService.getPersons().map(person => this.createPersonFormGroup(person))),
      organizations: this.fb.array(this.organizationService.getOrganizations().map(org => this.createOrganizationFormGroup(org))),
      thong_tin_khac_bo_sung: ['']
    });

    if(this.strReport){
      this.addStep3Form.patchValue(this.strReport.payload.Phan_3);
    }

    if (this.readOnly == true) {
      this.addStep3Form?.disable({ emitEvent: false });
    }
  }

  getGenderLabel(genderCode: string): string {
    return Common.getGenderLabel(genderCode); // giả sử bạn có định nghĩa hàm này trong AgeUtil
  }

  formatDate(dateStr: string): string {
    return Common.formatDate(dateStr);
  }

  private createPersonFormGroup(person: Person): FormGroup {
    return this.fb.group({
      id: [person.id],
      ho_ten: [person.ho_ten],
      ngay_sinh: [person.ngay_sinh],
      gioi_tinh: [person.gioi_tinh],
      so_dien_thoai: [person.so_dien_thoai],
      thong_tin_dinh_danh: [person.thong_tin_dinh_danh]
    });
  }

  private createOrganizationFormGroup(org: Organization): FormGroup {
    return this.fb.group({
      id: [org.id],
      ten_to_chuc: [org.ten_to_chuc],
      ten_viet_tat: [org.ten_viet_tat],
      nganh_nghe_kinh_doanh: [org.nganh_nghe_kinh_doanh],
      so_dien_thoai: [org.so_dien_thoai]
    });
  }


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  // createPerson() {
  //   const modalRef = this.modalService.open(AddPersonComponent, { size: 'xl', backdrop: 'static' });

  //   modalRef.result.then((newPerson: Person) => {
  //     if (newPerson) {
  //       this.personService.addPerson(newPerson);
  //     }
  //   }).catch(() => { });
  // }

  // editPerson(person: Person) {
  //   const modalRef = this.modalService.open(EditPersonComponent, { size: 'xl', backdrop: 'static' });
  //   modalRef.componentInstance.person = person;
  //   modalRef.componentInstance.readOnly = this.readOnly;

  //   modalRef.result.then((updatedPerson: Person) => {
  //     if (updatedPerson) {
  //       this.personService.updatePerson(updatedPerson);
  //     }
  //   }).catch(() => { });
  // }

  addOrEditPerson(person?: Person) {
    const modalRef = this.modalService.open(AddOrEditPersonComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.person = person;
    modalRef.componentInstance.readOnly = this.readOnly;

    modalRef.result.then((person: Person) => {
      if (person) {
        this.personService.addOrUpdatePerson(person);
      }
    }).catch(() => { });
  }

  deletePerson(id: number | undefined) {
    if (confirm('Bạn có chắc chắn muốn xóa cá nhân này?')) {
      this.personService.deletePerson(id);
    }

    // Swal.fire({
    //   title: `Bạn có chắc chắn muốn xóa cá nhân này?`,
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Đồng ý',
    //   cancelButtonText: 'Huỷ'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.personService.deletePerson(id);
    //   } 
    // });
  }

  downloadTemplatePerson() {
    const anchor = document.createElement('a');
    anchor.href = 'assets/template_file.xlsx';
    anchor.download = 'File_Template.xlsx';
    anchor.click();
  }

  // createOrganization() {
  //   const modalRef = this.modalService.open(AddOrganizationComponent, { size: 'xl', backdrop: 'static' });

  //   modalRef.result.then((newOrganization: Organization) => {
  //     if (newOrganization) {
  //       this.organizationService.addOrganization(newOrganization); // Lưu vào BehaviorSubject thay vì LocalStorage
  //     }
  //   }).catch(() => { });
  // }

  // editOrganization(organization: Organization) {
  //   const modalRef = this.modalService.open(EditOrganizationComponent, { size: 'xl', backdrop: 'static' });
  //   modalRef.componentInstance.organization = organization;
  //   modalRef.componentInstance.readOnly = this.readOnly;

  //   modalRef.result.then((updatedOrganization: Organization) => {
  //     if (updatedOrganization) {
  //       this.organizationService.updateOrganization(updatedOrganization);
  //     }
  //   }).catch(() => { });
  // }

  addOrEditOrganization(organization?: Organization) {
    const modalRef = this.modalService.open(AddOrEditOrganizationComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.organization = organization;
    modalRef.componentInstance.readOnly = this.readOnly;

    modalRef.result.then((organization: Organization) => {
      if (organization) {
        this.organizationService.addOrUpdateOrganization(organization);
      }
    }).catch(() => { });
  }

  deleteOrganization(id: number | undefined) {
    if (confirm('Bạn có chắc chắn muốn xóa tổ chức này?')) {
      this.organizationService.deleteOrganization(id);
    }

    // Swal.fire({
    //   title: `Bạn có chắc chắn muốn xóa tổ chức này?`,
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Đồng ý',
    //   cancelButtonText: 'Huỷ'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.organizationService.deleteOrganization(id);
    //   } 
    // });
  }


  updateCurrentInputData() {
    if (!this.strReport?.id) {
      this.strReport = { id: null, payload: { Phan_1: {}, Phan_2: {}, Phan_3: {}, Phan_4: {}, Phan_5: {}, Phan_6: {} } }
    }

    // Lấy danh sách cá nhân và tổ chức liên quan đến giao dịch
    let persons = this.personService.getPersons();
    let organizations = this.organizationService.getOrganizations();

    // Lấy dữ liệu từ form
    this.strReport.payload.Phan_3 = {
      ca_nhan_lien_quan: persons,
      to_chuc_lien_quan: organizations,
      thong_tin_khac_bo_sung: this.addStep3Form.get('thong_tin_khac_bo_sung')?.value
    };

    return this.strReport;
  }

  addStep3Submit() {
    const isSubmit = confirm('Bạn có chắc chắn muốn lưu cá nhân/tổ chức liên quan đến giao dịch này?');
    if (isSubmit) {
      const updatedData = this.updateCurrentInputData();
      this.savePartSubmited.emit(updatedData);
      // Cập nhật lại BehaviorSubject sau khi submit
      this.personService.setPerson(updatedData.payload.Phan_3.ca_nhan_lien_quan || []);
      this.organizationService.setOrganization(updatedData.payload.Phan_3.to_chuc_lien_quan || []);
    }

    // Swal.fire({
    //   title: `Bạn có chắc chắn muốn lưu cá nhân/tổ chức liên quan đến giao dịch này?`,
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Đồng ý',
    //   cancelButtonText: 'Huỷ'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     const updatedData = this.updateCurrentInputData();
    //     this.savePartSubmited.emit(updatedData);
    //     // Cập nhật lại BehaviorSubject sau khi submit
    //     this.personService.setPerson(updatedData.payload.Phan_3.ca_nhan_lien_quan || []);
    //     this.organizationService.setOrganization(updatedData.payload.Phan_3.to_chuc_lien_quan || []);
    //   } 
    // });
  }

  getIdentificationNumbers(person: any): string {
    return person.thong_tin_dinh_danh?.map(info => info.so_dinh_danh).join('; ') || '';
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addStep3Form.reset();
    }
  }
}
