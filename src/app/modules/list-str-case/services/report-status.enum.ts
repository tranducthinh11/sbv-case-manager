export enum ReportStatusEnum {
    DRAF  = 'Đang nhập liệu',
    INPUTER_SUBMITED  = "Đang trình kiểm soát",
    AUTHORISER_NOT_APPROVED = "Kiểm soát STR chưa đạt",
    AUTHORISER_APPROVED = "Kiểm soát đồng ý",
    AUTHORISER_SUBMITED = "Đang trình phê duyệt",
    REPORTER_NOT_APPROVED = "Không duyệt gửi STR gửi Cục",
    REPORTER_APPROVED = "Đã duyệt gửi STR gửi Cục",
    // more
    //event
    SEND_AMLD = "ĐTBC gửi STR",
    ANALYST_RECEIVED = "Tiếp nhận STR",
    ANALYST_CONFIRMED = "Phản hồi chấp nhận xử lý",
    ANALYST_RETURNED = "Cán bộ yêu cầu trả lại STR",
    MANAGER_APPROVED = "LĐ Phòng duyệt trả lại",
    MANAGER_NOT_APPROVED = "LĐ Phòng không duyệt trả lại",
    DIRECTOR_APPROVED = "LĐ Cục duyệt trả lại",
    DIRECTOR_NOT_APPROVED = "LĐ Cục không duyệt trả lại",

    //str status
    CHO_TIEP_NHAN =	"Chờ tiếp nhận",
    DANG_KIEM_TRA =	"Đang kiểm tra",
    DA_TIEP_NHAN =	"Đã tiếp nhận",
    CHO_DUYET_TRA_CP =	"Chờ LĐ Phòng duyệt trả lại",
    KHONG_DUYET_TRA_CP =	"LĐ Phòng không duyệt trả lại",
    CHO_DUYET_TRA_CC =	"Chờ LĐ Cục duyệt trả lại",
    KHONG_DUYET_TRA_CC =	"LĐ Cục không duyệt trả lại",
    DA_TRA_LAI =	"Đã trả lại",
    DA_TAO_HO_SO =	"Đã tạo hồ sơ",
    HOAN_THANH =	"Hoàn thành"

  }
  