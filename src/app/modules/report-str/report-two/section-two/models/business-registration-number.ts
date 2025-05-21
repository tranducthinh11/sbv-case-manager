import {Common} from "../../service-common/common";

export class BussinessRegistrationNumber {
    id!: number | undefined;
    ma_so!: string;
    ngay_cap!: Date;
    noi_cap!: string;

    constructor(
        data: any
    ) {
        this.id = data.id;
        this.ma_so = data.ma_so;
        this.ngay_cap = Common.convertNgbDateToDate(data.ngay_cap);
        this.noi_cap = data.noi_cap;
    }
}
