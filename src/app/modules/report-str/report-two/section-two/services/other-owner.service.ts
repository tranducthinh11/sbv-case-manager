import { Injectable } from '@angular/core';
import { OtherOwner } from '../models/other-owner';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { PersonallyIdentifiableInformation } from '../models/personally-identifiable-information';
import { PermanentAddress } from '../models/permanent-address';
import { CurrentResidence } from '../models/current-residence';
import * as xls from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class OtherOwnerService {
  private otherOwnerListSubject = new BehaviorSubject<OtherOwner[]>([]);
  otherOwnerList$ = this.otherOwnerListSubject.asObservable();

  constructor() {}

  // Xóa toàn bộ danh sách - CẢI THIỆN: Luôn duy trì kiểu mảng
  clear(): void {
    this.otherOwnerListSubject.next([]); // Thay vì null để tránh lỗi kiểu
  }

  // Thêm mới - AN TOÀN: Kiểm tra đầu vào
  addOtherOwner(otherOwner: OtherOwner): void {
    if (!otherOwner) return;

    const currentOtherOwners = this.otherOwnerListSubject.value; // Sử dụng .value thay vì getValue()
    this.otherOwnerListSubject.next([...currentOtherOwners, otherOwner]);
  }

  // Lấy danh sách - AN TOÀN: Trả về mảng rỗng nếu null
  getOtherOwners(): OtherOwner[] {
    return this.otherOwnerListSubject.value || [];
  }

  // Thiết lập danh sách - AN TOÀN: Kiểm tra đầu vào
  setOtherOwner(otherOwners: OtherOwner[]): void {
    this.otherOwnerListSubject.next(otherOwners || []);
  }

  // Xóa theo ID - CẢI THIỆN: Kiểm tra ID hợp lệ
  deleteOtherOwner(id: number | undefined): void {
    if (id === undefined || id == null) return;

    const currentOtherOwners = this.otherOwnerListSubject.getValue();
    const updatedOtherOwners = currentOtherOwners.filter(owner => owner.id !== id);
    this.otherOwnerListSubject.next(updatedOtherOwners);
  }

  // Cập nhật - CẢI THIỆN: Kiểm tra ID và dữ liệu
  updateOtherOwner(updatedOtherOwner: OtherOwner): void {
    if (!updatedOtherOwner?.id) return;

    const currentOtherOwners = this.otherOwnerListSubject.value;
    const updatedOtherOwners = currentOtherOwners.map(owner =>
      owner.id === updatedOtherOwner.id ? updatedOtherOwner : owner
    );
    this.otherOwnerListSubject.next(updatedOtherOwners);
  }
}
