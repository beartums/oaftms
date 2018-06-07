import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  from ,  forkJoin, of} from 'rxjs';
import { toArray, groupBy, mergeMap, map, take, catchError  } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { ObjectIndexService, IndexDefinition } from 'object-index-service';

import { Truck, DropAssignment, Drop } from './classes.class';

@Injectable()
export class DataService {

	dataUrl: string = 'api/';
	errorMessage: any;

	public data: any = {
		dropMovements: [],
	}

	public selectors = {};

	public current: any = {
			country: null,
			district: null,
			season: null,
			creditCycle: null,
			delivery: null,
			truckNumber: null
	}

	constructor(private indexService: ObjectIndexService, private httpClient: HttpClient) {
		this.fetchAllData().pipe(
			take(1)
		).subscribe(data => {
			this.createCatalogs(data);
		});
	}

	/**
	 * Delete all saved data when logging outlet
	 * @return {Boolean} ture if no errors
	 */
	clearData(): Boolean {
		// intended for logging out -- clear out all dataUrl
		try {
			this.current = {};
			this.selectors = {};
			this.data = {};
		} catch (e) {
			return e
		}
		return false;
	}

	fetch(endpoint:string, queryString?: string): Observable<any> {
		let url = this.dataUrl + endpoint;
		url += queryString ? '?' + queryString : '';
		let obs = this.httpClient.get(url);
		//obs.subscribe(e=>console.log(e),e=>console.log(e));
		return obs;
	}

	fetchAllData(): Observable<any> {
	 return this.httpClient.get(this.dataUrl + 'data');
	}

	fetchCountries(): Observable<any[]> {
		return this.fetch('Countries').pipe(
				map(countries=>{
					// ASSUMPTION: Always want these worted by country name
					countries.sort( (a,b) => {return a.Country>b.Country ? 1 : -1; });
					return countries;
				})
			);

	}

	fetchCreditCycles(districtId: number, seasonId: number): Observable<any[]> {
		let queryString: string = `DistrictID=${districtId}`;
		queryString += `&SeasonID=${seasonId}`;
		return this.fetch('CreditCycles', queryString)
			.pipe(
				map(ccs => {
					// Filter is only needed because inMemoryWebApi does partial matches
					return ccs.filter( a => {
										return a.DistrictID == districtId && a.SeasonID == seasonId
									})
									.sort((a,b) => { return a.CreditCycleID > b.CreditCycleID ? 1 : -1 })
				})
			);
	}

	fetchDeliveries(districtId: number, creditCycleId: number): Observable<any[]> {
		let queryString: string = `DistrictID=${districtId}`;
		queryString += `&CreditCycleID=${creditCycleId}`;
		return this.fetch('Deliveries', queryString)
			.pipe( map(deliveries => {
					// Filter is only needed because inMemoryWebApi does partial matches
					return deliveries.filter( a => {
							return a.DistrictID == districtId && a.CreditCycleID == creditCycleId
						})
						.sort((a,b) => { return a.DeliveryName > b.DeliveryName ? 1 : -1 })
				})
			);
	}

	fetchDistricts(regionId?: number): Observable<any[]> {
		let queryString: string = regionId ? `RegionID=${regionId}` : null;
		return this.fetch('Districts', queryString);
	}

	fetchDistrictsFromCountryId(countryId: number): Observable<any[]> {
		return this.fetch('Regions',`CountryID=${countryId}`)
			.pipe(map( regions => {
				let districts = [], districtListCount = 0;
				regions.forEach(region => {
						this.fetchDistricts(region.RegionID)
								.subscribe(districtlist => {
									// subscribe to the district list for each region then push
									// into the districts array so that can be used by the view
										districtlist.forEach( district => districts.push(district) );
										// when processing the final district list,
										// sort the districts alphabetically
										if (++districtListCount == regions.length) {
											districts.sort((a,b)=>{return a.DistrictName>b.DistrictName?1:-1;});
										}
								});
				});
				return districts;
			}));
	}

	fetchDrops(districtId: number, dropId?: number): Observable<any[]> {
		let queryString: string = `DistrictID=${districtId}`;
		queryString += dropId ? `&DropID=${dropId}` : '';
		return this.fetch('Drops', queryString)
			.pipe(
				map(das => {
					// Filter is only needed because inMemoryWebApi does partial matches
					let drops = das.filter( a => {
						return a.DistrictID == districtId && a.DropID == dropId
					});
					return drops
				})
			);
	}

