import { CurrentResidence } from './current-residence';
import { Job } from './job';
import { PermanentAddress } from './permanent-address';
import {PersonallyIdentifiableInformation} from "./personally-identifiable-information";
import {Common} from "../../service-common/common";

export class OtherOwner {
  id!: number | undefined;
  ho_ten!: string;
  ngay_sinh!: Date;
  do_tuoi!: string;
  gioi_tinh!: string;
  quoc_tich!: string;
  nghe_nghiep!: Job;
  chuc_vu!: string;
  dia_chi_thuong_tru!: PermanentAddress;
  noi_o_hien_tai!: CurrentResidence;
  thong_tin_dinh_danh!: PersonallyIdentifiableInformation[];
  so_dien_thoai!: string;

  constructor(
    data: any
  ) {
    this.id = data.id;
    this.ho_ten = data.ho_ten;
    this.ngay_sinh = Common.convertNgbDateToDate(data.ngay_sinh);
    this.do_tuoi = data.do_tuoi;
    this.gioi_tinh = data.gioi_tinh;
    this.quoc_tich = data.quoc_tich;
    this.nghe_nghiep = data.nghe_nghiep;
    this.chuc_vu = data.chuc_vu;
    this.dia_chi_thuong_tru = data.dia_chi_thuong_tru;
    this.noi_o_hien_tai = data.noi_o_hien_tai;
    this.thong_tin_dinh_danh = Array.isArray(data.thong_tin_dinh_danh) ? data.thong_tin_dinh_danh.map((item: any) => new PersonallyIdentifiableInformation(item)) : [];
    this.so_dien_thoai = data.so_dien_thoai;
  }
}
