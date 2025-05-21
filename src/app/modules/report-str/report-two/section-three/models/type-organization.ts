export class TypeOrganization {
  ma_loai_hinh!: string;
  mo_ta!: string;

  constructor(
    data: any
  ) {
    this.ma_loai_hinh = data.ma_loai_hinh;
    this.mo_ta = data.mo_ta;
  }
}
