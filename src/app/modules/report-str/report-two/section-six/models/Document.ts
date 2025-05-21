
export class Document {
  id!: number | undefined;
  ma_loai_tai_lieu!: string;
  loai_tai_lieu!: string;
  mo_ta!: string;
  so_trang!: string;
  ten_file!: string;
  duong_dan!: string;
  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ma_loai_tai_lieu = data.ma_loai_tai_lieu;
    this.loai_tai_lieu = data.loai_tai_lieu;
    this.mo_ta = data.mo_ta;
    this.so_trang = data.so_trang;
    this.ten_file = data.ten_file;
    this.duong_dan = data.duong_dan;
  }
}
