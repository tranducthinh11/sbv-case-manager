export class DashboardResponse {
    summary?: Array<CountModel>;
    myList?: CountModel[];
    
    
  }
  export class CountModel {
    creation_status: number;
    count: number;
  }