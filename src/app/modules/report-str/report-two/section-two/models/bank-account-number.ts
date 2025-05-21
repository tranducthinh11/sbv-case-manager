import { PersonallyIdentifiableInformation } from "./personally-identifiable-information";
import {AuthorizedPersonInformation} from "./information-authorized-person";
import { Bank } from "./bank";
import {Common} from "../../service-common/common";

export class BankAccountNumber {
  id!: number | undefined;
  so_tai_khoan!: string;
  ngan_hang!: Bank;
  loai_tien!: string;
  loai_tai_khoan!: string;
  ngay_mo!: Date;
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
    this.ngay_mo = Common.convertNgbDateToDate(data.ngay_mo);
    this.trang_thai = data.trang_thai;
    this.nguoi_duoc_uy_quyen = Array.isArray(data.nguoi_duoc_uy_quyen) ? data.nguoi_duoc_uy_quyen.map((item: any) => new AuthorizedPersonInformation(item)) : [];
  }
}
