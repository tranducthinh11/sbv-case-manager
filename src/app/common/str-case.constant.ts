export class STRConstant {

  public static myListStrCase: any[] = [
    {
      "code": "M1",
      "name": "Mẫu 1"
    },
    {
      "code": "M2",
      "name": "Mẫu 2"
    },
    {
      "code": "M3",
      "name": "Mẫu 3"
    },
    {
      "code": "M4",
      "name": "Mẫu 4"
    },
    {
      "code": "M5",
      "name": "Mẫu 5"
    },
    {
      "code": "M6",
      "name": "Mẫu 6"
    },
    {
      "code": "M7",
      "name": "Mẫu 7"
    }
  ];

  public static statusList: any[] = [
    {
      "code": "DANG_NHAP_LIEU",
      "name": "Đang nhập liệu"
    },
    {
      "code": "CHO_KIEM_SOAT",
      "name": "Chờ kiểm soát"
    },
    {
      "code": "KIEM_SOAT_CHUA_DAT",
      "name": "Kiểm soát chưa đạt"
    },
    {
      "code": "CHO_DUYET",
      "name": "Chờ phê duyệt"
    },
    {
      "code": "DA_GUI",
      "name": "Đã gửi cục PCRT"
    },
    {
      "code": "KHONG_PHE_DUYET",
      "name": "Không phê duyệt"
    },
    {
      "code": "PCRT_XAC_NHAN",
      "name": "Cục PCRT tiếp nhận"
    },
    {
      "code": "PCRT_HOAN",
      "name": "Cục PCRT hoàn trả"
    }
  ];

  public static myListUser: any[] = [
    {
      "code": "M1",
      "name": "Mẫu 1"
    },
    {
      "code": "M2",
      "name": "Mẫu 2"
    },
    {
      "code": "M3",
      "name": "Mẫu 3"
    },
    {
      "code": "M4",
      "name": "Mẫu 4"
    },
    {
      "code": "M5",
      "name": "Mẫu 5"
    },
    {
      "code": "M6",
      "name": "Mẫu 6"
    },
    {
      "code": "M7",
      "name": "Mẫu 7"
    }
  ];

  public static priorityList: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Danh sách điều khoản
  public static conditions = [
    {
      key: "Điều 26 - khoản 1 - điểm a: ",
      value: "Khi biết giao dịch được thực hiện theo yêu cầu của bị can, bị cáo, người bị kết án..."
    },
    {
      key: "Điều 27 - khoản 1: ",
      value: "Khách hàng từ chối cung cấp thông tin hoặc cung cấp thông tin nhận biết khách hàng không chính xác..."
    },
    {
      key: "Điều 27 - khoản 2: ",
      value: "Khách hàng thuyết phục đối tượng báo cáo không báo cáo giao dịch cho cơ quan nhà nước có thẩm quyền."
    },
    {
      key: "Điều 27 - khoản 3: ",
      value: "Không thể xác định được khách hàng theo thông tin khách hàng cung cấp hoặc giao dịch liên quan đến một bên không xác định được danh tính."
    },
    {
      key: "Điều 27 - khoản 4: ",
      value: "Số điện thoại do khách hàng cung cấp không thể liên lạc được hoặc không tồn tại số điện thoại này sau khi mở tài khoản hoặc thực hiện giao dịch."
    },
    {
      key: "Điều 27 - khoản 5: ",
      value: "Giao dịch được thực hiện theo lệnh hoặc theo ủy quyền của tổ chức, cá nhân có trong Danh sách cảnh báo."
    },
    {
      key: "Điều 27 - khoản 6: ",
      value: "Giao dịch mà qua thông tin nhận biết khách hàng hoặc qua xem xét về cơ sở kinh tế và pháp lý của giao dịch có thể xác định được mối liên hệ giữa các bên tham gia giao dịch với các hoạt động phạm tội hoặc có liên quan đến tổ chức, cá nhân có trong Danh sách cảnh báo."
    },
    {
      key: "Điều 27 - khoản 7: ",
      value: "Tổ chức, cá nhân tham gia giao dịch với số tiền lớn không phù hợp với hoạt động kinh doanh, thu nhập của tổ chức, cá nhân này."
    },
    {
      key: "Điều 27 - khoản 8: ",
      value: "Khách hàng yêu cầu đối tượng báo cáo thực hiện giao dịch không đúng trình tự, thủ tục theo quy định của pháp luật."
    },
    {
      key: "Điều 28 - khoản 1: ",
      value: "Có sự thay đổi đột biến trong doanh số giao dịch trên tài khoản; tiền vào và rút ra nhanh khỏi tài khoản; doanh số giao dịch lớn trong ngày nhưng số dư tài khoản rất nhỏ hoặc bằng không."
    },
    {
      key: "Điều 28 - khoản 2: ",
      value: "Các giao dịch chuyển tiền có giá trị nhỏ từ nhiều tài khoản khác nhau về một tài khoản hoặc ngược lại trong một thời gian ngắn; tiền được chuyển qua nhiều tài khoản; các bên liên quan không quan tâm đến phí giao dịch; thực hiện nhiều giao dịch, mỗi giao dịch gần mức giá trị lớn phải báo cáo."
    },
    {
      key: "Điều 28 - khoản 3: ",
      value: "Sử dụng thư tín dụng và các phương thức tài trợ thương mại khác có giá trị lớn bất thường, tỷ lệ chiết khấu với giá trị cao so với bình thường."
    },
    {
      key: "Điều 28 - khoản 4: ",
      value: "Khách hàng mở nhiều tài khoản tại tổ chức tín dụng, chi nhánh ngân hàng nước ngoài ở khu vực địa lý khác nơi khách hàng cư trú, làm việc hoặc có hoạt động kinh doanh."
    },
    {
      key: "Điều 28 - khoản 5: ",
      value: "Tài khoản của khách hàng đột nhiên nhận được một khoản tiền gửi hoặc chuyển tiền có giá trị lớn bất thường."
    },
    {
      key: "Điều 28 - khoản 6: ",
      value: "Chuyển số tiền lớn từ tài khoản của doanh nghiệp ra nước ngoài sau khi nhận được nhiều khoản tiền nhỏ được chuyển vào bằng chuyển tiền điện tử, séc, hối phiếu."
    },
    {
      key: "Điều 28 - khoản 7: ",
      value: "Tổ chức kinh tế có vốn đầu tư nước ngoài chuyển tiền ra nước ngoài ngay sau khi nhận được vốn đầu tư hoặc chuyển tiền ra nước ngoài không phù hợp với hoạt động kinh doanh; nhà đầu tư nước ngoài chuyển tiền ra nước ngoài ngay sau khi nhận được tiền từ nước ngoài chuyển vào tài khoản mở tại tổ chức tín dụng, chi nhánh ngân hàng nước ngoài hoạt động tại Việt Nam."
    },
    {
      key: "Điều 28 - khoản 8: ",
      value: "Khách hàng thường xuyên đổi tiền có mệnh giá nhỏ sang mệnh giá lớn."
    },
    {
      key: "Điều 28 - khoản 9: ",
      value: "Giao dịch gửi tiền, rút tiền hay chuyển tiền được thực hiện bởi tổ chức hoặc cá nhân liên quan đến tội phạm tạo ra tài sản bất hợp pháp đã được đăng tải trên phương tiện thông tin đại chúng."
    },
    {
      key: "Điều 28 - khoản 10: ",
      value: "Khách hàng yêu cầu vay số tiền tối đa được phép trên cơ sở bảo đảm bằng hợp đồng bảo hiểm nhân thọ đóng phí một lần ngay sau khi thanh toán phí bảo hiểm."
    },
    {
      key: "Điều 28 - khoản 11: ",
      value: "Thông tin về nguồn gốc tài sản sử dụng để tài trợ, đầu tư, cho vay hoặc ủy thác đầu tư của khách hàng không rõ ràng, minh bạch."
    },
    {
      key: "Điều 28 - khoản 12: ",
      value: "Thông tin về nguồn gốc tài sản bảo đảm của khách hàng đề nghị vay vốn không đầy đủ, không chính xác."
    },
    {
      key: "Điều 28 - khoản 13: ",
      value: "Có dấu hiệu nghi ngờ khách hàng sử dụng tài khoản cá nhân để thực hiện giao dịch liên quan đến hoạt động của tổ chức hoặc giao dịch thay cho đối tượng cá nhân khác."
    },
    {
      key: "Điều 28 - khoản 14: ",
      value: "Các giao dịch trực tuyến qua tài khoản liên tục thay đổi về thiết bị đăng nhập hoặc địa chỉ giao thức Internet (sau đây gọi là địa chỉ IP) ở nước ngoài."
    },
    {
      key: "Khác: ",
      value: "Dấu hiệu đáng ngờ khác do đối tượng báo cáo tự xác định"
    }
  ];

  // Danh sách kết luận cuối cùng
  public static finalConclusionConditions = [
    "Tội rửa tiền",
    "Tội phạm nguồn: Tội giết người;",
    "Tội phạm nguồn: Tội cố ý gây thương tích hoặc gây tổn hại cho sức khỏe của người khác;",
    "Tội phạm nguồn: Tội mua bán người;",
    "Tội phạm nguồn: Tội mua bán người dưới 16 tuổi;",
    "Tội phạm nguồn: Tội cướp tài sản",
    "Tội phạm nguồn: Tội bắt cóc nhằm chiếm đoạt tài sản",
    "Tội phạm nguồn: Tội trộm cắp tài sản",
    "Tội phạm nguồn: Tội lừa đảo chiếm đoạt tài sản",
    "Tội phạm nguồn: Tội lạm dụng tín nhiệm chiếm đoạt tài sản",
    "Tội phạm nguồn: Tội buôn lậu",
    "Tội phạm nguồn: Tội vận chuyển trái phép hàng hóa, tiền tệ qua biên giới",
    "Tội phạm nguồn: Tội sản xuất, buôn bán hàng cấm",
    "Tội phạm nguồn: Tội tàng trữ, vận chuyển hàng cấm",
    "Tội phạm nguồn: Tội sản xuất, buôn bán hàng giả",
    "Tội phạm nguồn: Tội trốn thuế",
    "Tội phạm nguồn: Tội làm, tàng trữ, vận chuyển, lưu hành tiền giả",
    "Tội phạm nguồn: Tội thao túng thị trường chứng khoán",
    "Tội phạm nguồn: Tội xâm phạm quyền tác giả, quyền liên quan",
    "Tội phạm nguồn: Tội vi phạm quy định về bảo vệ động vật hoang dã",
    "Tội phạm nguồn: Tội gây ô nhiễm môi trường",
    "Tội phạm nguồn: Tội vi phạm quy định về bảo vệ động vật nguy cấp, quý, hiếm",
    "Tội phạm nguồn: Tội tàng trữ trái phép chất ma túy",
    "Tội phạm nguồn: Tội vận chuyển trái phép chất ma túy",
    "Tội phạm nguồn: Tội mua bán trái phép chất ma túy",
    "Tội phạm nguồn: Tội chiếm đoạt chất ma túy",
    "Tội phạm nguồn: Tội khủng bố",
    "Tội phạm nguồn: Tội tài trợ khủng bố",
    "Tội phạm nguồn: Tội bắt cóc con tin",
    "Tội phạm nguồn: Tội chế tạo, tàng trữ, vận chuyển, sử dụng, mua bán trái phép hoặc chiếm đoạt vũ khí quân dụng, phương tiện kỹ thuật quân sự",
    "Tội phạm nguồn: Tội đánh bạc",
    "Tội phạm nguồn: Tội tổ chức đánh bạc hoặc gá bạc",
    "Tội phạm nguồn: Tội tham ô tài sản",
    "Tội nhận hối lộ",
    "Tội phạm nguồn: Tội lạm dụng chức vụ, quyền hạn chiếm đoạt tài sản",
    "Khác"
  ];

  public static ageRanges = [
    { value: '1', label: 'Dưới 20 tuổi' },
    { value: '2', label: 'Từ 20 tuổi đến dưới 30 tuổi' },
    { value: '3', label: 'Từ 30 tuổi đến dưới 40 tuổi' },
    { value: '4', label: 'Từ 40 tuổi đến dưới 50 tuổi' },
    { value: '5', label: 'Từ 50 tuổi trở lên' },
  ];

  public static genders = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ];

  public static identity_mapping = {
    "101": "Chứng minh nhân dân",
    "100": "Căn cước công dân",
    "103": "Hộ chiếu",
    "102": "Định danh cá nhân",
    "104": "Giấy Chứng minh sỹ quan quân đội nhân dân",
    "105": "Giấy CMND của Quân nhân chuyên nghiệp",
    "106": "Giấy chứng minh CAND",
    "197": "Thị thực nhập cảnh",
    "198": "Giấy tờ có giá trị đi lại quốc tế/ thẻ cư trú",
    "199": "Giấy tờ khác (dành cho khách hàng không có quốc tịch)"
  };

  public static mapping_job = {
    "1": "Công chức/viên chức",
    "2": "Học sinh/sinh viên",
    "3": "Giáo viên/bác sĩ",
    "4": "Nội trợ",
    "5": "Kinh doanh tự do",
    "6": "Kỹ sư",
    "7": "Công nhân",
    "8": "Nông dân",
    "9": "Khác"
  };

  public static  statusCaseManagerList: any[] = [
    {
      "code": "CHO_TIEP_NHAN",
      "name": "Chờ tiếp nhận"
    },
    {
      "code": "DANG_KIEM_TRA",
      "name": "Đang kiểm tra"
    },
    {
      "code": "DA_TIEP_NHAN",
      "name": "Đã tiếp nhận STR"
    },
    {
      "code": "CHO_DUYET_TRA_CP",
      "name": "Chờ LĐ Phòng duyệt trả lại"
    },
    {
      "code": "KHONG_DUYET_TRA_CP",
      "name": "LĐ Phòng không duyệt trả lại"
    },
    {
      "code": "CHO_DUYET_TRA_CC",
      "name": "Chờ LĐ Cục duyệt trả lại"
    },
    {
      "code": "KHONG_DUYET_TRA_CC",
      "name": "LĐ Cục không duyệt trả lại"
    },
    {
      "code": "DA_TRA_LAI",
      "name": "Đã trả lại"
    },
    {
      "code": "DA_TAO_HO_SO",
      "name": "Đã tạo hồ sơ"
    },
    {
      "code": "HOAN_THANH",
      "name": "Hoàn thành"
    }
  ]
}
