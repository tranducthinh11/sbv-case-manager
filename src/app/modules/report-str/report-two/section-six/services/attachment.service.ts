import { Injectable } from '@angular/core';
import { Attachment } from '../models/Attachment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private documentListSubject = new BehaviorSubject<Attachment[]>([]);
  documentList$ = this.documentListSubject.asObservable();

  constructor() {}

  remove() {
    this.documentListSubject.next([])
  }

  clear() {
    let updatedDocuments = [...this.documentListSubject.getValue()]; // Tạo bản sao mới
    updatedDocuments = updatedDocuments.filter(item => item.id !== undefined);
    this.documentListSubject.next(updatedDocuments);
  }

  add(document: Attachment) {
    const currentDocuments = this.documentListSubject.getValue();
    this.documentListSubject.next([...currentDocuments, document]);
  }

  set(documents: Attachment[]) {
    this.documentListSubject.next(documents);
  }

  delete(id: number | undefined, index: number) {
    let updatedDocuments = [...this.documentListSubject.getValue()]; // Tạo bản sao mới
    if (id) {
      updatedDocuments = updatedDocuments.map(attechment =>
        attechment.id === id ? { ...attechment, status: 'delete', deletedAt: new Date() } : attechment
      );
    } else {
      let arrTmp = updatedDocuments.filter(item => item.status == 'ACTIVE');
      updatedDocuments.splice(updatedDocuments.indexOf(arrTmp[index]), 1);
    }
    this.documentListSubject.next(updatedDocuments); // Cập nhật lại subject
  }
}
