import { BankAccountNumber } from './bank-account-number';
import {LegalRepresentative} from "./legal-representative";
import {CurrentResidence} from "./current-residence";
import {EstablishmentLicense} from "./establishment-license";
import { BussinessRegistrationNumber } from './business-registration-number';
import { TypeOrganization } from './type-organization';

export class Organization {
  id!: number | undefined;
  khach_hang_hien_huu!: string;
  ten_to_chuc!: string;
  ten_tieng_nuoc_ngoai!: string;
  ten_viet_tat!: string;
  loai_hinh_to_chuc!: TypeOrganization;
  dia_chi!: CurrentResidence;
  giay_phep_thanh_lap!: EstablishmentLicense;
  ma_so_doanh_nghiep!: BussinessRegistrationNumber;
  nganh_nghe_kinh_doanh!: string;
  so_dien_thoai!: string;
  website!: string;
  tai_khoan!: BankAccountNumber[];
  nguoi_dai_dien!: LegalRepresentative[];

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.khach_hang_hien_huu = data.khach_hang_hien_huu;
    this.ten_to_chuc = data.ten_to_chuc;
    this.ten_tieng_nuoc_ngoai = data.ten_tieng_nuoc_ngoai;
    this.ten_viet_tat = data.ten_viet_tat;
    this.loai_hinh_to_chuc = data.loai_hinh_to_chuc;
    this.dia_chi = data.dia_chi;
    this.giay_phep_thanh_lap = new EstablishmentLicense(data.giay_phep_thanh_lap);
    this.ma_so_doanh_nghiep = new BussinessRegistrationNumber(data.ma_so_doanh_nghiep);
    this.nganh_nghe_kinh_doanh = data.nganh_nghe_kinh_doanh;
    this.so_dien_thoai = data.so_dien_thoai;
    this.website = data.website;
    this.tai_khoan = Array.isArray(data.tai_khoan) ? data.tai_khoan.map((item: any) => new BankAccountNumber(item)) : [];
    this.nguoi_dai_dien = data.nguoi_dai_dien;
  }
}
