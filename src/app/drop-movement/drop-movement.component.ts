import { IndexDefinition } from 'object-index-service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { breakpointsProvider, BreakpointsService, BreakpointEvent } from '../shared/breakpoint.service';

import { DataService } from '../shared/data.service';

import { Current } from '../data/defaultCurrent';
import { Catalogs } from '../data/defaultCatalogs';

const ROLES = {
	warehouse: [
		{name: "Truck Manager", abbreviation: "TM"},
		{name: "Warehouse Assistant", abbreviation: "WA"},
		{name: "Loading Manager", abbreviation: "LM"},
	],
	truck:[
		{name: "Truck Manager", abbreviation: "TM"},
		{name: "Field Officer", abbreviation: "FO"},
	]
}


@Component({
	selector: 'app-drop-movement',
	templateUrl: './drop-movement.component.html',
	styleUrls: ['./drop-movement.component.css'],
	providers: [breakpointsProvider()]
})
export class DropMovementComponent implements OnInit {

	private _C = {
		warehouse: 'warehouse',
		truck: 'truck',
		load: 'Load',
		unload: 'Unload',
	}

	data: any = {};
	params: any = {};
	view: any = {};
	subscriptions: any = {};
	signatures: any = {};
	signature1: any = null;

	role: string;
  roles = [];

  DefaultCurrent = Current;
  DefaultCatalogs = Catalogs;

	constructor(private ds: DataService, private activatedRoute: ActivatedRoute,
							private router: Router, private bps: BreakpointsService) { }

	ngOnDestroy() {
		if (this.subscriptions.router) this.subscriptions.router.unsubscribe();
		if (this.subscriptions.breakpointService) this.subscriptions.breakpointService.unsubscribe();
	}

	ngOnInit() {
		// watches breakpoints to allow us to show and hide different ways of
		// seeing the data based on size of the viewport
		this.subscriptions.breakpointService = this.bps.changes.subscribe((event:BreakpointEvent) => {
			this.view.size = event.name;
		});

		this.subscriptions.router = this.activatedRoute.paramMap.subscribe(params => {
						this.params = {
							DistrictID: params.get('DistrictID'),
							DeliveryID: params.get('DeliveryID'),
							TruckNumber: params.get('TruckNumber'),
							DropID: params.get('DropID'),
							direction: params.get('direction'),
							confirm: params.get('confirm') ? params.get('confirm') : null
						}

            // Load test data if starting on this page
            if (!this.ds.current.country) {
              this.ds.current = this.DefaultCurrent;
              for (let catName in this.DefaultCatalogs) {
                let cat = this.DefaultCatalogs[catName];
                let ids: IndexDefinition[] = [];
                for (let idName in cat.indexDefinitions) {
                  ids.push(cat.indexDefinitions[idName]);
                }
               this.ds.createCatalog(cat.entityName,cat.entities,                        ids);
              }

            }
						// // get the cached objects
						this.data = this.ds.current;

						// is this LOAD or UNLOAD
						this.data.movementType = this.params.direction == 'from' ? this._C.load : this._C.unload;

						// is this a confirmation page?  In which case no data entry is allowed.
						this.data.confirm = this.params['confirm']
															&& this.params['confirm'] !== 'false';

						// is this a page that shows expected values (load at warehouse
						// 		or unload at drops)?  If not, only allow blind
						// 		entry.  Otherwise, show expected values.
						this.data.showExpected = this.isDirectedMovement(this.data.movementType,
																						this.params)

						this.data.drop = this.params.DropID == this._C.warehouse ?
										{ DropName: this.data.district.DistrictName + ' Warehouse' }
										: this.ds.getDrop(this.params);

						this.data.dropMovement = this.ds.getDropMovement(this.params);
						this.data.dropMovementDetails =
									this.data.dropMovement.dropMovementDetails;

						// get the list of signees
						this.roles = this.params.DropID == this._C.warehouse ? ROLES[this._C.warehouse] : ROLES[this._C.truck];
						this.roles.forEach( role => this.signatures[role.abbreviation]=null);
						// Have to pre-generate DMDs and save in the index
						console.log('dropMovementComponentData',this.data);
		});
	}

  /**
   * Have all the responsible people signed to verify the Drop Movement totals?
   *
   * @param {any[]} [sigs] Array of signatures
   * @returns {boolean} True if all signatures are valid
   *
   * @memberOf DropMovementComponent
   */
  areAllSigned(sigs?: any[]): boolean {
		sigs = sigs || this.signatures;
		for (let prop in sigs) {
			if (!sigs[prop]) return false
		}
		return true;
	}

  /**
   * Navigate back to previous page
   *
   * @param {any} isConfirmation True if this is a confirmation page (returns
   *  to the drop movement edit page rather than the truck confirmation page)
   *
   * @memberOf DropMovementComponent
   */
  back(isConfirmation) {
		isConfirmation =
					isConfirmation === false || isConfirmation === true
				? isConfirmation : this.data.confirm;

		if (isConfirmation) {
			// return to data entry form
			this.params['confirm'] = "false"
			this.router.navigate(['/drop-movement', this.params]);
		} else {
			// return to the route confirmation page with this site incomplete

			// delete entered data??
			this.router.navigate(['confirm-route', this.params])
		}

	}

  /**
   * Navigate to the next page
   *
   * @param {string} dropId Current drop ID
   * @param {string} movementType Direction of the movement (Load/Unload)
   * @param {boolean} isConfirmation Am I navigating from a confirmation page?
   *
   * @memberOf DropMovementComponent
   */
  go(dropId: string, movementType: string, isConfirmation: boolean) {
		console.log(this.ds);
		if (!isConfirmation) {
			// Return to route confirmation page with this drop completed

			// Save signatures and data
			// Mark this DropAssignment as completed
			let navParams = Object.assign(this.params,{confirm: "true"});
			this.router.navigate(['/drop-movement', navParams]);
		}

	}

