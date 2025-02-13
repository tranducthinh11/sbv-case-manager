import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PersonService } from '../services/person.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Person } from '../models/person';
import { Input } from '@angular/core';

@Component({
  selector: 'app-edit-person',
  templateUrl: './edit-person.component.html',
  styleUrl: './edit-person.component.scss',
})
export class EditPersonComponent implements OnInit {
  @Input() person!: Person;
  editForm!: FormGroup

  isSubmit = false
  showAlert = false
  isExisting = false
  isSuccess = false
  bankAccountNumber: any[] = [];

  constructor(private fb: FormBuilder, private personService: PersonService, public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    console.log(this.person)
    this.editForm = this.fb.group({
      id: this.person?.id,
      ho_ten: [this.person?.ho_ten],
      ngay_sinh: [this.person?.ngay_sinh],
      do_tuoi: [this.person?.do_tuoi],
      gioi_tinh: [this.person?.gioi_tinh],
      quoc_tich: [this.person?.quoc_tich],
      nghe_nghiep: [this.person?.nghe_nghiep],
      chuc_vu: [this.person?.chuc_vu],
      dia_chi_quan_huyen: [this.person?.dia_chi_quan_huyen],
      dia_chi_tinh_thanh: [this.person?.dia_chi_tinh_thanh],
      dia_chi_quoc_gia: [this.person?.dia_chi_quoc_gia],
      noi_o_quan_huyen: [this.person?.noi_o_quan_huyen],
      noi_o_tinh_thanh: [this.person?.noi_o_tinh_thanh],
      noi_o_quoc_gia: [this.person?.noi_o_quoc_gia],
      loai_dinh_danh: [this.person?.loai_dinh_danh],
      so_dinh_danh: [this.person?.so_dinh_danh],
      co_quan_cap: [this.person?.co_quan_cap],
      noi_cap: [this.person?.noi_cap],
      ngay_cap: [this.person?.ngay_cap],
      ngay_het_han: [this.person?.ngay_het_han],
      so_dien_thoai: [this.person?.so_dien_thoai],
      tai_khoan: this.fb.array([])
    });

    // Load dữ liệu từ backend và patch vào form
    this.loadPersonData(this.person);
  }

  editPersonSubmit() {
    this.isSubmit = true;
    if (this.editForm.invalid) {
      return;
    }
    const data = this.editForm.value;

    const idPerson = this.person?.id;

    const newPerson = new Person(data);

    this.personService.updatePerson(idPerson, newPerson);

    this.activeModal.close();
  }

  loadPersonData(person: Person) {
    // Set value of person to form
    this.personService.getPersonByID(person.id).subscribe((personData) => {
      if (personData) {
        this.editForm.patchValue({
          id: personData.id,
          ho_ten: personData.ho_ten,
          ngay_sinh: personData.ngay_sinh,
          gioi_tinh: personData.gioi_tinh,
          quoc_tich: personData.quoc_tich,
          nghe_nghiep: personData.nghe_nghiep,
          chuc_vu: personData.chuc_vu,
          dia_chi_quoc_gia: personData.dia_chi_quoc_gia,
          dia_chi_tinh_thanh: personData.dia_chi_tinh_thanh,
          dia_chi_quan_huyen: personData.dia_chi_quan_huyen,
          noi_o_quoc_gia: personData.noi_o_quoc_gia,
          noi_o_tinh_thanh: personData.noi_o_tinh_thanh,
          noi_o_quan_huyen: personData.noi_o_quan_huyen,
          loai_dinh_danh: personData.loai_dinh_danh,
          so_dinh_danh: personData.so_dinh_danh,
          co_quan_cap: personData.co_quan_cap,
          noi_cap: personData.noi_cap,
          ngay_cap: personData.ngay_cap,
          ngay_het_han: personData.ngay_het_han,
          so_dien_thoai: personData.so_dien_thoai,
          tai_khoan: personData.tai_khoan
        });
        this.setBankAccounts(personData.tai_khoan);
      } else {
        console.error(`Person with ID ${person.id} not found.`);
      }
    });

  }

  setBankAccounts(bankAccounts: any[]) {
    const bankAccountsArray = this.editForm.get('tai_khoan') as FormArray;
    bankAccounts.forEach((account) => {
      bankAccountsArray.push(
        this.fb.group({
          so_tai_khoan: [account.so_tai_khoan],
          ngan_hang: [account.ngan_hang],
          loai_tien: [account.loai_tien],
          loai_tai_khoan: [account.loai_tai_khoan],
          ngay_mo: [account.ngay_mo],
          trang_thai: [account.trang_thai || 'active'],
        })
      );
    });
  }

  get bankAccounts(): FormArray {
    return this.editForm.get('tai_khoan') as FormArray;
  }

  addRow() {
    this.bankAccounts.push(
      this.fb.group({
        so_tai_khoan: '',
        ngan_hang: '',
        loai_tien: '',
        loai_tai_khoan: '',
        ngay_mo: '',
        trang_thai: 'active',
      })
    );
  }

  deleteRow(index: number) {
    this.bankAccounts.removeAt(index);
  }
}
