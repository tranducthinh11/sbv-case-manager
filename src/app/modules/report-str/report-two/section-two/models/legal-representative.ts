import {PersonallyIdentifiableInformation} from "./personally-identifiable-information";

export class LegalRepresentative {
  id!: number | undefined;
  ho_ten!: string;
  ngay_sinh!: string;
  nghe_nghiep!: string;
  chuc_vu!: string;
  dia_chi_thuong_tru!: string;
  noi_o_hien_tai!: string;
  so_dien_thoai!: string;
  thong_tin_dinh_danh: PersonallyIdentifiableInformation[];

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ho_ten = data.ho_ten;
    this.ngay_sinh = data.ngay_sinh;
    this.nghe_nghiep = data.nghe_nghiep;
    this.chuc_vu = data.chuc_vu;
    this.dia_chi_thuong_tru = data.dia_chi_thuong_tru;
    this.noi_o_hien_tai = data.noi_o_hien_tai;
    this.so_dien_thoai = data.so_dien_thoai;
    this.thong_tin_dinh_danh = data.thong_tin_dinh_danh;
  }
}