	fetchDropAssignments(districtId: number, deliveryId: number): Observable<any[]> {
		let queryString: string = `DistrictID=${districtId}`;
		queryString += `&DeliveryID=${deliveryId}`;
		return this.fetch('DropAssignments', queryString)
			.pipe(
				map(das => {
					// Filter is only needed because inMemoryWebApi does partial matches
					let dropAssignments = das.filter( a => {
												return a.DistrictID == districtId && a.DeliveryID == deliveryId
											}).sort((a,b) => {
												if (a.TruckNumber > b.TruckNumber) return 1;
												if (a.TruckNumber < b.TruckNumber) return -1;
												if (a.DropOrder > b.DropOrder) return 1;
												if (a.DropOrder < b.DropOrder) return -1;
												return 0;
											});

					// drop assignments ned to be indexed
					this.indexService.deleteCatalog('DropAssignments')
					this.createCatalog('DropAssignments', dropAssignments, [
					 		new IndexDefinition('byDeliveryTruck',['DeliveryID','TruckNumber'], true),
							new IndexDefinition('byDeliveryDrop', ['DeliveryID','DropID'], true),
					]);
					return dropAssignments;
				})
			);
	}

	fetchSeasons(districtId: number): Observable<any[]> {
		let queryString: string = `DistrictID=${districtId}`;
		return this.fetch('Seasons', queryString)
			.pipe(
				map(seasons => {
					// Filter is only needed because inMemoryWebApi doesn't distinguish between
					// 1404 and 11404 and 21404.  In other words, NOT an exactly-equal relationship
					return seasons.filter( a => { return a.DistrictID == districtId })
												.sort((a,b) => { return a.SeasonName > b.SeasonName ? 1 : -1 })
				})
			);
	}

	fetchAndSetDrops(dropAssignments: any[]): Observable<any[]> {
		// ASSUMPTION: For only 1 district
		this.indexService.deleteCatalog('Drops');
		this.createCatalog('Drops', null, [
			new IndexDefinition('byDrop', ['DropID'],false)
		]);

		// more efficient with real API -- can use the 'in' operator?
		let observables = [];
		// only want to get the drops that we have dropAssignements for, so
		// put the requests in an array
		dropAssignments.forEach( da => {
			observables.push(this.fetchDrops(da.DistrictID, da.DropID))
		});

		let dropObservable = forkJoin(...observables)
			// Join the returned values, giving me an array of arrays
			// so concatenate the arrays
				.pipe(
					map((dropArrs: Array<Array<any>>)=> {
						return dropArrs.reduce( (allDrops,currDrops) => {
											return allDrops.concat(currDrops);
						}, [] );
					})
				);

		// returning the observable, but first grab the data and index it.
		dropObservable.subscribe(drops => {
			this.indexService.addAll('Drops',drops)
		});

		return dropObservable;
	}

	fetchDropMovements(districtId: number, deliveryId: number, dropId?: number): Observable<any[]> {
		let queryString: string = `DistrictID=${districtId}&DeliveryID=${deliveryId}`;
		queryString += dropId ? `&DropID=${dropId}` : '';
		return this.fetch('DeliveryDropInputAuditLogs', queryString)
			.pipe(
				map(ddials => {
					// Filter is only needed because inMemoryWebApi does partial matches
					let dropMovements = ddials.filter( a => {
						return a.DistrictID == districtId
										&& a.DeliveryID == deliveryId
										&& a.DropID == dropId
					});
					return dropMovements
				})
			);
	}

	fetchSeasonInputSizes(districtId: number, deliveryId: number): Observable<any[]> {
		let queryString: string = `DistrictID=${districtId}`;
		queryString += `&DeliveryID=${deliveryId}`;
		return this.fetch('SeasonInputSizes', queryString)
			.pipe(
				map(siss => {
					// Filter is only needed because inMemoryWebApi does partial matches
					let seasonInputSizes = siss.filter( a => {
												return a.DistrictID == districtId && a.DeliveryID == deliveryId
											});

					return seasonInputSizes;
				})
			);
	}

