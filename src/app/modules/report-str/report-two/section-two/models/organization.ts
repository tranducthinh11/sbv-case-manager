import { BankAccountNumber } from './bank-account-number';
import {LegalRepresentative} from "./legal-representative";

export class Organization {
  id!: number | undefined;
  ten_to_chuc!: string;
  ten_tieng_nuoc_ngoai!: string;
  ten_viet_tat!: string;
  loai_hinh_to_chuc!: string;
  so_nha!: string;
  quan_huyen!: string;
  tinh_thanh!: string;
  quoc_gia!: string;
  so_giay_phep!: string;
  ngay_cap!: string;
  noi_cap!: string;
  ms_ma_so!: string;
  ms_ngay_cap!: string;
  ms_noi_cap!: string;
  nghanh_nghe_kinh_doanh!: string;
  so_dien_thoai!: string;
  tai_khoan!: BankAccountNumber[];
  nguoi_dai_dien!: LegalRepresentative[];

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ten_to_chuc = data.ten_to_chuc;
    this.ten_tieng_nuoc_ngoai = data.ten_tieng_nuoc_ngoai;
    this.ten_viet_tat = data.ten_viet_tat;
    this.loai_hinh_to_chuc = data.loai_hinh_to_chuc;
    this.so_nha = data.so_nha;
    this.quan_huyen = data.quan_huyen;
    this.tinh_thanh = data.tinh_thanh;
    this.quoc_gia = data.quoc_gia;
    this.so_giay_phep = data.so_giay_phep;
    this.ngay_cap = data.ngay_cap;
    this.noi_cap = data.noi_cap;
    this.ms_ma_so = data.ms_ma_so;
    this.ms_ngay_cap = data.ms_ngay_cap;
    this.ms_noi_cap = data.ms_noi_cap;
    this.nghanh_nghe_kinh_doanh = data.nghanh_nghe_kinh_doanh;
    this.so_dien_thoai = data.so_dien_thoai;
    this.tai_khoan = data.tai_khoan;
    this.nguoi_dai_dien = data.nguoi_dai_dien;
  }
}
