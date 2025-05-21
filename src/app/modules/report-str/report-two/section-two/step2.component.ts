import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, Observable, BehaviorSubject, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonService } from './services/person.service';
import { OrganizationService } from './services/organization.service';
import { Person } from './models/person';
import { Organization } from './models/organization';
import { AddPersonComponent } from './person/add-person/add-person.component';
import { EditPersonComponent } from './person/edit-person/edit-person.component';
import { AddOrganizationComponent } from './organization/add-organization/add-organization.component';
import { AddLegalRepresentativeComponent } from './organization/add-legal-representative/add-legal-representative.component';
import { EditOrganizationComponent } from "./organization/edit-organization/edit-organization.component";
import { LegalRepresentative } from "./models/legal-representative";
import { ViewLegalRepresentativeComponent } from './organization/view-legal-representative/view-legal-representative.component';
import { AddOtherOwnerComponent } from './other-owner/add-other-owner/add-other-owner.component';
import { EditOtherOwnerComponent } from './other-owner/edit-other-owner/edit-other-owner.component';
import { OtherOwner } from './models/other-owner';
import { OtherOwnerService } from './services/other-owner.service';
import { Common } from '../service-common/common';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrl: './step2.component.scss'
})
export class Step2Component implements OnInit, OnDestroy {
  @Input() strReport: any;
  @Output() savePartSubmited: EventEmitter<any> = new EventEmitter();
  @Input() readOnly: boolean = false;

  addStep2Form: FormGroup;
  displayPerson$ = new BehaviorSubject<Person[]>([]);
  displayOrganizations$ = new BehaviorSubject<Organization[]>([]);
  displayOtherOwner$ = new BehaviorSubject<OtherOwner[]>([]);

  // Variable for 2.3
  showOtherOwnerTable = false;
  isAllPersonSelected: boolean = false;
  isAllOrganizationSelected: boolean = false;
  isAllAuthorizedPersonSelected: boolean = false;

  displayPersonData$: any[] = [];
  selectedPersons: any[] = [];
  showTablePersonData = false;

  displayOrganizationData$: any[] = [];
  selectedOrganizations: any[] = [];
  showTableOrganizationData = false;

  displayAuthorizedPersonData$: any[] = [];
  selectedAuthorizedPersons: any[] = [];
  showTableAuthorizedPersonData = false;

  private unsubscribe: Subscription[] = [];

