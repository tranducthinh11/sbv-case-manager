import { Injectable } from '@angular/core';
import { Document } from '../models/Document';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private documentListSubject = new BehaviorSubject<Document[]>([]);
  documentList$ = this.documentListSubject.asObservable();

  constructor() {}

  clear() {
    this.documentListSubject.next(null)
  }

  addDocument(document: Document) {
    const currentDocuments = this.documentListSubject.getValue();
    this.documentListSubject.next([...currentDocuments, document]);
  }

  getDocuments(): Document[] {
    return this.documentListSubject.getValue();
  }

  setdocuments(documents: Document[]) {
    this.documentListSubject.next(documents);
  }

  // Xóa cá nhân theo ID
  deletedocument(id: number | undefined) {
    if (id === undefined) return;
    const currentDocuments = this.documentListSubject.getValue();
    const updatedDocuments = currentDocuments.filter(document => document.id !== id);
    this.documentListSubject.next(updatedDocuments);
  }

  // Cập nhật thông tin cá nhân
  updatedocument(updatedDocument: Document) {
    const currentDocuments = this.documentListSubject.getValue();
    const updatedDocuments = currentDocuments.map(document =>
      document.id === updatedDocument.id ? updatedDocument : document
    );
    this.documentListSubject.next(updatedDocuments);
  }
  
}
