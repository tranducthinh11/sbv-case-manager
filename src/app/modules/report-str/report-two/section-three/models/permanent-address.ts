export class PermanentAddress {
    id!: number | undefined;
    so_nha!: string;
    quan_huyen!: string;
    tinh_thanh!: string;
    quoc_gia!: string;

    constructor(
        data: any
    ) {
        this.id = data.id;
        this.so_nha = data.so_nha;
        this.quan_huyen = data.quan_huyen;
        this.tinh_thanh = data.tinh_thanh;
        this.quoc_gia = data.quoc_gia;
    }
}