  reportId: string | null = null; // Lưu ID lấy từ URL

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private organizationService: OrganizationService,
    private modalService: NgbModal,
    private otherOwnerService: OtherOwnerService,
  ) {
  }

  ngOnInit() {
    console.log("step2");
    // Load danh sách cá nhân và tổ chức thực hiện giao dịch
    this.initForm();

    // Lấy danh sách cá nhân từ PersonService
    this.personService.personList$.subscribe(persons => {
      this.displayPerson$.next(persons);
    });

    // Lấy danh sách tổ chức từ OrganizationService
    this.organizationService.organizationList$.subscribe(organizations => {
      this.displayOrganizations$.next(organizations);
    });

    // Lấy danh sách chủ sở hữu khác từ OtherOwnerService
    this.otherOwnerService.otherOwnerList$.subscribe(owners => {
      this.displayOtherOwner$.next(owners);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['strReport'] && this.strReport) {
      this.patchAlllData();
    }
  }

  initForm() {
    this.addStep2Form = this.fb.group({
      persons: this.fb.array([]), // Danh sách cá nhân
      organizations: this.fb.array([]), // Danh sách tổ chức
      nhom_thong_tin_1: [false],
      nhom_thong_tin_2: [false],
      nhom_thong_tin_3: [false],
      other: [false],
      thong_tin_khac_bo_sung: [''],
    });

    if(this.strReport){
      this.patchAlllData();
    }

    if (this.readOnly == true) {
      this.addStep2Form?.disable({ emitEvent: false });
    }
  }

  private patchAlllData() {
    // Patch dữ liệu các service
    this.personService.setPersons(this.strReport.payload.Phan_2.ca_nhan_thuc_hien_giao_dich || []);
    this.organizationService.setOrganizations(this.strReport.payload.Phan_2.to_chuc_thuc_hien_giao_dich || []);
    this.otherOwnerService.setOtherOwner(this.strReport.payload.Phan_2.chu_so_huu_huong_loi?.chu_so_huu_khac || []);

    // Patch dữ liệu chủ sở hữu hưởng lợi
    if (this.addStep2Form !== undefined) {
      this.patchBeneficialOwnerData();
    }
  }

  private patchBeneficialOwnerData() {
    if (!this.strReport?.payload?.Phan_2?.chu_so_huu_huong_loi) return;

    const beneficialOwnerData = this.strReport.payload.Phan_2.chu_so_huu_huong_loi;
    const danhSachCaNhan = beneficialOwnerData.danh_sach_ca_nhan || {};

    // Patch các checkbox nhóm thông tin
    this.addStep2Form.patchValue({
      nhom_thong_tin_1: !!danhSachCaNhan.nhom_thong_tin_1?.length,
      nhom_thong_tin_2: !!danhSachCaNhan.nhom_thong_tin_2?.length,
      nhom_thong_tin_3: !!danhSachCaNhan.nhom_thong_tin_3?.length,
      other: !!beneficialOwnerData.chu_so_huu_khac?.length,
      thong_tin_khac_bo_sung: this.strReport.payload.Phan_2.thong_tin_khac_bo_sung || ''
    }, { emitEvent: false });

    // Xử lý dữ liệu cho từng nhóm
    this.processNhomThongTinData('nhom_thong_tin_1', danhSachCaNhan.nhom_thong_tin_1);
    this.processNhomThongTinData('nhom_thong_tin_2', danhSachCaNhan.nhom_thong_tin_2);
    this.processNhomThongTinData('nhom_thong_tin_3', danhSachCaNhan.nhom_thong_tin_3);

    // Xử lý thông tin khác
    if (beneficialOwnerData.chu_so_huu_khac?.length) {
      this.otherOwnerService.setOtherOwner(beneficialOwnerData.chu_so_huu_khac);
      this.showOtherOwnerTable = true;
    } else {
      this.otherOwnerService.clear();
      this.showOtherOwnerTable = false;
    }
  }

  private processNhomThongTinData(nhomThongTin: string, checkedData: any[]) {
    if (!checkedData) checkedData = [];

    // Xử lý cho từng nhóm độc lập
    if (nhomThongTin === 'nhom_thong_tin_1') {
      const allData = this.personService.getPersons().map(person => ({
        nhom_thong_tin: nhomThongTin,
        ho_ten: person.ho_ten,
        so_dinh_danh: person.thong_tin_dinh_danh[0]?.so_dinh_danh || ''
      }));

      this.displayPersonData$ = allData;
      this.showTablePersonData = true;
      this.selectedPersons = allData.filter(item =>
        checkedData.some(checkedItem =>
          checkedItem.so_dinh_danh === item.so_dinh_danh
        )
      );
    }
    else if (nhomThongTin === 'nhom_thong_tin_2') {
      const allOrganizations = this.organizationService.getOrganizations();

      this.displayOrganizationData$ = allOrganizations.flatMap(org =>
        org.nguoi_dai_dien?.map(representative => ({
          nhom_thong_tin: nhomThongTin,
          ho_ten: representative.ho_ten,
          so_dinh_danh: representative.thong_tin_dinh_danh[0]?.so_dinh_danh || '',
          orgId: org.id
        })) || []
      );

      this.showTableOrganizationData = true;
      this.selectedOrganizations = this.displayOrganizationData$.filter(item =>
        checkedData.some(checkedItem =>
          checkedItem.so_dinh_danh === item.so_dinh_danh
        )
      );
    }
    else if (nhomThongTin === 'nhom_thong_tin_3') {
      const allOrganizations = this.organizationService.getOrganizations();

      this.displayAuthorizedPersonData$ = allOrganizations.flatMap(org =>
        org.tai_khoan?.flatMap(tk =>
          tk.nguoi_duoc_uy_quyen?.map(person => ({
            nhom_thong_tin: nhomThongTin,
            ho_ten: person.ho_ten,
            so_dinh_danh: person.thong_tin_dinh_danh[0]?.so_dinh_danh || null,
            orgId: org.id,
            accountId: tk.id
          })) || []
        ) || []
      );

      this.showTableAuthorizedPersonData = true;
      this.selectedAuthorizedPersons = this.displayAuthorizedPersonData$.filter(item =>
        checkedData.some(checkedItem =>
          checkedItem.so_dinh_danh === item.so_dinh_danh
        )
      );
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  // CODE FOR PERSON (2.1)
  createPerson() {
    const modalRef = this.modalService.open(AddPersonComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.result.then((newPerson: Person) => {
      if (newPerson) {
        this.personService.addPerson(newPerson);
      }
    }).catch(() => { });
  }

  editPerson(person: Person) {
    const modalRef = this.modalService.open(EditPersonComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.person = person;
    modalRef.componentInstance.readOnly = this.readOnly;

    modalRef.result.then((updatedPerson: Person) => {
      if (updatedPerson) {
        this.personService.updatePerson(updatedPerson);
      }
    }).catch(() => { });
  }

  deletePerson(id: number | undefined) {
    if (confirm('Bạn có chắc chắn muốn xóa đối tượng báo cáo này?')) {
      this.personService.deletePerson(id);
    }
  }

  // CODE FOR IMPORT DATA BY EXCEL FILE
  importPersonFromCSV(event: any) {
    return this.personService.importPersonFromExcel(event);
  }


  downloadTemplatePerson() {
    const anchor = document.createElement('a');
    anchor.href = 'assets/ca_nhan_thuc_hien_giao_dich.xlsx';
    anchor.download = 'ca_nhan_thuc_hien_giao_dich.xlsx';
    anchor.click();
  }

  // CODE FOR ORGANIZATON (2.2)
  createOrganization(item?: any) {
    const modalRef = this.modalService.open(AddOrganizationComponent, { size: 'xl', backdrop: 'static' });

    modalRef.result.then((newOrganization: Organization) => {
      if (newOrganization) {
        this.organizationService.addOrganization(newOrganization); // Lưu vào BehaviorSubject thay vì LocalStorage
      }
    }).catch(() => { });
  }

  editOrganization(organization: Organization) {
    const modalRef = this.modalService.open(EditOrganizationComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.organization = organization;
    modalRef.componentInstance.readOnly = this.readOnly;

    modalRef.result.then((updatedOrganization: Organization) => {
      if (updatedOrganization) {
        this.organizationService.updateOrganization(updatedOrganization);
      }
    }).catch(() => { });
  }

  createLegalRepresentative(item?: number) {
    const modalRef = this.modalService.open(AddLegalRepresentativeComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.organizationId = item;
  }

  viewLegalRepresentative(item?: Organization) {
    const legalRepresentative = item.nguoi_dai_dien;

    if (!legalRepresentative || legalRepresentative.length === 0) {
      alert("Không có người đại diện nào cho tổ chức này !");
      return;
    }

    const modalRef = this.modalService.open(ViewLegalRepresentativeComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.legalRepresentatives = legalRepresentative;
    modalRef.componentInstance.organizationId = item.id;
    modalRef.componentInstance.readOnly = this.readOnly;
  }

  deleteOrganization(id: number | undefined) {
    if (confirm('Bạn có chắc chắn muốn xóa tổ chức báo cáo này?')) {
      this.organizationService.deleteOrganization(id);
    }
  }

  importOrganizationFromExcel(event: any) {
    return this.organizationService.importOrganizationFromExcel(event);
  }

  downloadTemplateOrganization() {
    const anchor = document.createElement('a');
    anchor.href = 'assets/to_chuc_thuc_hien_giao_dich.xlsx';
    anchor.download = 'to_chuc_thuc_hien_giao_dich.xlsx';
    anchor.click();
  }

  // CODE FOR LEGAL REPRESENTATIVE (2.3)
  toggleTable(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.showOtherOwnerTable = isChecked;

    if (!isChecked) {
      this.otherOwnerService.clear();
      this.addStep2Form.get('other')?.setValue(false, { emitEvent: false });
    } else {
      // Nếu có dữ liệu từ service thì hiển thị
      if (this.otherOwnerService.getOtherOwners().length > 0) {
        this.showOtherOwnerTable = true;
      }
    }
  }

  // Code for danh_sach_ca_nhan la person
  togglePersonData(event: Event, group: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.addStep2Form.get(group)?.setValue(isChecked, { emitEvent: false });

    if (isChecked) {
      this.processNhomThongTinData(group, []);
    } else {
      this.showTablePersonData = false;
      this.selectedPersons = [];
    }
  }

  isPersonSelected(person: any, group: string): boolean {
    if (group === 'nhom_thong_tin_1') {
      return this.selectedPersons.some(p => p.so_dinh_danh === person.so_dinh_danh);
    }
    return false;
  }

  togglePersonSelection(person: any, event: Event, group: string) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (group === 'nhom_thong_tin_1') {
      if (isChecked) {
        if (!this.selectedPersons.some(p => p.so_dinh_danh === person.so_dinh_danh)) {
          this.selectedPersons.push(person);
        }
      } else {
        this.selectedPersons = this.selectedPersons.filter(p => p.so_dinh_danh !== person.so_dinh_danh);
      }
    }
  }

  toggleAllPersons(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isAllPersonSelected = isChecked;

    if (isChecked) {
      // Chọn tất cả
      this.selectedPersons = [...this.displayPersonData$];
    } else {
      // Bỏ chọn tất cả
      this.selectedPersons = [];
    }
  }

  toggleOrganizationData(event: Event, group: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.addStep2Form.get(group)?.setValue(isChecked, { emitEvent: false });

    if (isChecked) {
      this.processNhomThongTinData(group, []);
    } else {
      this.showTableOrganizationData = false;
      this.selectedOrganizations = [];
    }
  }

  toggleOrganizationSelection(organization: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.selectedOrganizations.some(org =>
        org.so_dinh_danh === organization.so_dinh_danh
      )) {
        this.selectedOrganizations.push(organization);
      }
    } else {
      this.selectedOrganizations = this.selectedOrganizations.filter(org =>
        org.so_dinh_danh !== organization.so_dinh_danh
      );
    }

    this.isAllOrganizationSelected = this.selectedOrganizations.length === this.displayOrganizationData$.length;
  }

  toggleAllOrganizations(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isAllOrganizationSelected = isChecked;

    if (isChecked) {
      this.selectedOrganizations = [...this.displayOrganizationData$];
    } else {
      this.selectedOrganizations = [];
    }
  }

  isOrganizationSelected(organization: any): boolean {
    return this.selectedOrganizations.some(org =>
      org.so_dinh_danh === organization.so_dinh_danh
    );
  }

  // Code for danh_sach_ca_nhan la authorized person (2.3)
  toggleAuthorizedPersonData(event: Event, group: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.addStep2Form.get(group)?.setValue(isChecked, { emitEvent: false });

    if (isChecked) {
      this.processNhomThongTinData(group, []);
    } else {
      this.showTableAuthorizedPersonData = false;
      this.selectedAuthorizedPersons = [];
    }
  }

  toggleAuthorizedPersonSelection(authorized: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.selectedAuthorizedPersons.some(auth =>
        auth.so_dinh_danh === authorized.so_dinh_danh
      )) {
        this.selectedAuthorizedPersons.push(authorized);
      }
    } else {
      this.selectedAuthorizedPersons = this.selectedAuthorizedPersons.filter(auth =>
        auth.so_dinh_danh !== authorized.so_dinh_danh
      );
    }

    this.isAllAuthorizedPersonSelected = this.selectedAuthorizedPersons.length === this.displayAuthorizedPersonData$.length;
  }

  isAuthorizedPersonSelected(authorized: any): boolean {
    return this.selectedAuthorizedPersons.some(auth =>
      auth.so_dinh_danh === authorized.so_dinh_danh
    );
  }

  toggleAllAuthorized(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isAllAuthorizedPersonSelected = isChecked;

    if (isChecked) {
      // Chọn tất cả (Tạo một bản sao mới để Angular detect change)
      this.selectedAuthorizedPersons = [...this.displayAuthorizedPersonData$];
    } else {
      // Bỏ chọn tất cả
      this.selectedAuthorizedPersons = [];
    }
  }

  // Code map hiển thị giới tính tương ứng value
  getGenderLabel(gender: string): string {
    return Common.getGenderLabel(gender);
  }

  // Code chủ sở hữu khác
  createOtherOwner() {
    const modalRef = this.modalService.open(AddOtherOwnerComponent, { size: 'xl', backdrop: 'static' });

    modalRef.result.then((newOtherOwner: OtherOwner) => {
      if (newOtherOwner) {
        this.otherOwnerService.addOtherOwner(newOtherOwner);
        // Đảm bảo hiển thị bảng sau khi thêm
        this.showOtherOwnerTable = true;
        this.addStep2Form.get('other')?.setValue(true, { emitEvent: false });
      }
    }).catch(() => { });
  }

  editOtherOwner(otherOwner: OtherOwner) {
    const modalRef = this.modalService.open(EditOtherOwnerComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.otherOwner = otherOwner;
    modalRef.componentInstance.readOnly = this.readOnly;

    modalRef.result.then((updatedOtherOwner: OtherOwner) => {
      if (updatedOtherOwner) {
        this.otherOwnerService.updateOtherOwner(updatedOtherOwner);
      }
    }).catch(() => { });
  }

  deleteOtherOwner(id: number | undefined) {
    if (confirm('Bạn có chắc chắn muốn xóa đối tượng báo cáo này?')) {
      this.otherOwnerService.deleteOtherOwner(id);
    }
  }

  importOtherOwnerFromExcel(event: any) {
    // return this.otherOwnerService.importOtherOwnerFromExcel(event);
  }


  updateCurrentInputData() {
    if (!this.strReport?.id) {
      this.strReport = { id: null, payload: { Phan_1: {}, Phan_2: {}, Phan_3: {}, Phan_4: {}, Phan_5: {}, Phan_6: {} } }
    }

    // Lấy dữ liệu từ form
    this.strReport.payload.Phan_2 = {
      ca_nhan_thuc_hien_giao_dich: this.personService.getPersons(),
      to_chuc_thuc_hien_giao_dich: this.organizationService.getOrganizations(),
      chu_so_huu_huong_loi: {
        danh_sach_ca_nhan: {
          nhom_thong_tin_1: this.selectedPersons,
          nhom_thong_tin_2: this.selectedOrganizations.map(org => ({
            nhom_thong_tin: 'nhom_thong_tin_2',
            ho_ten: org.ho_ten,
            so_dinh_danh: org.so_dinh_danh
          })),
          nhom_thong_tin_3: this.selectedAuthorizedPersons.map(auth => ({
            nhom_thong_tin: 'nhom_thong_tin_3',
            ho_ten: auth.ho_ten,
            so_dinh_danh: auth.so_dinh_danh
          }))
        },
        chu_so_huu_khac: this.otherOwnerService.getOtherOwners()
      },
      thong_tin_khac_bo_sung: this.addStep2Form.get('thong_tin_khac_bo_sung')?.value,
    }

    return this.strReport;
  }

  // WHEN CLICK SUBMIT DATA
  addStep2Submit() {
    if (confirm('Bạn có chắc chắn muốn thêm CN/TC thực hiện giao dịch này?')) {

      const hasPerson = Array.isArray(this.personService.getPersons()) && this.personService.getPersons().length > 0;
      const hasOrganization = Array.isArray(this.organizationService.getOrganizations()) && this.organizationService.getOrganizations().length > 0;

      if (!hasPerson && !hasOrganization) {
        alert('Bạn cần nhập ít nhất một Cá nhân hoặc một Tổ chức thực hiện giao dịch.');
        return;
      }

      // Validate: mỗi tổ chức phải có ít nhất 1 người đại diện
      const orgWithNoRepresentative = this.organizationService.getOrganizations().find(org =>
        !Array.isArray(org.nguoi_dai_dien) || org.nguoi_dai_dien.length === 0
      );
      if (orgWithNoRepresentative) {
        alert(`Tổ chức "${orgWithNoRepresentative.ten_to_chuc}" cần phải khai báo người đại diện.`);
        return;
      }

      this.updateCurrentInputData();
      this.savePartSubmited.emit(this.strReport);
    }
  }

  getIdentificationNumbers(person: any): string {
    return person.thong_tin_dinh_danh?.map(info => info.so_dinh_danh).join('; ') || '';
  }

  onReset(): void {
    if (confirm('Bạn có chắc chắn muốn xóa trắng biểu mẫu không?')) {
      this.addStep2Form.reset();
    }
  }
}
