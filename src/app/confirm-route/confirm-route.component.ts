import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


import { Observable } from 'rxjs';

import { DataService } from '../shared/data.service';

@Component({
	selector: 'app-confirm-route',
	templateUrl: './confirm-route.component.html',
	styleUrls: ['./confirm-route.component.css']
})
export class ConfirmRouteComponent implements OnInit, OnDestroy {

	data: any = {};
	today: any = new Date();
	subscription: any;

	constructor(public ds: DataService, private router: Router,
			private activatedRoute: ActivatedRoute) {}

	ngOnInit() {
		this.subscription = this.activatedRoute.paramMap.subscribe(params => {
						let truck = {
							DistrictID: params.get('DistrictID'),
							DeliveryID: params.get('DeliveryID'),
							TruckNumber: params.get('TruckNumber'),
							Day: params.get('Day'),
							date: new Date(params.get('Day'))
						}

            this.data.truck = truck;
						this.populateDisplayEntities(truck);
		});
	}

	ngOnDestroy() {
		if (this.subscription) this.subscription.unsubscribe();
	}

	populateDisplayEntities(truck: any): void {

		this.data.delivery = this.ds.current.delivery;
		this.data.district = this.ds.current.district;
		this.data.dropAssignments = this.ds.current.truck.dropAssignments;

		// Should already be in DropOrder order, but what the heck;
		this.data.dropAssignments.sort((da1,da2)=>{
			if (da1.DropOrder > da2.DropOrder) return 1;
			return da1.DropOrder < da2.DropOrder ? -1 : 0;
		});

	}

	getDropAssignmentTotals(da: any): any {
		let ddials = this.ds.getDropMovementDetails(da);

		let totals = {
			NumberOfUnits_ExcludingBuffer: 0,
			NumberOfBufferUnits: 0,
			BufferKg: 0,
			TotalKg: 0,
		}

		for (let i = 0; i < ddials.length; i++) {
			totals.NumberOfUnits_ExcludingBuffer +=
				ddials[i].NumberOfUnits_ExcludingBuffer;
			totals.NumberOfBufferUnits += ddials[i].TotalBuffer;
			totals.BufferKg += ddials[i].TotalBuffer * ddials[i].KgPerUnit;
			totals.TotalKg +=
				ddials[i].NumberOfUnits_ExcludingBuffer * ddials[i].KgPerUnit + ddials[i].TotalBuffer * ddials[i].KgPerUnit;
		}

		return totals;
	}

	getTruckKg(dropAssignments: any[]): number {
		dropAssignments = dropAssignments || this.data.dropAssignments;
		let total = dropAssignments.reduce((tot,da) => {
			return tot + this.getDropAssignmentTotals(da).TotalKg;
		},0);
		return total;
	}

	go(): void {
		this.router.navigate(['/drop-movement',
													{	DistrictID: this.data.district.DistrictID,
														DeliveryID: this.data.delivery.DeliveryID,
														TruckNumber: this.data.truck.TruckNumber,
														DropID: 'warehouse',
														direction: 'from'
													}
												]);
	}
	 back(): void {
		 this.router.navigate(['/select-truck']);
	 }


}