	fetchAndSetDropMovementDetails(dropAssignments: any[]): Observable<any[]> {
		this.indexService.deleteCatalog('DropMovementDetails');
		this.indexService.deleteCatalog('DropMovements');

		// ASSUMPTION: For only one district and delivery
		//
		// DropMovementDetails hold the raw DDIALs data
		this.createCatalog('DropMovementDetails', null, [
							new IndexDefinition('byDeliveryDrop', ['DeliveryId','DropID'], true),
							new IndexDefinition('byInput', ['InputID'], true),
							new IndexDefinition('bySeasonInputSize', ['SeasonInputSizeID'], true),
		]);
		// DropMovements will hold hold the District, Delivery, Drop, and Truck properties
		// along with a DropMovementDetails property that holds the raw data from DDIALs.
		// There will be an AGGREGATE DropMovement eintity with the DropID = 'warehouse'
		// for the initial warehouse load and final warehouse unload.
		this.createCatalog('DropMovements', null, [
							new IndexDefinition('byDeliveryDrop', ['DeliveryID','DropID'], false),
		]);

		let observables = [];
		dropAssignments.forEach( da => {
			observables.push(this.fetchDropMovements(da.DistrictID, da.DeliveryID, da.DropID))
		});

		let dmObservable = forkJoin(...observables)
			// Join the returned values, giving me an array of arrays
			// so concatenate the arrays
				.pipe(
					map((dmArrs: Array<Array<any>>)=> {
						return dmArrs.reduce( (allDms,currDms) => {
											return allDms.concat(currDms);
						}, [] );
					})
				);

		// returning the observable, but first grab the data and index it.
		dmObservable.subscribe(dms => {
			this.indexService.addAll('DropMovementDetails',dms)
		});

		return dmObservable;
	}

	fetchAndSetInputs(): Observable<any[]> {
		this.indexService.deleteCatalog('Inputs');
		// ASSUMPTION: For only one district and delivery
		this.createCatalog('Inputs', null, [
							new IndexDefinition('byInput', ['InputID'], false),
		]);

		let inputsObs = this.fetch('Inputs');

		inputsObs.subscribe( inputs => {
				this.indexService.addAll('Inputs',inputs);
		});
		return inputsObs;
	}

	fetchAndSetSeasonInputSizes(districtDelivery: any): Observable<any[]> {
		this.indexService.deleteCatalog('SeasonInputSizes');
		// ASSUMPTION: For only one district and delivery
		this.createCatalog('SeasonInputSizes', null, [
							new IndexDefinition('byInput', ['InputID'], true),
							new IndexDefinition('bySeasonInputSize', ['SeasonInputSizeID'], false),
		]);

		let siss = this.fetchSeasonInputSizes(districtDelivery.DistrictID,
			 						districtDelivery.DeliveryID);
		siss.subscribe( siss => {
				this.indexService.addAll('SeasonInputSizes', siss);
			});
		return siss;
	}

	getTrucksFromDropAssignments(dropAssignments: any[]): Observable<any[]> {
		// Turn the DropAssignments into a stream
		return from(dropAssignments).pipe(
				// Group them by truck number
				 groupBy( da => da.TruckNumber ),
				// Turn each group into an array of DropAssignments for the specified truck
				 mergeMap(group => group.pipe(toArray())),
				// 1st Array element will be standin for truck, since it has all the required
				// properties.  Add a dropAssignments property (which is all the drops assigned
				// to this truck) and walla.
				 map(t => Object.assign({dropAssignments: t},t[0])),
				// turn that stream into an array of trucks
				 toArray()
			 );
	}

	getUsers(filterObject?: any): any | any[] {
		let users = this.indexService.get('Users');
		if (!filterObject) return users;
    if (!filterObject.name && !filterObject.UserID)
              throw `Can only authenticate users by User Name or User Id`;
		if (!filterObject.password) throw 'Must have a password to authenticate';
		for (let i = 0; i < (<any[]>users).length; i++) {
			if (users[i].password != filterObject.password) continue;
			if (filterObject.name.toLowerCase()==users[i].name.toLowerCase()
				|| filterObject.email.toLowerCase()==users[i].email.toLowerCase())
					return [users[i]];
		}
		return null;
	}

	getDrop(drop:any): Drop {
		return this.indexService.get('Drops','byDrop',drop)
	}

	getDropAssignmentsByTruck(truck: any): any[] {
		return this.indexService.get('DropAssignments','byDeliveryTruck', truck)
	}

	getDropMovementDetails(drop: any): any {
		return this.indexService.get('DropMovementDetails','byDeliveryDrop',drop);
	}
	getDropMovementByDeliveryDrop(dropAssignment: DropAssignment) {
		return this.indexService.get('DropMovements', 'byDeliveryDrop', dropAssignment)
	}

