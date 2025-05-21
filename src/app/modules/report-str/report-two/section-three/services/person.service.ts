import { Injectable } from '@angular/core';
import { Person } from '../models/person';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private personListSubject = new BehaviorSubject<Person[]>([]);
  personList$ = this.personListSubject.asObservable();

  constructor() { }

  clear() {
    this.personListSubject.next(null)
  }

  addPerson(person: Person) {
    const currentPersons = this.personListSubject.getValue();
    this.personListSubject.next([...currentPersons, person]);
  }

  setPerson(persons: Person[]) {
    this.personListSubject.next(persons);
  }

  getPersons(): Person[] {
    return this.personListSubject.getValue();
  }

  // Xóa cá nhân theo ID
  deletePerson(id: number | undefined) {
    if (id === undefined) return;
    const currentPersons = this.personListSubject.getValue();
    const updatedPersons = currentPersons.filter(person => person.id !== id);
    this.personListSubject.next(updatedPersons);
  }

  // Cập nhật thông tin cá nhân
  updatePerson(updatedPerson: Person) {
    const currentPersons = this.personListSubject.getValue();
    const updatedPersons = currentPersons.map(person =>
      person.id === updatedPerson.id ? updatedPerson : person
    );
    this.personListSubject.next(updatedPersons);
  }

  addOrUpdatePerson(person: Person) {
    const currentPersons = this.personListSubject.getValue();
    const index = currentPersons.findIndex(p => p.id === person.id);
    
    let updatedPersons: Person[];
    if (index !== -1) {
      // Đã tồn tại → cập nhật
      updatedPersons = [...currentPersons];
      updatedPersons[index] = person;
    } else {
      // Không tồn tại → thêm mới
      updatedPersons = [...currentPersons, person];
    }
    this.personListSubject.next(updatedPersons);
  }
  
}
