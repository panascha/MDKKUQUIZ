export interface OffHour {
  _id: string;
  owner: {
    _id: string;
    name?: string;
  };
  startDate: string;
  endDate: string;
  description: string;
  isForAllDentist: boolean;
  createdAt: string;
}
