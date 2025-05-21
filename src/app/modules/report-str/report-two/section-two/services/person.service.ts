import { Injectable } from '@angular/core';
import { Person } from '../models/person';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { BankAccountNumber } from '../models/bank-account-number';
import { PersonallyIdentifiableInformation } from '../models/personally-identifiable-information';
import { PermanentAddress } from '../models/permanent-address';
import { CurrentResidence } from '../models/current-residence';
import * as XLSX from 'xlsx';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

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

  getPersons(): Person[] {
    return this.personListSubject.getValue();
  }

  setPersons(persons: Person[]) {
    this.personListSubject.next(persons);
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

  setAgeRange(form: FormGroup, birthDate: { year: number; month: number; day: number } | null) {
    if (!birthDate) {
      form.get('do_tuoi')?.setValue(null);
      return;
    }

    const birthDateObj = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    const today = new Date();

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    let rangeValue: string | null = null;
    if (age < 20) {
      rangeValue = '1';
    } else if (age < 30) {
      rangeValue = '2';
    } else if (age < 40) {
      rangeValue = '3';
    } else if (age < 50) {
      rangeValue = '4';
    } else {
      rangeValue = '5';
    }

    form.get('do_tuoi')?.setValue(rangeValue);
  }

  updateValidators(
    form: FormGroup,
    value: string,
    originalValidators: {
      main?: { [key: string]: ValidatorFn | ValidatorFn[] | null },
      ngheNghiep?: { [key: string]: ValidatorFn | ValidatorFn[] | null },
      diaChiThuongTru?: { [key: string]: ValidatorFn | ValidatorFn[] | null },
      noiOHienTai?: { [key: string]: ValidatorFn | ValidatorFn[] | null }
    }
  ): void {
    const hoTenControl = form.get('ho_ten');
    const ngaySinhControl = form.get('ngay_sinh');
    const doTuoiControl = form.get('do_tuoi');
    const gioiTinhControl = form.get('gioi_tinh');
    const quocTichControl = form.get('quoc_tich');
    const soDienThoaiControl = form.get('so_dien_thoai');
    const ngayHetHanControl = form.get('thong_tin_dinh_danh.ngay_het_han');

    const ngheNghiepGroup = form.get('nghe_nghiep') as FormGroup;
    const diaChiThuongTruGroup = form.get('dia_chi_thuong_tru') as FormGroup;
    const noiOHienTaiGroup = form.get('noi_o_hien_tai') as FormGroup;

    ngayHetHanControl?.clearValidators();

    if (value === '0') {
      hoTenControl?.setValidators(Validators.required);
      ngaySinhControl?.clearValidators();
      doTuoiControl?.clearValidators();
      gioiTinhControl?.clearValidators();
      quocTichControl?.clearValidators();
      soDienThoaiControl?.clearValidators();

      [ngheNghiepGroup, diaChiThuongTruGroup, noiOHienTaiGroup].forEach(group => {
        Object.keys(group.controls).forEach(key => {
          group.get(key)?.clearValidators();
          group.get(key)?.updateValueAndValidity();
        });
      });
    } else {
      hoTenControl?.setValidators(originalValidators.main?.['ho_ten'] || null);
      ngaySinhControl?.setValidators(originalValidators.main?.['ngay_sinh'] || null);
      doTuoiControl?.setValidators(originalValidators.main?.['do_tuoi'] || null);
      gioiTinhControl?.setValidators(originalValidators.main?.['gioi_tinh'] || null);
      quocTichControl?.setValidators(originalValidators.main?.['quoc_tich'] || null);
      soDienThoaiControl?.setValidators(originalValidators.main?.['so_dien_thoai'] || null);

      Object.keys(ngheNghiepGroup.controls).forEach(key => {
        ngheNghiepGroup.get(key)?.setValidators(originalValidators.ngheNghiep?.[key] || null);
        ngheNghiepGroup.get(key)?.updateValueAndValidity();
      });

      Object.keys(diaChiThuongTruGroup.controls).forEach(key => {
        diaChiThuongTruGroup.get(key)?.setValidators(originalValidators.diaChiThuongTru?.[key] || null);
        diaChiThuongTruGroup.get(key)?.updateValueAndValidity();
      });

      Object.keys(noiOHienTaiGroup.controls).forEach(key => {
        noiOHienTaiGroup.get(key)?.setValidators(originalValidators.noiOHienTai?.[key] || null);
        noiOHienTaiGroup.get(key)?.updateValueAndValidity();
      });

      form.clearValidators();
    }

    [hoTenControl, ngaySinhControl, doTuoiControl, gioiTinhControl, quocTichControl, soDienThoaiControl]
      .forEach(control => control?.updateValueAndValidity());

    [ngheNghiepGroup, diaChiThuongTruGroup, noiOHienTaiGroup].forEach(group => group.updateValueAndValidity());
    form.updateValueAndValidity();
  }

  importPersonFromExcel(event: any) {
    const file = event.target.files[0];
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);

    fr.onload = () => {
      const data = fr.result;
      const workbook = XLSX.read(data, { type: 'array' });

      // Đọc dữ liệu từ từng sheet
      const users = XLSX.utils.sheet_to_json(workbook.Sheets['Thong_Tin_Ca_Nhan']);
      const addresses = XLSX.utils.sheet_to_json(workbook.Sheets['Dia_Chi_Thuong_Tru']);
      const currentAddresses = XLSX.utils.sheet_to_json(workbook.Sheets['Noi_O_Hien_Tai']);
      const idInfo = XLSX.utils.sheet_to_json(workbook.Sheets['Thong_Tin_Dinh_Danh']);
      const bankAccounts = XLSX.utils.sheet_to_json(workbook.Sheets['Thong_Tin_Tai_Khoan']);
      const authorizedPersons = XLSX.utils.sheet_to_json(workbook.Sheets['Nguoi_Duoc_Uy_Quyen']);
      const authorInfo = XLSX.utils.sheet_to_json(workbook.Sheets['Dinh_Danh_Nguoi_Uy_Quyen']);

      // Chuyển đổi dữ liệu thành mảng `Person[]`
      const personsArr: Person[] = users.map((row: any, i: number) => {
        let bankAccountList: BankAccountNumber[] = [];
        let personalIdList: PersonallyIdentifiableInformation[] = [];
        let permanentAddress: PermanentAddress = new PermanentAddress({});
        let currentResidence: CurrentResidence = new CurrentResidence({});

        try {
          // Lấy danh sách tài khoản ngân hàng theo ID người dùng
          const userBankAccounts = bankAccounts.filter(acc => acc['STT_Ca_Nhan'] === row['STT']);
          bankAccountList = userBankAccounts.map((acc: any, j: number) =>
            new BankAccountNumber({
              id: new Date().getTime() + i + j,
              so_tai_khoan: acc['So_Tai_Khoan'] || '',
              ngan_hang: acc['Ngan_Hang'] || '',
              loai_tien: acc['Loai_Tien'] || '',
              loai_tai_khoan: acc['Loai_Tai_Khoan'] || '',
              ngay_mo: acc['Ngay_Mo'] || '',
              trang_thai: acc['Trang_Thai'] || 'ACTIV',
              nguoi_duoc_uy_quyen: authorizedPersons
                .filter(p => p['So_Tai_Khoan'] === acc['So_Tai_Khoan'])
                .map(p => ({
                  ho_ten: p['Ho_Ten'],
                  quan_he_voi_chu_tai_khoan: p['Quan_He_Voi_Chu_Tai_Khoan'],
                  thong_tin_dinh_danh: authorInfo
                    .filter(id => id['STT_Uy_Quyen'] === p['STT'])
                    .map(
                      a => new PersonallyIdentifiableInformation({
                        id: new Date().getTime() + i + j,
                        loai_dinh_danh: a['Loai_Dinh_Danh'] || '',
                        so_dinh_danh: a['So_Dinh_Danh'] || '',
                        ngay_cap: a['Ngay_Cap'] || '',
                        ngay_het_han: a['Ngay_Het_Han'] || '',
                        co_quan_cap: a['Co_Quan_Cap'] || '',
                        noi_cap: a['Noi_Cap'] || ''
                      }
                      ))
                }))
            })
          );
        } catch (error) {
          console.error("Lỗi khi parse tài khoản ngân hàng:", error);
        }

        try {
          // Lấy danh sách thông tin định danh theo ID người dùng
          const userIdInfo = idInfo.filter(id => id['STT_Ca_Nhan'] === row['STT']);
          personalIdList = userIdInfo.map((idInfo: any, k: number) =>
            new PersonallyIdentifiableInformation({
              id: new Date().getTime() + i + k,
              loai_dinh_danh: idInfo['Loai_Dinh_Danh'] || '',
              so_dinh_danh: idInfo['So_Dinh_Danh'] || '',
              ngay_cap: idInfo['Ngay_Cap'] || '',
              ngay_het_han: idInfo['Ngay_Het_Han'] || '',
              co_quan_cap: idInfo['Co_Quan_Cap'] || '',
              noi_cap: idInfo['Noi_Cap'] || ''
            })
          );
        } catch (error) {
          console.error("Lỗi khi parse thông tin định danh:", error);
        }

        try {
          // Lấy thông tin địa chỉ từ Excel và ánh xạ về đúng format
          const userPermanentAddress = addresses.find(a => a['STT_Ca_Nhan'] === row['STT']);
          const userCurrentResidence = currentAddresses.find(a => a['STT_Ca_Nhan'] === row['STT']);

          if (userPermanentAddress) {
            permanentAddress = new PermanentAddress({
              id: userPermanentAddress['ID'] || new Date().getTime(),
              so_nha: userPermanentAddress['So_Nha'] || '',
              quan_huyen: userPermanentAddress['Quan_Huyen'] || '',
              tinh_thanh: userPermanentAddress['Tinh_Thanh'] || '',
              quoc_gia: userPermanentAddress['Quoc_Gia'] || ''
            });
          }

          if (userCurrentResidence) {
            currentResidence = new CurrentResidence({
              id: userCurrentResidence['ID'] || new Date().getTime(),
              so_nha: userCurrentResidence['So_Nha'] || '',
              quan_huyen: userCurrentResidence['Quan_Huyen'] || '',
              tinh_thanh: userCurrentResidence['Tinh_Thanh'] || '',
              quoc_gia: userCurrentResidence['Quoc_Gia'] || ''
            });
          }
        } catch (error) {
          console.error("Lỗi khi parse địa chỉ:", error);
        }

        return new Person({
          id: new Date().getTime() + i,
          ho_ten: row['Ho_Ten'] || '',
          ngay_sinh: row['Ngay_Sinh'] || '',
          do_tuoi: row['Do_Tuoi'] || '',
          gioi_tinh: row['Gioi_Tinh'] || '',
          quoc_tich: row['Quoc_Tich'] || '',
          nghe_nghiep: row['Nghe_Nghiep'] || '',
          chuc_vu: row['Chuc_Vu'] || '',
          so_dien_thoai: row['So_Dien_Thoai'] || '',
          trinh_do_van_hoa: row['Trinh_Do_Van_Hoa'] || '',
          email: row['Email'] || '',
          dia_chi_thuong_tru: permanentAddress,
          noi_o_hien_tai: currentResidence,
          thong_tin_dinh_danh: personalIdList,
          tai_khoan: bankAccountList
        });
      });

      // Gán danh sách person vào biến state
      this.setPersons(personsArr);
    };
  }

}
