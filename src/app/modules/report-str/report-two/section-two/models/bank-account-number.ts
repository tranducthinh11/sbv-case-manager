import { PersonallyIdentifiableInformation } from "./personally-identifiable-information";
import {AuthorizedPersonInformation} from "./information-authorized-person";

export class BankAccountNumber {
  id!: number | undefined;
  so_tai_khoan!: string;
  ngan_hang!: string;
  loai_tien!: string;
  loai_tai_khoan!: string;
  ngay_mo!: string;
  trang_thai!: string;
  nguoi_duoc_uy_quyen!: AuthorizedPersonInformation[];

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.so_tai_khoan = data.so_tai_khoan;
    this.ngan_hang = data.ngan_hang;
    this.loai_tien = data.loai_tien;
    this.loai_tai_khoan = data.loai_tai_khoan;
    this.ngay_mo = data.ngay_mo;
    this.trang_thai = data.trang_thai;
    this.nguoi_duoc_uy_quyen = data.nguoi_duoc_uy_quyen;
  }
}
