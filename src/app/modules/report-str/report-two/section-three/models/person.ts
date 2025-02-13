import { BankAccountNumber } from '../models/bank-account-number';

export class Person {
  id!: number | undefined;
  ho_ten!: string;
  ngay_sinh!: string;
  do_tuoi!: string;
  gioi_tinh!: string;
  quoc_tich!: string;
  nghe_nghiep!: string;
  chuc_vu!: string;
  dia_chi_quoc_gia!: string;
  dia_chi_tinh_thanh!: string;
  dia_chi_quan_huyen!: string;
  noi_o_quoc_gia!: string;
  noi_o_tinh_thanh!: string;
  noi_o_quan_huyen!: string;
  loai_dinh_danh!: string;
  so_dinh_danh!: string;
  co_quan_cap!: string;
  noi_cap!: string;
  ngay_cap!: string;
  ngay_het_han!: string;
  so_dien_thoai!: string;
  tai_khoan!: BankAccountNumber[];

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ho_ten = data.ho_ten;
    this.ngay_sinh = data.ngay_sinh;
    this.do_tuoi = data.do_tuoi;
    this.gioi_tinh = data.gioi_tinh;
    this.quoc_tich = data.quoc_tich;
    this.nghe_nghiep = data.nghe_nghiep;
    this.chuc_vu = data.chuc_vu;
    this.dia_chi_quoc_gia = data.dia_chi_quoc_gia;
    this.dia_chi_tinh_thanh = data.dia_chi_tinh_thanh;
    this.dia_chi_quan_huyen = data.dia_chi_quan_huyen;
    this.noi_o_quoc_gia = data.noi_o_quoc_gia;
    this.noi_o_tinh_thanh = data.noi_o_tinh_thanh;
    this.noi_o_quan_huyen = data.noi_o_quan_huyen;
    this.loai_dinh_danh = data.loai_dinh_danh;
    this.so_dinh_danh = data.so_dinh_danh;
    this.co_quan_cap = data.co_quan_cap;
    this.noi_cap = data.noi_cap;
    this.ngay_cap = data.ngay_cap;
    this.ngay_het_han = data.ngay_het_han;
    this.so_dien_thoai = data.so_dien_thoai;
    this.tai_khoan = data.tai_khoan;
  }
}
