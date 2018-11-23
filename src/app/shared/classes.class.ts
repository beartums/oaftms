export interface Truck {
	DistrictID: number;
	DeliveryID: number;
	TruckNumber: number;
}

interface DeliveryDropInputAuditLog {
  DistrictID: number;
  DeliveryDropInputAuditLogID: number;
  DeliveryID: number;
  DeliveryStage: string;
  DropID: number;
  SeasonInputSizeID: number;
  InputID: number;
  BufferPerDrop: number;
  KgPerUnit: number;
  NumberOfUnits_ExcludingBuffer: number;
  LoggedDate: string;
  BufferPerDrop_Percent: number;
  TotalBuffer: number;
  PacketsPerBale: number;
}

export interface DropAssignment {
	DistrictID: number;
	DeliveryID: number;
	TruckNumber: number;
  DropID: number | string;
  ddials?: DeliveryDropInputAuditLog[];
  dropMovementDetails?: any[];
}

export interface Drop {
  DistrictID: number;
  DropID: number;
  DropName: string;
  Active: boolean;
}
