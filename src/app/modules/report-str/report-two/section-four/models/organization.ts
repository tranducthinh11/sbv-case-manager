
export class Organization {
  id!: number | undefined;
  ten_to_chuc!: string;
  ten_tieng_nuoc_ngoai!: string;
  ten_viet_tat!: string;
  loai_hinh_to_chuc!: string;
  nganh_nghe_kinh_doanh!: string;
  so_dien_thoai!: string;
  website!: string;

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ten_to_chuc = data.ten_to_chuc;
    this.ten_tieng_nuoc_ngoai = data.ten_tieng_nuoc_ngoai;
    this.ten_viet_tat = data.ten_viet_tat;
    this.loai_hinh_to_chuc = data.loai_hinh_to_chuc;
    this.nganh_nghe_kinh_doanh = data.nganh_nghe_kinh_doanh;
    this.so_dien_thoai = data.so_dien_thoai;
    this.website = data.website;
  }
}
