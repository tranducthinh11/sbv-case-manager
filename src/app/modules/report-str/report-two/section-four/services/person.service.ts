import { Injectable } from '@angular/core';
import { Person } from '../models/person';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private personListSubject = new BehaviorSubject<Person[]>([]);
  personList$ = this.personListSubject.asObservable();

  constructor() {}

  clear() {
    this.personListSubject.next([]); // Sửa thành mảng rỗng thay vì null
  }

  addPerson(person: Person) {
    let currentPersons = this.personListSubject.getValue();
    if (!currentPersons) {
      currentPersons = []; // Khởi tạo mảng rỗng nếu currentPersons là null
    }
    console.log('Adding person:', person); // Debug
    console.log('Current persons before adding:', currentPersons); // Debug
    this.personListSubject.next([...currentPersons, person]);
    console.log('Current persons after adding:', this.personListSubject.getValue()); // Debug
  }

  setPerson(persons: Person[]) {
    this.personListSubject.next(persons);
  }

  getPersons(): Person[] {
    return this.personListSubject.getValue();
  }

  deletePerson(id: number | undefined) {
    if (id === undefined) return;
    const currentPersons = this.personListSubject.getValue();
    const updatedPersons = currentPersons.filter(person => person.id !== id);
    this.personListSubject.next(updatedPersons);
  }

  updatePerson(updatedPerson: Person) {
    const currentPersons = this.personListSubject.getValue();
    const updatedPersons = currentPersons.map(person =>
      person.id === updatedPerson.id ? updatedPerson : person
    );
    this.personListSubject.next(updatedPersons);
  }

  validateAtLeastOneReportType(form: FormGroup, reportTypes: any[]): boolean {
    return reportTypes.some(item => form.get(item.key)?.value);
  }

  validateSuspiciousSignsIfNeeded(form: FormGroup, suspiciousSigns: any[]): boolean {
    const isChecked = form.get('d26_k1_db')?.value;
    if (!isChecked) return true;
    return suspiciousSigns.some(item => form.get(item.key)?.value);
  }

  validateTransactionExecution(form: FormGroup, persons: any[]): boolean {
    const giaoDichDaThucHien = form.get('thuc_hien_giao_dich')?.value;
    return !(giaoDichDaThucHien === '1' && (!persons || persons.length === 0));
  }

  validatePointADetails(form: FormGroup): boolean {
    if (!form.get('d26_k1_da')?.value) return true;
    const soThongBao = form.get('so_thong_bao')?.value?.trim();
    const coSoNghiNgo = form.get('co_so_nghi_ngo')?.value?.trim();
    return !!(soThongBao && coSoNghiNgo);
  }

  validatePointBDetails(form: FormGroup): boolean {
    if (!form.get('d26_k1_db')?.value) return true;
    const value = form.get('diem_b_co_so_nghi_ngo')?.value?.trim();
    return !!value;
  }

  validateFinalConclusion(form: FormGroup, finalConclusion: any[]): boolean {
    return finalConclusion.some(item => form.get(item.key)?.value);
  }

}
