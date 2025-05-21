import { BankAccountNumber } from '../models/bank-account-number';
import {CurrentResidence } from './current-residence';
import {PermanentAddress} from "./permanent-address";
import { Job } from './job';
import { Common } from '../../service-common/common';
import { PersonallyIdentifiableInformation } from './personally-identifiable-information';

export class Person {
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
  tai_khoan!: BankAccountNumber[];

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
    // this.thong_tin_dinh_danh = data.thong_tin_dinh_danh;
    this.thong_tin_dinh_danh = Array.isArray(data.thong_tin_dinh_danh) ? data.thong_tin_dinh_danh.map((item: any) => new PersonallyIdentifiableInformation(item)) : [];
    this.so_dien_thoai = data.so_dien_thoai;
    // this.tai_khoan = data.tai_khoan;
    this.tai_khoan = Array.isArray(data.tai_khoan) ? data.tai_khoan.map((item: any) => new BankAccountNumber(item)) : [];
  }
}
