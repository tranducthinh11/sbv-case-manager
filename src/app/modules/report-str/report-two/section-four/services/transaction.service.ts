import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionListSubject = new BehaviorSubject<Transaction[]>([]);
  transactionList$ = this.transactionListSubject.asObservable();

  constructor() { }

  clear() {
    this.transactionListSubject.next(null)
  }

  addTransaction(transaction: Transaction) {
    const currentTransactions = this.transactionListSubject.getValue();
    this.transactionListSubject.next([...currentTransactions, transaction]);
  }

  setTransaction(transactions: Transaction[]) {
    this.transactionListSubject.next(transactions);
  }

  getTransactions(): Transaction[] {
    return this.transactionListSubject.getValue();
  }

  // Xóa cá nhân theo ID
  deleteTransaction(id: number | undefined) {
    if (id === undefined) return;
    const currentTransactions = this.transactionListSubject.getValue();
    const updatedTransactions = currentTransactions.filter(transaction => transaction.id !== id);
    this.transactionListSubject.next(updatedTransactions);
  }

  // Cập nhật thông tin cá nhân
  updateTransaction(updatedTransaction: Transaction) {
    const currentTransactions = this.transactionListSubject.getValue();
    const updatedTransactions = currentTransactions.map(transaction =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    );
    this.transactionListSubject.next(updatedTransactions);
  }
}
