import { Common } from "../../service-common/common";
import { BankInfo } from "./bank-info";

export class BankAccountNumber {
  id!: number | undefined;
  so_tai_khoan!: string;
  ngan_hang!: BankInfo;
  loai_tien!: string;
  loai_tai_khoan!: string;
  ngay_mo!: Date;
  trang_thai!: string;

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
  }
}
