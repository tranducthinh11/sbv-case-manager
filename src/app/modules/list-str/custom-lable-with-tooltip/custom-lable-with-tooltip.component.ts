import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
 

@Component({
  selector: 'custom-lable-with-tooltip',
  templateUrl: './custom-lable-with-tooltip.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class CustomLabelWithTooltipComponent implements OnInit {

  @Input()
  public label: any;

  @Input()
  public maxLength: number = 100;

  displayAll = false;

  constructor(
  ) { }

  ngOnInit(): void {
     
  }
 
  toggle() {
    this.displayAll = !this.displayAll;
  }

}
