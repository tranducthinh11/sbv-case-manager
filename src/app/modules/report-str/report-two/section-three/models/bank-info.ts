export class BankInfo {
  ma_ngan_hang!: string;
  ten_ngan_hang!: string;

  constructor(
    data: any
  ) {
    this.ma_ngan_hang = data.ma_ngan_hang;
    this.ten_ngan_hang = data.ten_ngan_hang;
  }
}
