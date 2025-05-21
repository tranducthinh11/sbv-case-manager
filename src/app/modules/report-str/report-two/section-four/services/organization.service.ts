import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { Router } from '@angular/router';
import { Organization } from '../models/organization';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private organizations: Organization[] = [];
  private organizationListSubject = new BehaviorSubject<Organization[]>([]);
  organizationList$ = this.organizationListSubject.asObservable();

  constructor(private router: Router) {

  }

  clear() {
    this.organizationListSubject.next(null)
  }

  setOrganization(organizations: Organization[]) {
    this.organizationListSubject.next(organizations);
  }

  addOrganization(organization: Organization) {
    const currentOrganizations = this.organizationListSubject.getValue();
    this.organizationListSubject.next([...currentOrganizations, organization]);
  }

  getOrganizations(): Organization[] {
    return this.organizationListSubject.getValue();
  }

  getOrganizationByID(id: number | undefined): Observable<Organization | null> {
    let organization = this.organizations.find((organization) => organization.id === id) || null;
    return of(organization).pipe(delay(500));
  }

  updateOrganization(updatedOrganization: Organization) {
    const currentOrganizations = this.organizationListSubject.getValue();
    const updatedOrganizations = currentOrganizations.map(organization =>
      organization.id === updatedOrganization.id ? updatedOrganization : organization
    );
    this.organizationListSubject.next(updatedOrganizations);
  }

  deleteOrganization(id: number | undefined) {
    if (id === undefined) return;
    const currentOrganizations = this.organizationListSubject.getValue();
    const updatedOrganizations = currentOrganizations.filter(organization => organization.id !== id);
    this.organizationListSubject.next(updatedOrganizations);
  }
}
