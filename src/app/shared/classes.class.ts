export interface Truck {
	DistrictID: number;
	DeliveryID: number;
	TruckNumber: number;
}

export interface DropAssignment {
	DistrictID: number;
	DeliveryID: number;
	TruckNumber: number;
  DropID: number | string;
  dropMovementDetails?: any[];
}

export interface Drop {
  DistrictID: number;
  DropID: number;
  DropName: string;
  Active: boolean;
}
