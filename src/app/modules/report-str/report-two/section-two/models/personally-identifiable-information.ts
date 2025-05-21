import {Common} from "../../service-common/common";

export class PersonallyIdentifiableInformation {
  id!: number | undefined;
  loai_dinh_danh!: string;
  so_dinh_danh!: string;
  ngay_cap!: Date;
  ngay_het_han!: Date;
  co_quan_cap!: string;
  noi_cap!: string;

  constructor(data: any) {
    this.id = data.id;
    this.loai_dinh_danh = data.loai_dinh_danh;
    this.so_dinh_danh = data.so_dinh_danh;
    this.ngay_cap = Common.convertNgbDateToDate(data.ngay_cap);
    this.ngay_het_han = Common.convertNgbDateToDate(data.ngay_het_han);
    this.co_quan_cap = data.co_quan_cap;
    this.noi_cap = data.noi_cap;
  }
}
