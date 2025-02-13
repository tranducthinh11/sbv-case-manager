import { Injectable } from '@angular/core';
import { Person } from '../models/person';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private static readonly PersonsStorageKey = 'ca_nhan_thuc_hien_giao_dich';

  private currentPerson!: Person | null;
  private currentPersonSubject: BehaviorSubject<Person | null> = new BehaviorSubject<Person | null>(null);
  private persons: Person[] = [];
  private filteredPersons: Person[] = [];
  private personsSubject: BehaviorSubject<Person[]> = new BehaviorSubject<Person[]>([]);
  private lengthPersonsSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  persons$: Observable<Person[]> = this.personsSubject.asObservable();
  lengthPersons$: Observable<number> = this.lengthPersonsSubject.asObservable();
  currentPerson$: Observable<Person | null> = this.currentPersonSubject.asObservable();

  constructor(private storageService: LocalStorageService, private router: Router) {}

  fetchDataFromLocalStorage() {
    this.persons = this.storageService.getValue<Person[]>(PersonService.PersonsStorageKey) || [];
    this.filteredPersons = [...this.persons];
    this.currentPerson = this.storageService.getValue<Person>('currentPerson') || null;
    this.updateData();
  }

  updateToLocalStorage() {
    this.storageService.setObject(PersonService.PersonsStorageKey, this.persons);
    this.filterPersons(null, false);
    this.updateData();
  }

  importDataFromFile(persons: Person[]) {
    this.persons = persons;
    this.updateToLocalStorage();
  }

  addPerson(person : Person): Boolean {

    this.persons.unshift(person);
    this.updateToLocalStorage();
    return true;
  }

  updatePerson(id: number | undefined, data: Person) {
    const index = this.persons.findIndex((person) => person.id === id);
    this.persons.splice(index, 1, data);
    this.updateToLocalStorage();
  }

  deletePerson(id: number | undefined) {
    const index = this.persons.findIndex((person) => person.id === id);
    this.persons.splice(index, 1);
    this.updateToLocalStorage();
  }

  getPersonByID(id: number | undefined): Observable<Person | null> {
    let person = this.persons.find((person) => person.id === id) || null;
    return of(person).pipe(delay(500));
  }

  filterPersons(key: string | null, isFiltering: boolean = true) {
    this.filteredPersons = [...this.persons];
    if (isFiltering) {
      this.updateData();
    }
  }

  private updateData() {
    this.currentPersonSubject?.next(this.currentPerson);
    this.personsSubject.next(this.filteredPersons);
    this.lengthPersonsSubject.next(this.persons.length);
  }
}
