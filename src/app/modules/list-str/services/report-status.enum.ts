export enum ReportStatusEnum {
  
    DRAF  = 'Đang nhập liệu',
    INPUTER_SUBMITED  = "Chờ kiểm soát",

    AUTHORISER_NOT_APPROVED = "Kiểm soát STR chưa đạt",
    AUTHORISER_APPROVED = "Chờ duyệt",

    // AUTHORISER_SUBMITED = "Đang trình phê duyệt",

    REPORTER_APPROVED = "Đã gửi cục PCRT",
    REPORTER_NOT_APPROVED = "Không phê duyệt",

    PCRT_RECEIVED = "Cục PCRT tiếp nhận",
    PCRT_REJECTED = "Cục PCRT trả lại STR",

    // more
    // statusList = [
    //   { text: 'Đang nhập liệu', id: 0 },
    //   { text: 'Chờ kiểm soát', id: 1 },
    //   { text: 'Kiểm soát STR chưa đạt', id: 2 },
    //   { text: 'Chờ duyệt', id: 3 },
    //   { text: 'Đã gửi cục PCRT', id: 4 },
    //   { text: 'Không phê duyệt', id: 5 },
    //   { text: 'Cục PCRT tiếp nhận', id: 6 },
    //   { text: 'Cục PCRT trả lại STR', id: 7 },
    // ];
    
  }
  