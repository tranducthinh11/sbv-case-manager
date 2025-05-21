export class Job {
  ma_nghe_nghiep!: string;
  mo_ta!: string;

  constructor(
    data: any
  ) {
    this.ma_nghe_nghiep = data.ma_nghe_nghiep;
    this.mo_ta = data.mo_ta;
  }
}
