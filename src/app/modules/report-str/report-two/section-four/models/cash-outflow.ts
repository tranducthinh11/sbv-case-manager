import {Common} from "../../service-common/common";

export class CashOutflow {
  id!: number | undefined;
  ho_ten_dich!: string;
  so_dinh_danh_dich!: string;
  so_tai_khoan_dich!: string;
  ten_ngan_hang_dich!: string;
  ma_ngan_hang_dich!: string;
  tong_so_tien!: number;
  tong_so_tien_quy_doi!: number;
  tong_so_giao_dich!: number;
  giao_dich_tu_ngay!: Date;
  giao_dich_den_ngay!: Date;
  loai_tien!: string;
  noi_dung!: string;

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ho_ten_dich = data.ho_ten_dich;
    this.so_dinh_danh_dich = data.so_dinh_danh_dich;
    this.so_tai_khoan_dich = data.so_tai_khoan_dich;
    this.ten_ngan_hang_dich = data.ten_ngan_hang_dich;
    this.ma_ngan_hang_dich = data.ma_ngan_hang_dich;
    this.tong_so_tien = data.tong_so_tien;
    this.tong_so_tien_quy_doi = data.tong_so_tien_quy_doi;
    this.tong_so_giao_dich = data.tong_so_giao_dich;
    this.giao_dich_tu_ngay = Common.convertNgbDateToDate(data.giao_dich_tu_ngay);
    this.giao_dich_den_ngay = Common.convertNgbDateToDate(data.giao_dich_den_ngay);
    this.loai_tien = data.loai_tien;
    this.noi_dung = data.noi_dung;
  }
}
