import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ICreateAccount, inits } from './create-account.helper';

@Component({
  selector: 'app-report-two',
  templateUrl: './report-two.component.html',
  styleUrls: ['./report-two.component.scss'],
})
export class ReportTwoComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {
    
  }

  formsCount = 7;
  account$: BehaviorSubject<ICreateAccount> =
    new BehaviorSubject<ICreateAccount>(inits);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private unsubscribe: Subscription[] = [];


  updateAccount = (part: Partial<ICreateAccount>, isFormValid: boolean) => {
    const currentAccount = this.account$.value;
    const updatedAccount = { ...currentAccount, ...part };
    this.account$.next(updatedAccount);
    this.isCurrentFormValid$.next(isFormValid);
  };

  nextStep() {
    const nextStep = this.currentStep$.value + 1;
    if (nextStep > this.formsCount) {
      return;
    }
    this.currentStep$.next(nextStep);
  }

  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  setTab(value:number){
    console.log( this.currentStep$.value)
    this.currentStep$.next(value);
  }

}
