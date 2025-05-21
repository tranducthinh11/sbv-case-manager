import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment'; // Cần cài đặt moment.js nếu chưa có (npm install moment)

export class MomentDateFormatter extends NgbDateParserFormatter {
  // Định dạng ngày tháng bạn muốn sử dụng
  readonly DT_FORMAT = 'DD-MM-YYYY'; // Hoặc 'dd-mm-yyyy' tùy bạn

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = moment(value, this.DT_FORMAT);
      // Chú ý: month trong NgbDateStruct là 1-based, trong moment là 0-based
      return date.isValid() ? {
        year: date.year(),
        month: date.month() + 1,
        day: date.date()
      } : null;
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    // Chú ý: month trong NgbDateStruct là 1-based, trong moment là 0-based
    return date ? moment({ year: date.year, month: date.month - 1, day: date.day }).format(this.DT_FORMAT) : '';
  }
}