	getDropMovement(drop: DropAssignment) {
		// Drop Movements are the entities (some old, whs new) containing the
		// data tracking the actual movements
		let dropMovement = this.getDropMovementByDeliveryDrop(drop);
		if (dropMovement) return dropMovement;

		dropMovement = Object.assign({},drop);

		// Drop movement info not created yet.  If it's not the WHS movement,
		// get the details, create an object, and store it in the index
		if (typeof drop.DropID != "string") {
			let dropMovementDetails = this.getDropMovementDetails(drop);
			dropMovement.dropMovementDetails = dropMovementDetails;
			// add to DropMovement IndexService
			this.indexService.add('DropMovements',dropMovement);
			return dropMovement
		}

		// If it's a warehouse movement, add up all the Drop movements and
		// create summary details, then create the object and save it.
		let dropMovementTotals = []

		let dropAssignments = this.getDropAssignmentsByTruck(drop);
		for (let i = 0; i < dropAssignments.length; i++) {
			let dropMovementDetails = this.getDropMovementDetails(dropAssignments[i]);
			for (let j = 0; j < dropMovementDetails.length; j++) {
				let movementPart = dropMovementDetails[j];
				let movementTotal = dropMovementTotals.find((movement) => {
					return movement.InputID == movementPart.InputID &&
							movement.SeasonInputSizeID == movementPart.SeasonInputSizeID
				});
				if (!movementTotal) {
					movementTotal = Object.assign({}, movementPart);
					dropMovementTotals.push(movementTotal);
				} else {
					movementTotal.NumberOfUnits_ExcludingBuffer += movementPart.NumberOfUnits_ExcludingBuffer;
					movementTotal.TotalBuffer += movementPart.TotalBuffer;
				}
			}
		}
		dropMovement.dropMovementDetails = dropMovementTotals;
		this.indexService.add('DropMovements',dropMovement);
		this.indexService.addAll('DropMovementDetails',dropMovementTotals);
		return dropMovement;
	}

	getDeliveryDropInputAuditLogs(deliveryDrop: any): any {
		return this.indexService.get('DeliveryDropInputAuditLogs', 'byDeliveryDrop', deliveryDrop);
	}

	getInput(input: any): any {
		return this.indexService.get('Inputs','byInput',input);
	}
	getSeasonInputSize(seasonInputSize: any): any {
		return this.indexService.get('SeasonInputSizes','bySeasonInputSize', seasonInputSize);
	}
		/*
		Setup the initial catalogs for downloaded data
	 */

	createCatalogs(data): void {
		// dataObservable.subscribe(data => {

				this.createCatalog('Users', data.Users, [
					new IndexDefinition('byName', ['name'],false),
					new IndexDefinition('byNamePassword', ['name', 'password'],false),
					new IndexDefinition('byEmailPassword', ['email', 'password'],false),
					new IndexDefinition('byId', ['UserID'],false),
				]);

				this.createCatalog('Inputs', data.Inputs, [
					new IndexDefinition('byInput', ['InputID'], false),
					new IndexDefinition('byInputType', ['InputType'], true),
					new IndexDefinition('byInputCategory', ['InputCategory'], true),
				]);

				this.createCatalog('SeasonInputSizes', data.SeasonInputSizes, [
					new IndexDefinition('byDeliveryInputSize', ['DistrictID', 'DeliveryID', 'InputID', 'SeasonInputSizeID'], false),
					new IndexDefinition('byDeliveryInput', ['DistrictID', 'DeliveryID', 'InputID'], true),
					new IndexDefinition('byDelivery', ['DistrictID', 'DeliveryID'], true),
				]);

				//console.log(this.indexService.catalogs);

		// 	}, error =>  this.errorMessage = <any>error
		// );

	}

	createCatalog(catalogName: string, data: any[], indexDefinitions: IndexDefinition[]) {
		let catalog = this.indexService.createCatalog(catalogName);
		for (let i = 0; i < indexDefinitions.length; i++) {
			let def = indexDefinitions[i];
			catalog.addIndex(def);
		}
		if (data) catalog.addAll(data);
		return catalog;
	}

	createIndexDefinition(name: string, keys: string[], isCollection: boolean): IndexDefinition {
		return new IndexDefinition(name, keys, isCollection);
	}


	/**
	 * Log user output
	 * @param  {Router} router Angular.Router from the calling component to allow navigation
	 * @return {void}
	 */
	logout(router): void {
		this.clearData();
		router.navigate(['/login']);
	}

}
