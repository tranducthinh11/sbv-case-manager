import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class Common {
  static nowDate: { year: number, month: number, day: number };

  static formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
      return ''; // Trả về chuỗi rỗng nếu không có giá trị
    }
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Lấy phần YYYY-MM-DD
  }

    static convertFormatDate(date: string | Date): string {
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    // Code map hiển thị giới tính tương ứng value
    static getGenderLabel(gender: string): string {
        const genderMap: { [key: string]: string } = {
            male: 'Nam',
            female: 'Nữ',
            other: 'Khác'
        };

        return genderMap[gender] || 'Không xác định';
    }

    static convertDateToString(date: Date): string {
        // Trả về chuỗi yyyy-MM-dd
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }


    static convertNgbDateToDate(ngbDate: { year: number, month: number, day: number }): Date | null {
      if (!ngbDate || !ngbDate.year || !ngbDate.month || !ngbDate.day) return null;
      return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
    }

    static convertDateToNgbDate(date: Date): { year: number; month: number; day: number } | null {
      if (!date) return null;
      date = new Date(date);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }

  static atLeastOneCheckedValidator(controlName: string): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const control = formGroup.get(controlName);
      if (!control) return null;

      const formArray = control as any; // Type assertion vì FormArray không trực tiếp hỗ trợ type
      if (formArray.controls && formArray.controls.length > 0) {
        const hasChecked = formArray.controls.some((item: AbstractControl) => item.value === true);
        return hasChecked ? null : { atLeastOneChecked: true };
      }
      return null;
    };
  }

  static defaultInit() {
    const today = new Date();
    this.nowDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

}
