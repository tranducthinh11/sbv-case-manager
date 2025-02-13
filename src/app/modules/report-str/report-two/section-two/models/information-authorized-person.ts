import { PersonallyIdentifiableInformation } from './personally-identifiable-information';
export class AuthorizedPersonInformation {
  id!: number | undefined;
  ho_ten!: string;
  quan_he_voi_chu_tai_khoan!: string;
  thong_tin_dinh_danh!: PersonallyIdentifiableInformation[];

  constructor(data: any) {
    this.id = data.id;
    this.ho_ten = data.ho_ten;
    this.quan_he_voi_chu_tai_khoan = data.quan_he_voi_chu_tai_khoan;
    this.thong_tin_dinh_danh = data.thong_tin_dinh_danh;
  }
}
