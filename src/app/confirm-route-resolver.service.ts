import { forkJoin ,  Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';

import { DataService }  from './shared/data.service';

@Injectable()
export class ConfirmRouteResolver implements Resolve<any> {
  constructor(private ds: DataService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
		let districtId = route.paramMap.get('DistrictID');
		let deliveryId = route.paramMap.get('DeliveryID');
		let truckNumber = route.paramMap.get('TruckNumber');

		// Drop Assignment keys passed as parameters
    let dropAssignments = this.ds.getDropAssignmentsByTruck({DeliveryID: deliveryId, TruckNumber: truckNumber});

		// collect the needed data for loading the confirm-route
		//
		return forkJoin(
			this.ds.fetchAndSetDrops(dropAssignments),
			this.ds.fetchAndSetDropMovementDetails(dropAssignments),
			this.ds.fetchAndSetInputs(),
			this.ds.fetchAndSetSeasonInputSizes({DistrictID: districtId, DeliveryID: deliveryId} )
		).pipe(
			map(([drops, dropMovementDetails, inputs, seasonInputSizes]) => {
				if (drops && dropMovementDetails && inputs && seasonInputSizes) {
					return {drops, dropMovementDetails, inputs, seasonInputSizes}
		    } else {
	        this.router.navigate(['/select-truck']);
	        return null;
	      }
	    })
		);
  }
}
