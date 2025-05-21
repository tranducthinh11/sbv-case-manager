export class DashboardResponse {
    summary?: Array<CountModel>;
    myList?: CountModel[];
    countAllSTR?: number;
    
  }
  export class CountModel {
    info: string;
    count: number;
  }