  /**
   * Does this movement get load/unload 'hints', or should it be blind
   *
   * @param {string} movementType Load/Unload
   * @param {*} params Route Params object
   * @returns {boolean} True if this movement gets 'hints'
   *
   * @memberOf DropMovementComponent
   */
  isDirectedMovement(movementType: string, params: any): boolean {
		if (movementType == this._C.unload && params.DropID == this._C.warehouse) return false;
		if (movementType == this._C.load && params.DropID != this._C.warehouse) return false;
		return true;
	}

		// get the total KG by aggregating for a warehouse load or by pulling a single drop
		// at a drop
  /**
   * Get the total KG by aggregating for a warehouse load or by pulling single drop
   *
   * @param {any[]} dropMovementDetails All drops included in this aggregate
   * @returns {number} Total for this movement
   *
   * @memberOf DropMovementComponent
   */
  getDropWeight(dropMovementDetails: any[]): number {
		let totalKg = 0;
		for (let i = 0; i < dropMovementDetails.length; i++) {
			let dmd = dropMovementDetails[i];
			let qty = dmd.NumberOfUnits_ExcludingBuffer + dmd.TotalBuffer;
			totalKg += qty * dmd.KgPerUnit;
		}

		return Math.round(totalKg);
	}

  /**
   * Get the total weight for everything entered on the tablet for this movement
   *
   * @param {any[]} dropMovementDetails All the drops included in this movement
   * @returns {number} Total entered for the passed drop details
   *
   * @memberOf DropMovementComponent
   */
  getEnteredWeight(dropMovementDetails: any[]): number {
		let totalKg = 0;
		for (let i = 0; i < dropMovementDetails.length; i++) {
			let dmd = dropMovementDetails[i];
			let qty = +(dmd.enteredPackets ? dmd.enteredPackets : 0);
			qty += +(dmd.enteredBales ? dmd.enteredBales * dmd.PacketsPerBale : 0);
			totalKg += qty * dmd.KgPerUnit;
		}

		return Math.round(totalKg);
	}

  /**
   * Get te difference between the entered weight and expected weight
   *
   * @param {any} dropMovementDetails Drop details to compare
   * @returns {number} Weight difference
   *
   * @memberOf DropMovementComponent
   */
  getWeightDiff(dropMovementDetails): number {
		let entered = this.getEnteredWeight(dropMovementDetails);
		let assigned = this.getDropWeight(dropMovementDetails);
		let diff = assigned - entered;
		if (diff!==0) return Math.abs(diff/assigned)
		else return 0;
	}

  /**
   * retrieve the String name and weight of an input for display purposes
   * in the format 'NAME (WEIGHT KG)' if WEIGHT > 1, otherwise 'NAME'
   *
   * @param {*} dropMovementDetail The single drop movement involved
   * @returns {string} formatted string of name and weight
   *
   * @memberOf DropMovementComponent
   */
  getInputNameAndWeight(dropMovementDetail: any): string {
		let input = this.ds.getInput(dropMovementDetail);
		let seasonInputSize = this.ds.getSeasonInputSize(dropMovementDetail);
		let name = input.InputName;
		let weight = seasonInputSize.UnitWeight;
		weight = weight < 1 ? '' : '(' + weight + ' Kg)';
		let nameAndWeight = name + ' ' + weight;
		return nameAndWeight.trim();
  }

  getInputColor(dropMovementDetail: any): string {
    let dmd = dropMovementDetail
    if (this.isNotEntered(dmd.enteredPackets)
        && this.isNotEntered(dmd.enteredBales)) {
          return "";
        }
    let expected = this.getDropWeight([dmd]);
    let entered = this.getEnteredWeight([dmd]);
    let diff = entered - expected;
    let variance = Math.abs(diff/expected);
    // HACK: DO NOT HARD CODE THESE VALUES
    if (variance > .1) {
      return 'text-danger'
    } else if (variance > .05) {
      return 'text-warning'
    } else {
      return 'text-success'
    }
  }

  /**
   * Retrieve the packet quantity for this item for this movement
   *
   * @param {*} dropMovementDetail Drop movement to use
   * @returns {number} Packet quantity
   *
   * @memberOf DropMovementComponent
   */
  getPacketQuantity(dropMovementDetail: any): number {
    let qty = dropMovementDetail.NumberOfUnits_ExcludingBuffer +
              dropMovementDetail.TotalBuffer;
		if (dropMovementDetail.PacketsPerBale) {
			qty = qty % dropMovementDetail.PacketsPerBale;
		} else {
			qty = qty;
		}
		return qty;
	}

  /**
   * Get the bale quatitiy for this item for this movement
   *
   * @param {*} dropMovementDetail The item detail
   * @returns {number} Bale Quantity
   *
   * @memberOf DropMovementComponent
   */
  getBaleQuantity(dropMovementDetail: any): number {
		let qty = dropMovementDetail.NumberOfUnits_ExcludingBuffer +
              dropMovementDetail.TotalBuffer;
		if (dropMovementDetail.PacketsPerBale) {
			qty = qty / dropMovementDetail.PacketsPerBale;
			qty = Math.floor(qty);
		}
		return qty;
	}

  /**
   * Initiate signature
   *
   * @param {string} role The role of the person signing
   * @param {*} modal The modal that will be invoked for the signature
   *
   * @memberOf DropMovementComponent
   */
  sign(role: string, modal: any) {
		this.role = role;
		let signature = this.signatures[role];
		modal.openModal(signature);
  }

  isNotEntered(value: number | string): boolean {
    return !value && value!==0
  }

}
