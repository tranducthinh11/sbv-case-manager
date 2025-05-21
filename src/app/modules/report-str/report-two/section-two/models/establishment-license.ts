import {Common} from "../../service-common/common";

export class EstablishmentLicense {
    id!: number | undefined;
    so_giay_phep!: string;
    ngay_cap!: Date;
    noi_cap!: string;

    constructor(
        data: any
    ) {
        this.id = data.id;
        this.so_giay_phep = data.so_giay_phep;
        this.ngay_cap = Common.convertNgbDateToDate(data.ngay_cap);
        this.noi_cap = data.noi_cap;
    }
}
