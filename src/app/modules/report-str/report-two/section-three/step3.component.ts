import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ICreateAccount } from '../create-account.helper';
import { PersonService } from './services/person.service';
import { Person } from './models/person';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddPersonComponent } from './add-person/add-person.component';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { EditPersonComponent } from './edit-person/edit-person.component';
import * as xls from 'xlsx'
import { AddOrganizationComponent } from './add-organization/add-organization.component';
import { OrganizationService } from './services/organization.service';
import { Organization } from './models/organization';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
})

export class Step3Component implements OnInit, OnDestroy {
  @Input('updateParentModel') updateParentModel: (
    part: Partial<ICreateAccount>,
    isFormValid: boolean
  ) => void;
  @Input() defaultValues: Partial<ICreateAccount>;

  form: FormGroup;
  persons: Person[] = [];
  displayPerson$: Observable<Person[]> | undefined; // Thay đổi kiểu dữ liệu

  organizations: Organization[] = [];
  displayOrganizations$: Observable<Organization[]> | undefined; // Thay đổi kiểu dữ liệu

  private unsubscribe: Subscription[] = [];
  constructor(private fb: FormBuilder, private personService: PersonService, private modalService: NgbModal, private organizationService: OrganizationService) { }

  ngOnInit() {
    this.initForm();
    this.updateParentModel({}, this.checkForm());

    this.displayPerson$ = this.personService.persons$; // Gán Observable
    this.displayOrganizations$ = this.organizationService.organizations$; // Gán Observable

    // Vẫn giữ lại subscribe này nếu bạn cần sử dụng biến persons cho mục đích khác
    this.unsubscribe.push(
      this.personService.persons$.subscribe((persons) => {
        this.persons = persons;
      })
    );
  }

  initForm() {
    this.form = this.fb.group({
      accountTeamSize: [
        this.defaultValues.accountTeamSize,
        [Validators.required],
      ],
      accountName: [this.defaultValues.accountName, [Validators.required]],
      accountPlan: [this.defaultValues.accountPlan, [Validators.required]],
    });

    const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
      this.updateParentModel(val, this.checkForm());
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !this.form.get('accountName')?.hasError('required');
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  createPerson(item?: any) {
    const modalRef = this.modalService.open(AddPersonComponent, { size: 'xl' });
    modalRef.componentInstance.initialData = item;

    modalRef.result.then((result) => {
      console.log("Kết quả nhận được từ modal:", result);

    }, (reason) => {
      console.log('Modal bị đóng với lý do:', reason);
    });
  }

  editPerson(person: Person) {
    const modalRef = this.modalService.open(EditPersonComponent, { size: 'xl' });
    modalRef.componentInstance.person = person;
  }

  deletePerson(id: number | undefined) {
    const isDelete = confirm('Bạn có chắc chắn muốn xóa đối tượng báo cáo này?');
    if (isDelete) {
      this.personService.deletePerson(id);
    }

  }

  updateDisplayList(event: Person[]) {
  }

  importPersonFromCSV(event: any) {
    const file = event.target.files[0];
    let fr = new FileReader();

    fr.readAsArrayBuffer(file);

    fr.onload = () => {

      let data = fr.result;
      let workbook = xls.read(data, { type: 'array' });

      const sheetname = workbook.SheetNames[0];

      const sheet1 = workbook.Sheets[sheetname]

      this.persons = xls.utils.sheet_to_json(sheet1, { raw: true });

      if (this.persons.length > 0) {
        let personArr: Person[] = []; // Declare personArr outside the if block
        for (let i = 0; i < this.persons.length; i++) {
          const id = new Date(Date.now()).getTime() + i;
          let newPerson = new Person(this.persons[i]);
          newPerson.id = id;
          personArr.push(newPerson);
        }
        this.personService.importDataFromFile(personArr);
      }
    }
  }

  downloadTemplatePerson(): void {
    const filePath = 'assets/template_file.xlsx'; // Đường dẫn tới file
    const anchor = document.createElement('a');
    anchor.href = filePath;
    anchor.download = 'File_Template.xlsx'; // Tên file khi tải xuống
    anchor.click();
  }

  // Organization

  createOrganization(item?: any) {
    const modalRef = this.modalService.open(AddOrganizationComponent, { size: 'xl' });
    modalRef.componentInstance.initialData = item;

    modalRef.result.then((result) => {
      console.log("Kết quả nhận được từ modal:", result);

    }, (reason) => {
      console.log('Modal bị đóng với lý do:', reason);
    });
  }

}
