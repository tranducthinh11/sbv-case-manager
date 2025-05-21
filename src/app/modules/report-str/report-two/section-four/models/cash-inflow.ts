import {Common} from "../../service-common/common";

export class CashInflow {
  id!: number | undefined;
  ho_ten_nguon!: string;
  so_dinh_danh_nguon!: string;
  so_tai_khoan_nguon!: string;
  ten_ngan_hang_nguon!: string;
  ma_ngan_hang_nguon!: string;
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
    this.ho_ten_nguon = data.ho_ten_nguon;
    this.so_dinh_danh_nguon = data.so_dinh_danh_nguon;
    this.so_tai_khoan_nguon = data.so_tai_khoan_nguon;
    this.ten_ngan_hang_nguon = data.ten_ngan_hang_nguon;
    this.ma_ngan_hang_nguon = data.ma_ngan_hang_nguon;
    this.tong_so_tien = data.tong_so_tien;
    this.tong_so_tien_quy_doi = data.tong_so_tien_quy_doi;
    this.tong_so_giao_dich = data.tong_so_giao_dich;
    this.giao_dich_tu_ngay = Common.convertNgbDateToDate(data.giao_dich_tu_ngay);
    this.giao_dich_den_ngay = Common.convertNgbDateToDate(data.giao_dich_den_ngay);
    this.loai_tien = data.loai_tien;
    this.noi_dung = data.noi_dung;
  }
}
