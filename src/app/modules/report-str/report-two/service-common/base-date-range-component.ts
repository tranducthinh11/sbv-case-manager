import {Directive, OnInit} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

// Sử dụng abstract class vì đây là lớp nền không dùng trực tiếp
@Directive({})
export abstract class BaseDateRangeComponent implements OnInit {
  // Khai báo các thuộc tính ngày tháng
  nowDate!: NgbDateStruct;
  minDate!: NgbDateStruct;
  maxDate!: NgbDateStruct;

  ngOnInit(): void {
    // Logic tính toán ngày tháng
    const today = new Date();
    this.nowDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.minDate = { year: 1970, month: 1, day: 1 }; // Ví dụ
    this.maxDate = { year: today.getFullYear() + 100, month: 12, day: 31 }; // Ví dụ
  }
}
