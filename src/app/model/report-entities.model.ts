import { Summary } from "./summary.model";

export class ReportEntities{
    constructor(
    public id?: string,
    public report_entity_code?: string,
    public report_entity_name?: string,
    public enable?: string,
    public report_entity_additional_code?: string,
    public type_code?: string ,
    public type_name?: string ,
    public address?: string ,
    public district?: string,
    public province?: string,
    public country?: string,
    public phone?: string,
    public email?: string,
    public summary?: Summary[] | null
    ){}
}