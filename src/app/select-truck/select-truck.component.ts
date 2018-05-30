import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-select-truck',
  templateUrl: './select-truck.component.html',
  styleUrls: ['./select-truck.component.css']
})
export class SelectTruckComponent implements OnInit {

	current: any = {};
	data: any = {};
	selectors: any = {};
	view: any = {
		hideCreditCycles: true,
		isGoing: false,
		isLoggingOut: false
	};

	selectorKeys = [
		{p:'countries',s:'country'},
		{p:'districts', s:'district'},
		{p:'seasons', s:'season'},
		{p:'creditCycles', s:'creditCycle'},
		{p:'deliveries', s:'delivery'},
		{p:'trucks',s:'truck'},
	]

  constructor(private ds: DataService, private router: Router, private datePipe: DatePipe) {
	}

	ngOnInit() {
		// Save the selections in the data service and, if selections are made, fill the
		// child select box (e.g. id district is current, fill seasons)
		if (!this.ds.current) this.ds.current = {};
		if (!this.ds.selectors) this.ds.selectors = {};
		this.current = this.ds.current;
		this.selectors = this.ds.selectors;
		// fill the country list select box
		if (!this.selectors.countries) {
			this.data.countries = this.storeSelectors('countries',this.ds.fetchCountries());
		}
	}

	/**
	 * .current is an object holding all the currently-selected objects.  when
	 * one is changed, we need to clear all the selections below it since the change
	 * will make them INVALID
	 * @param {string} key text name of the object being changed
	 */
	clearCurrentStartingWith(key: string): void {
		let clearing = false;
		this.selectorKeys.forEach(selector => {
			if (!clearing && selector.p == key) clearing = true;
			if (clearing) {
				this.current[selector.s] = null;
				this.data[selector.p] = null;
				this.selectors[selector.p] = null;
			}
		})
	}

	/**
	 * Using the passed observable, fill the selector array in .selectors for
	 * the entity specified.  This is used by the <select> elements
	 * @type {string}	name of the entity to store the possible selections for
	 * @type {Observable<T>}	observable that will return an array of the specified entity
	 */
	storeSelectors<T>(selectorKey: string, selectorObservable: Observable<Array<T>>): Observable<Array<T>> {
		selectorObservable.subscribe( val => {
			this.selectors[selectorKey] = val
		});
		return selectorObservable;
	}

	/**
	 * Get the district options for the district select box
	 * @param {any} country Country for which to list the districts
	 */
	getDistricts(country: any):void {
		// hierarchy has the regions intervening, so must concatenate the district arrays
		// for each region.
		let selectorKey = 'districts';
		this.clearCurrentStartingWith(selectorKey);
		this.data[selectorKey] = this.storeSelectors( selectorKey, this.ds.fetchDistrictsFromCountryId(country.CountryID));
	}

	/**
	 * Get the list of seasons for this district for the season selct box
	 * @param {any} district District for which to return the seasons
	 */
	getSeasons(district: any): void {
		let selectorKey = 'seasons';
		this.clearCurrentStartingWith(selectorKey);
		this.data[selectorKey] = this.storeSelectors( selectorKey,
			  this.ds.fetchSeasons(district.DistrictID));
	}

	/**
	 * Get all the credit cycles for the passed season 
	 * @param season Object holding season id properties (ID and DistrictID)
	 */
	getCreditCycles(season: any): void {
		let selectorKey = 'creditCycles';
		this.clearCurrentStartingWith(selectorKey);
		this.data[selectorKey] = this.storeSelectors( selectorKey,
									this.ds.fetchCreditCycles(season.DistrictID, season.SeasonID));
		this.data[selectorKey].subscribe(creditCycles => {
			if (creditCycles.length == 1) {
				this.current.creditCycle = creditCycles[0];
				this.getDeliveries(creditCycles[0]);
				this.view.hideCreditCycles = true;
			} else {
				this.view.hideCreditCycles = false
			}
		});
	}

	getDeliveries(creditCycle: any): void {
		let selectorKey = 'deliveries';
		this.clearCurrentStartingWith(selectorKey);
		this.data[selectorKey] = this.storeSelectors( selectorKey,
									this.ds.fetchDeliveries(creditCycle.DistrictID, creditCycle.CreditCycleID));
	}

	getTrucks(delivery: any): void {
		let selectorKey = 'trucks';
		this.clearCurrentStartingWith(selectorKey);
		this.ds.fetchDropAssignments(delivery.DistrictID, delivery.DeliveryID)
				.subscribe(dropAssignments=> {
					// Aggregate DropAssignments by truck
					// storing in each truck the appropriate dropAssignments
					this.data.trucks = this.storeSelectors(selectorKey,this.ds.getTrucksFromDropAssignments(dropAssignments));
				});
	}

	setTruck(truck: any) {
		this.current.truck = truck;
	}

	getTruckDate(truck: any): string {
		if (!truck || !truck.Day) return '(unscheduled)';
		let date = this.datePipe.transform(truck.Day, 'yyyy-MM-dd');
		return date;
	}
	getTruckDescription(truck: any): string {
		let desc = this.getTruckDate(truck);
		desc += " - Truck ";
		desc += (truck && truck.TruckNumber) ? truck.TruckNumber : '??';
		desc += " - ";
		desc += (truck && truck.dropAssignments) ? truck.dropAssignments.length : 0
		desc += " drops";
		return desc;
	}

	/**
	 * All selections are made, go to confirm-route page
	 */
	go(): void {
		this.view.isGoing = true; // turn on spinner. errors caught by router, so no need to falsify
		this.router.navigate(['/confirm-route', {
			DistrictID: this.current.district.DistrictID,
			DeliveryID: this.current.delivery.DeliveryID,
			TruckNumber: this.current.truck.TruckNumber,
			Day: this.current.truck.Day
		}]);
	}

	logout(): void {
		this.view.isLoggingOut = true; // same as above.  No posible errors
		this.ds.logout(this.router);
	}

}
