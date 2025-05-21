
export class Attachment {
  id!: number | undefined;
  strId!: number;
  caseId!: string;
  status!: string;
  attachmentType!: string;
  reportEntityName!: string;
  reportEntityCode!: string;
  pageCount!: number;
  description!: string;
  fileName!: string;
  fileType!: string;
  documentId!: string;
  docType!: string;
  localPath!: string;
  createdAt!: Date;
  createdBy!: string;
  deletedAt!: Date;
  deletedBy!: string;
  file!: any

  constructor(data: any) {
    this.id = data.id;
    this.strId = data.strId;
    this.caseId = data.caseId;
    this.status = data.status;
    this.attachmentType = data.attachmentType;
    this.reportEntityName = data.reportEntityName;
    this.reportEntityCode = data.reportEntityCode;
    this.pageCount = data.pageCount;
    this.description = data.description;
    this.fileName = data.fileName;
    this.fileType = data.fileName.split('.').pop()?.toLowerCase();
    this.documentId = data.documentId;
    this.docType = data.docType;
    this.localPath = data.localPath;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
    this.deletedAt = data.deletedAt;
    this.deletedBy = data.deletedBy;
    this.file = data.file;
  }
}
