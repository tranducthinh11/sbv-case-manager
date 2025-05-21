import { CashInflow } from "./cash-inflow";
import { CashOutflow } from "./cash-outflow";

export class Transaction {
  id!: number | undefined;
  ten_doi_tuong!: string;
  so_dinh_danh!: string;
  tong_so_tien_vao!: string;
  tong_so_giao_dich_vao!: number;
  tong_so_tien_ra!: string;
  tong_so_giao_dich_ra!: number;
  dong_tien_vao!: CashInflow[];
  dong_tien_ra!: CashOutflow[];

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ten_doi_tuong = data.ten_doi_tuong;
    this.so_dinh_danh = data.so_dinh_danh;
    this.tong_so_tien_vao = data.tong_so_tien_vao;
    this.tong_so_giao_dich_vao = data.tong_so_giao_dich_vao;
    this.tong_so_tien_ra = data.tong_so_tien_ra;
    this.tong_so_giao_dich_ra = data.tong_so_giao_dich_ra;
    this.dong_tien_vao = data.dong_tien_vao;
    this.dong_tien_ra = data.dong_tien_ra;
  }
}
