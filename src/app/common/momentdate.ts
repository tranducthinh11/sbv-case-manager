import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Injectable()
export class MomentDateFormatter extends NgbDateParserFormatter {

  readonly DT_FORMAT = 'DD/MM/YYYY';

  parse(value: string): NgbDateStruct | null {
    if (!value) return null;
    const m = moment(value, this.DT_FORMAT);
    return m.isValid() ? { day: m.date(), month: m.month() + 1, year: m.year() } : null;
  }

  format(date: NgbDateStruct | null): string {
    if (!date) return '';
    return moment({ year: date.year, month: date.month - 1, day: date.day }).format(this.DT_FORMAT);
  }
}
