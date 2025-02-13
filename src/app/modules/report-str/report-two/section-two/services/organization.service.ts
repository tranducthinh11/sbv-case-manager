import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { Organization } from '../models/organization';
import { LegalRepresentative } from "../models/legal-representative";

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private static readonly OrganizationsStorageKey = 'to_chuc_thuc_hien_giao_dich';

  private currentOrganization!: Organization | null;
  private currentOrganizationSubject: BehaviorSubject<Organization | null> = new BehaviorSubject<Organization | null>(null);
  private organizations: Organization[] = [];
  private filteredOrganizations: Organization[] = [];
  private organizationsSubject: BehaviorSubject<Organization[]> = new BehaviorSubject<Organization[]>([]);
  private lengthOrganizationsSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  organizations$: Observable<Organization[]> = this.organizationsSubject.asObservable();
  lengthOrganizations$: Observable<number> = this.lengthOrganizationsSubject.asObservable();
  currentOrganization$: Observable<Organization | null> = this.currentOrganizationSubject.asObservable();

  constructor(private storageService: LocalStorageService, private router: Router) {

  }

  fetchDataFromLocalStorage() {
    this.organizations = this.storageService.getValue<Organization[]>(OrganizationService.OrganizationsStorageKey) || [];
    this.filteredOrganizations = [...this.organizations];
    this.currentOrganization = this.storageService.getValue<Organization>('currentOrganization') || null;
    this.updateData();
  }

  updateToLocalStorage() {
    this.storageService.setObject(OrganizationService.OrganizationsStorageKey, this.organizations);
    this.filterOrganizations(null, false);
    this.updateData();
  }

  importDataFromFile(organizations: Organization[]) {
    this.organizations = organizations;
    this.updateToLocalStorage();
  }

  addOrganization(organization: Organization): Boolean {

    this.organizations.unshift(organization);
    this.updateToLocalStorage();
    return true;
  }

  addLegalRepresentative(organizationId: Number, legalRepresentative: LegalRepresentative): Boolean {

    // 1. Tìm Organization theo id
    const organizationIndex = this.organizations.findIndex(org => org.id === organizationId);

    // 2. Kiểm tra xem có tìm thấy Organization hay không
    if (organizationIndex !== -1) {
      // Tìm thấy Organization, thêm LegalRepresentative vào mảng nguoi_dai_dien
      if (!this.organizations[organizationIndex].nguoi_dai_dien) {
        this.organizations[organizationIndex].nguoi_dai_dien = []; // Khởi tạo mảng nếu nó chưa tồn tại
      }
      this.organizations[organizationIndex].nguoi_dai_dien.push(legalRepresentative);

      // 3. Cập nhật Local Storage
      this.updateToLocalStorage();

      return true; // Thêm thành công
    } else {
      return false; // Không tìm thấy Organization
    }
  }

  updateOrganization(id: number | undefined, data: Organization) {
    // const index = this.organizations.findIndex((organizations) => origin.id === id);
    // this.organizations.splice(index, 1, data);
    this.updateToLocalStorage();
  }

  deleteOrganization(id: number | undefined) {
    const index = this.organizations.findIndex((organization) => organization.id === id);
    this.organizations.splice(index, 1);
    this.updateToLocalStorage();
  }

  getOrganizationByID(id: number | undefined): Observable<Organization | null> {
    let organization = this.organizations.find((organization) => organization.id === id) || null;
    return of(organization).pipe(delay(500));
  }

  filterOrganizations(key: string | null, isFiltering: boolean = true) {
    this.filteredOrganizations = [...this.organizations];
    if (isFiltering) {
      this.updateData();
    }
  }

  private updateData() {
    this.currentOrganizationSubject?.next(this.currentOrganization);
    this.organizationsSubject.next(this.filteredOrganizations);
    this.lengthOrganizationsSubject.next(this.organizations.length);
  }


}
