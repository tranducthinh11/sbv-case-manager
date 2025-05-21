import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { Organization } from '../models/organization';
import { LegalRepresentative } from "../models/legal-representative";
import { BankAccountNumber } from "../models/bank-account-number";
import { EstablishmentLicense } from "../models/establishment-license";
import { BussinessRegistrationNumber } from "../models/business-registration-number";
import { CurrentResidence } from "../models/current-residence";
import { PersonallyIdentifiableInformation } from "../models/personally-identifiable-information";
import * as XLSX from 'xlsx';
import { AbstractControl, FormGroup, ValidatorFn, Validators, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private organizationListSubject = new BehaviorSubject<Organization[]>([]);
  organizationList$ = this.organizationListSubject.asObservable();

  constructor(private storageService: LocalStorageService, private router: Router) {

  }

  clear() {
    this.organizationListSubject.next(null)
  }

  addOrganization(organization: Organization) {
    const currentOrganizations = this.organizationListSubject.getValue();
    this.organizationListSubject.next([...currentOrganizations, organization]);
  }

  getOrganizations(): Organization[] {
    return this.organizationListSubject.getValue();
  }

  setOrganizations(organization: Organization[]) {
    this.organizationListSubject.next(organization);
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

  addLegalRepresentative(organizationId: Number, legalRepresentative: LegalRepresentative): Boolean {
    const organization = this.organizationListSubject.getValue().find(org => org.id === organizationId);

    if (organization) {
      // Nếu mảng nguoi_dai_dien chưa được khởi tạo thì khởi tạo
      if (!organization.nguoi_dai_dien) {
        organization.nguoi_dai_dien = [];
      }
      organization.nguoi_dai_dien.push(legalRepresentative);
      return true;
    }
    return false;
  }

  editLegalRepresentative(organizationId: Number, updatedRepresentatives: LegalRepresentative[]): boolean {
    const organization = this.organizationListSubject.getValue().find(org => org.id === organizationId);

    if (organization) {
      organization.nguoi_dai_dien = updatedRepresentatives;

      // Nếu cần thông báo lại cho các subscriber
      this.organizationListSubject.next([...this.organizationListSubject.getValue()]);
      return true;
    }

    return false;
  }

  updateOrganizationValidators(
    form: FormGroup,
    value: string,
    originalValidators: {
      main?: { [key: string]: ValidatorFn | ValidatorFn[] | null },
      loaiHinhToChuc?: { [key: string]: ValidatorFn | ValidatorFn[] | null },
      diaChi?: { [key: string]: ValidatorFn | ValidatorFn[] | null },
      maSoDoanhNghiep?: { [key: string]: ValidatorFn | ValidatorFn[] | null }
    }
  ): void {
    const tenToChucControl = form.get('ten_to_chuc');
    const loaiHinhMaControl = form.get('loai_hinh_to_chuc.ma_loai_hinh');
    const diaChiSoNhaControl = form.get('dia_chi.so_nha');
    const diaChiQuanHuyenControl = form.get('dia_chi.quan_huyen');
    const diaChiTinhThanhControl = form.get('dia_chi.tinh_thanh');
    const msdnMaSoControl = form.get('ma_so_doanh_nghiep.ma_so');
    const soDienThoaiControl = form.get('so_dien_thoai');
    const nghanhNgheKinhDoanhControl = form.get('nganh_nghe_kinh_doanh');
    const taiKhoanArray = form.get('tai_khoan') as FormArray;

    if (value === '1') {
      tenToChucControl?.setValidators(originalValidators.main?.['ten_to_chuc'] || null);
      soDienThoaiControl?.setValidators(originalValidators.main?.['so_dien_thoai'] || null);
      nghanhNgheKinhDoanhControl?.setValidators(originalValidators.main?.['nganh_nghe_kinh_doanh'] || null);
      loaiHinhMaControl?.setValidators(originalValidators.loaiHinhToChuc?.['ma_loai_hinh'] || null);
      diaChiSoNhaControl?.setValidators(originalValidators.diaChi?.['so_nha'] || null);
      diaChiQuanHuyenControl?.setValidators(originalValidators.diaChi?.['quan_huyen'] || null);
      diaChiTinhThanhControl?.setValidators(originalValidators.diaChi?.['tinh_thanh'] || null);
      msdnMaSoControl?.setValidators(originalValidators.maSoDoanhNghiep?.['ma_so'] || null);

    } else {
      tenToChucControl?.setValidators(originalValidators.main?.['ten_to_chuc'] || Validators.required);
      loaiHinhMaControl?.clearValidators();
      diaChiSoNhaControl?.clearValidators();
      diaChiQuanHuyenControl?.clearValidators();
      diaChiTinhThanhControl?.clearValidators();
      soDienThoaiControl?.clearValidators();
      nghanhNgheKinhDoanhControl?.clearValidators();
      msdnMaSoControl?.clearValidators();
    }

    [tenToChucControl, soDienThoaiControl, loaiHinhMaControl,
      diaChiSoNhaControl, diaChiQuanHuyenControl, diaChiTinhThanhControl,
      msdnMaSoControl, nghanhNgheKinhDoanhControl].forEach(control => control?.updateValueAndValidity());

    form.updateValueAndValidity();
  }

  importOrganizationFromExcel(event: any) {
    const file = event.target.files[0];
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.onload = () => {
      const data = fr.result;
      const workbook = XLSX.read(data, { type: 'array' });

      // Đọc dữ liệu từ từng sheet
      const organizations = XLSX.utils.sheet_to_json(workbook.Sheets['To_Chuc']);
      const addresses = XLSX.utils.sheet_to_json(workbook.Sheets['Dia_Chi']);
      const establishmentLicense = XLSX.utils.sheet_to_json(workbook.Sheets['Giay_Phep_Thanh_Lap']);
      const bussinessRegistrationNumber = XLSX.utils.sheet_to_json(workbook.Sheets['Ma_So_Doanh_Nghiep']);
      const legalRepresentatives = XLSX.utils.sheet_to_json(workbook.Sheets['Nguoi_Dai_Dien']);
      const legalCurrentAddresses = XLSX.utils.sheet_to_json(workbook.Sheets['NDD_Noi_O_Hien_Tai']);
      const legalPermanentAddress = XLSX.utils.sheet_to_json(workbook.Sheets['NDD_Dia_Chi_Thuong_Tru']);
      const legalIdInfo = XLSX.utils.sheet_to_json(workbook.Sheets['NDD_Thong_Tin_Dinh_Danh']);
      const bankAccounts = XLSX.utils.sheet_to_json(workbook.Sheets['Thong_Tin_Tai_Khoan']);
      const authorizedPersons = XLSX.utils.sheet_to_json(workbook.Sheets['Nguoi_Duoc_Uy_Quyen']);
      const authorInfo = XLSX.utils.sheet_to_json(workbook.Sheets['NUQ_Thong_Tin_Dinh_Danh']);

      // Chuyển đổi dữ liệu thành mảng `Person[]`
      const organizationsArr: Organization[] = organizations.map((row: any, i: number) => {
        let bankAccountList: BankAccountNumber[] = [];
        let orgAddress: CurrentResidence = new CurrentResidence({});
        let busRegNumber: BussinessRegistrationNumber = new BussinessRegistrationNumber({});
        let estLicense: EstablishmentLicense = new EstablishmentLicense({});

        try {
          // Lấy thông tin địa chỉ theo STT tổ chức
          const organizationAdd = addresses.find(add => add['STT_To_Chuc'] === row['STT']);

          if (organizationAdd) {
            orgAddress = new CurrentResidence({
              id: organizationAdd['ID'] || new Date().getTime(),
              so_nha: organizationAdd['So_Nha'] || '',
              quan_huyen: organizationAdd['Quan_Huyen'] || '',
              tinh_thanh: organizationAdd['Tinh_Thanh'] || '',
              quoc_gia: organizationAdd['Quoc_Gia'] || ''
            });
          }

        } catch (error) {
          console.error("Lỗi khi parse mã số doanh nghiệp:", error);
        }

        try {
          // Lấy danh sách tài khoản ngân hàng theo STT tổ chức
          const userBankAccounts = bankAccounts.filter(acc => acc['STT_To_Chuc'] === row['STT']);
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
          // Lấy thông tin giấy phép thành lập theo STT tổ chức
          const organizationEstLicense = establishmentLicense.find(e => e['STT_To_Chuc'] === row['STT']);

          if (organizationEstLicense) {
            estLicense = new EstablishmentLicense({
              id: organizationEstLicense['ID'] || new Date().getTime(),
              so_giay_phep: organizationEstLicense['So_Giay_Phep'] || '',
              ngay_cap: organizationEstLicense['Ngay_Cap'] || '',
              noi_cap: organizationEstLicense['Noi_Cap'] || ''
            });
          }

        } catch (error) {
          console.error("Lỗi khi parse giấy phép thành:", error);
        }

        try {
          // Lấy thông tin mã số doanh nghiệp theo STT tổ chức
          const organizationBusNumber = bussinessRegistrationNumber.find(b => b['STT_To_Chuc'] === row['STT']);

          if (organizationBusNumber) {
            busRegNumber = new BussinessRegistrationNumber({
              id: organizationBusNumber['ID'] || new Date().getTime(),
              ma_so: organizationBusNumber['Ma_So'] || '',
              ngay_cap: organizationBusNumber['Ngay_Cap'] || '',
              noi_cap: organizationBusNumber['Noi_Cap'] || ''
            });
          }

        } catch (error) {
          console.error("Lỗi khi parse mã số doanh nghiệp:", error);
        }

        return new Organization({
          id: new Date().getTime() + i,
          ten_to_chuc: row['Ten_To_Chuc'] || '',
          ten_tieng_nuoc_ngoai: row['Ten_Tieng_Nuoc_Ngoai'] || '',
          ten_viet_tat: row['Ten_Viet_Tat'] || '',
          dia_chi: orgAddress,
          loai_hinh_to_chuc: row['Loai_Hinh_To_Chuc'] || '',
          nganh_nghe_kinh_doanh: row['Nganh_Nghe_Kinh_Doanh'] || '',
          so_dien_thoai: row['So_Dien_Thoai'] || '',
          website: row['Website'] || '',
          giay_phep_thanh_lap: estLicense,
          ma_so_doanh_nghiep: busRegNumber,
          tai_khoan: bankAccountList,
          nguoi_dai_dien: legalRepresentatives
        });
      });

      // Gán danh sách person vào biến state
      this.setOrganizations(organizationsArr);
    };
  }


}
