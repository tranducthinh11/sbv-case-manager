export class PersonallyIdentifiableInformation {
  id!: number | undefined;
  loai_dinh_danh!: string;
  so_dinh_danh!: string;
  ngay_cap!: string;
  ngay_het_han!: string;
  noi_cap!: string;

  constructor(data: any) {
    this.id = data.id;
    this.loai_dinh_danh = data.loai_dinh_danh;
    this.so_dinh_danh = data.so_dinh_danh;
    this.ngay_cap = data.ngay_cap;
    this.ngay_het_han = data.ngay_het_han;
    this.noi_cap = data.noi_cap;
  }
}
