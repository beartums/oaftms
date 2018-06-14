import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import * as _ from 'lodash';

import { HttpClientModule } from '@angular/common/http'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SelectTruckComponent } from './select-truck.component';
import { DataService } from '../shared/data.service';
import { ObjectIndexService } from 'object-index-service';

describe('SelectTruckComponent', () => {
  let component: SelectTruckComponent;
  let fixture: ComponentFixture<SelectTruckComponent>;
	let dsSpy, ssSpy;
	class mockDs {
		fetchCountries() { return of([countries]) }
		logout() { return {} }
	};

	const countries = [{CountryId:1,Country:'YugestCountry'}]

		//jasmine.createSpyObj("DataService",
		// [ 'fetchCountries', 'fetchDistrictsFromCountryId', 'fetchSeasons',
		//  'fetchCreditCycles',	'fetchDeliveries', 'fetchDropAssignments',
		//  'getTrucksFromDropAssignments',"logout"]
	 // );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
			providers: [ //DataService,
										{ provide: DataService, useClass: mockDs },
										ObjectIndexService, DatePipe	],
			imports: [ FormsModule, HttpClientTestingModule,
									RouterTestingModule.withRoutes([
										{ path: '**', redirectTo: '/', pathMatch: 'full' }
									]) ],
      declarations: [ SelectTruckComponent ]
    })
    .compileComponents();
  }));

	// separating these tests so that the fixture is not updatesd until after spies aren
	//  in place so that we can spyon the ngOnInit function

	describe("Initialization and constructor tests", () => {
		it('should create',	() => {
			fixture = TestBed.createComponent(SelectTruckComponent);
	    component = fixture.componentInstance;
	    fixture.detectChanges();

			expect(component).toBeTruthy();
	  });
		it('should load the countries selection array',	() => {
			fixture = TestBed.createComponent(SelectTruckComponent);
	    component = fixture.componentInstance;
			let dsSpy = spyOn(component["ds"],'fetchCountries').and.returnValue(of(countries));
		  let ssSpy = spyOn(component,'storeSelectors').and.callThrough();
	    fixture.detectChanges();
			expect(ssSpy).toHaveBeenCalled();
			expect(dsSpy).toHaveBeenCalled();
			expect(component.selectors['countries'].length).toEqual(1);
	  });
		it('should show the spinner until the countries are populated',	() => {
			fixture = TestBed.createComponent(SelectTruckComponent);
	    component = fixture.componentInstance;
			// Spinner template should appear in place of countries when there are
			// no countries.  This emulates the inital load when the countries haven'
			// downloaded yet
			let dsSpy = spyOn(component["ds"],'fetchCountries')
														.and.returnValue(of(null));
			fixture.detectChanges();
			let spinner = fixture.nativeElement.querySelector('#countries #spinner-template')
			let countrySelector =	fixture
															.nativeElement.querySelector('#countries select:enabled')
			expect(spinner).toBeTruthy();
			expect(countrySelector).toBeFalsy();
			//tick();
			// once there are countries, the selector appears
			component.selectors.countries = [{}];
			fixture.detectChanges();
			spinner = fixture.nativeElement.querySelector('#countries #spinner-template')
			countrySelector = fixture.nativeElement.querySelector('#countries select:enabled')
			expect(countrySelector).toBeTruthy();
			expect(spinner).toBeFalsy();
			//discardPeriodicTasks()
	  });

	});

	describe("Post-initialization tests", () => {
		beforeEach(() => {
			fixture = TestBed.createComponent(SelectTruckComponent);
	    component = fixture.componentInstance;
			component.view.hideCreditCycles = false;
			fixture.detectChanges();
	  });

		// tests for the selectors are basically the same.  The params array will collect the
		// needed data for each set of tests.
		let params: any[] = [];
		// Data for the repeated tests
		//   Functions being called when the selection is changed
		let changeFuncs = ['getDistricts','getSeasons','getCreditCycles',
												'getDeliveries','getTrucks','setTruck'];
		// 	 Descriptive names of the select elements
		let names = ['Country','District','Season','CreditCycle','Delivery','Truck'];
		// 	 HTML Id attribute for each select element (zlso the key in the .current object)
		let currentKeys = ['country','district','season','creditCycle','delivery','truck'];
		// 	 key in the .selectors object
		let selectorKeys =  ['countries','districts','seasons',
													'creditCycles','deliveries','trucks'];
		// 	 names for genetating selector data
		let locationNames = ['Wingnutistan','Libtopia','Bungomafornia','Kakamegaton']

		// 	 function used to generate pseudo-random array of selectors for tests

		let generateSelectors = function(entity) {
			let x = Math.floor(Math.random()*4);
			let objs = [];
			for (let y=0; y<=x;y++) {
				let obj: any = {}
				obj[`${entity}Name`] = locationNames[y];
				obj[`${entity}Id`] = y;
				if (entity=="Truck") {
					obj["Day"] = new Date();// + Math.floor(Math.random() * 30);
					obj["Day"] += Math.floor(Math.random() * 30);
					obj["TruckNumber"] = Math.floor(Math.random() * 100);
					obj["dropAssignments"] = Array(Math.ceil(Math.random()*10)).fill({});
				} else if (entity=="Country") {
					obj['Country'] = locationNames[y];
				}
				objs.push(obj);
			}
			return objs;
		}

		// build the param entity.  This needs to be built ahead of time so that these
		// tests can be run in random order.

		for (let i = 1; i < names.length; i++) {
			// one param for each selector, starting with districts
			let param= {
				entity: names[i],		// name of the entity being tested; eg Season;
				parent: names[i-1],	// name of the entity's parent; eg District
				selector: selectorKeys[i],  // what this selector is selecting (plural)
				id: selectorKeys[i].toLowerCase(), // HTML id of this selector
				changeFunc: changeFuncs[i], // procs called by changing the selector, for spying
				key: currentKeys[i],
				parentKey: currentKeys[i-1],	// key to the component.current object for this entity's parent
				current: {}, 	// what the component.current object should look like for the beggining of these tests
				selectors: {}	// what the component.selectors object should look like for the beggining of these tests
			}
			// setup the current and selectors object.  When the test for a selector starts,
			// the current object will not have a parent selected (disabled selector) but Will
			// have the parent selectors downloaded

			for (let j = 0; j <= i; j++) {
				let selectors =  generateSelectors(names[j])
				param.selectors[selectorKeys[j]] = selectors;
				if (j<i) param.current[currentKeys[j]] = selectors[Math.floor(Math.random() * selectors.length)];
			}
			params.push(param);
		}
		// okay, now use each param set for the series of tests
		params.forEach( param => {
			describe(`${param.entity} Selector`, () => {
				it(`should be disabled if ${param.parent} has not been selected`,	() => {
					// clone these, so that changes can be made without affecting future tests
					// using these values -- needed because the tests are run in random order
					component.current = _.cloneDeep(param.current);
					component.selectors = _.cloneDeep(param.selectors);
					delete component.current[param.parentKey];
					delete component.selectors[param.selector];
					fixture.detectChanges()
					let el = fixture.nativeElement.querySelector(`#${param.id} select`)
					expect(el).toBeTruthy();
					expect(el.disabled).toBe(true);
			  });
				it(`should show spinner if ${param.selector} are being downloaded`,	() => {
					// clone these, so that changes can be made without affecting future tests
					// using these values -- needed because the tests are run in random order
					component.current = _.cloneDeep(param.current);
					component.selectors = _.cloneDeep(param.selectors);
					delete component.selectors[param.selector];
					fixture.detectChanges();
					let el = fixture.nativeElement.querySelector(`#${param.id}  #spinner-template`)
					let selector = fixture.nativeElement.querySelector(`#${param.id} select`)
					expect(el).toBeTruthy();
					expect(selector).toBeFalsy();
			  });
				it(`should still be disabled if there are no ${param.selector} in the downloaded list`,	fakeAsync(() => {
					// clone these, so that changes can be made without affecting future tests
					// using these values -- needed because the tests are run in random order
					component.current = _.cloneDeep(param.current);
					component.selectors = _.cloneDeep(param.selectors);
					component.selectors[param.selector] = [];
					// this test requires two ticks and change detections.  Current theory is
					// the nested ngIf statements followed by the calculated 'disabled' attribute
					// require two successive updates before resolving
					tick();
					fixture.detectChanges()
					tick();
					fixture.detectChanges()
					let el = fixture.nativeElement.querySelector(`#${param.id} #spinner-template`)
					let selector = fixture.nativeElement.querySelector(`#${param.id} select`)

					expect(el).toBeFalsy();
					expect(selector).toBeTruthy();
					expect(selector.disabled).toBe(true);
			  }));
				it(`should be selectable if the ${param.selector} are downloaded`,	() => {
					component.current = _.cloneDeep(param.current);
					component.selectors = _.cloneDeep(param.selectors);
					fixture.detectChanges()
					let el = fixture.nativeElement.querySelector(`#${param.id} #spinner-template`)
					let selector = fixture.nativeElement.querySelector(`#${param.id} select`)
					expect(el).toBeFalsy();
					expect(selector).toBeTruthy();
					expect(selector.disabled).toBe(false);
			  });
				it(`should call the change function ${param.changeFunc} setup/setting values`, () => {
					let spy = spyOn(component,param.changeFunc);
					component.current = param.current;
					component.selectors = param.selectors;
					fixture.detectChanges();
					let selector = fixture.nativeElement.querySelector(`#${param.id} select`);
					selector.dispatchEvent(new Event("change"));
					expect(spy).toHaveBeenCalled();
				});
				it(`should have .selectedIndex equal to index of the ${param.key}`, fakeAsync(() => {
					component.current = param.current;
					component.selectors = param.selectors;
					let selectors = component.selectors[param.selector];
					component.current[param.key] = selectors[Math.floor(Math.random()*selectors.length)]
					tick();
					fixture.detectChanges();
					tick();
					fixture.detectChanges();
					let selector = fixture.nativeElement.querySelector(`#${param.id} select`)
					expect(selector.selectedIndex)
								.toEqual(component.selectors[param.selector]
									.indexOf(component.current[param.key]));
					// spy on the change function to stub it and avoid http calls
					let spy = spyOn(component,param.changeFunc);
					for (let i = 0; i < component.selectors[param.selector].length; i++) {
						selector.selectedIndex=i
						selector.dispatchEvent(new Event("change"));
						fixture.detectChanges();
						expect(component.current[param.key])
																.toEqual(component.selectors[param.selector][i]);
					}
				}));
				it(`should change the model to match the selected ${param.key}`, fakeAsync(() => {
					component.current = param.current;
					component.selectors = param.selectors;
					tick();
					fixture.detectChanges();
					tick();
					fixture.detectChanges();
					let selector = fixture.nativeElement.querySelector(`#${param.id} select`)
					// spy on the change function to stub it and avoid http calls
					let spy = spyOn(component,param.changeFunc);
					for (let i = 0; i < component.selectors[param.selector].length; i++) {
						selector.selectedIndex=i
						selector.dispatchEvent(new Event("change"));
						fixture.detectChanges();
						expect(component.current[param.key])
																.toEqual(component.selectors[param.selector][i]);
					}
				}));
			});
		});  // parms.forEach
		describe("Logout Button", () => {
			it("should show spinner after clicked", () => {
				let btn = fixture.nativeElement.querySelector(`#buttonLogout`);
				let spinner = fixture.nativeElement.querySelector(`#buttonIsLoggingOut`);
				expect(btn).toBeTruthy();
				expect(spinner).toBeFalsy();

				let spy = spyOn(component["ds"],'logout');
				btn.click();
				fixture.detectChanges();

				btn = fixture.nativeElement.querySelector(`#buttonLogout`);
				spinner = fixture.nativeElement.querySelector(`#buttonIsLoggingOut`);
				expect(component.view.isLoggingOut).toBe(true);
				expect(btn).toBeFalsy();
				expect(spinner).toBeTruthy();
			});
			it("should call the logout function", () => {
				let btn = fixture.nativeElement.querySelector(`#buttonLogout`);
				let spy = spyOn(component["ds"],'logout');
				btn.click();
				fixture.detectChanges();
				expect(spy).toHaveBeenCalled();
				expect(spy).toHaveBeenCalledWith(component["router"]);
			})
		});
		describe("Go Button", () => {
			it("should show spinner after clicked", () => {
				// enable the go button and avoid .go errors
				component.current = {truck: {}, delivery: {}, district: {}};
				fixture.detectChanges();

				let btn = fixture.nativeElement.querySelector(`#buttonGo`);
				let spinner = fixture.nativeElement.querySelector(`#buttonIsGoing`);
				expect(btn).toBeTruthy();
				expect(spinner).toBeFalsy();

				let spy = spyOn(component["router"],'navigate');
				btn.click();
				fixture.detectChanges();

				btn = fixture.nativeElement.querySelector(`#buttonGo`);
				spinner = fixture.nativeElement.querySelector(`#buttonIsGoing`);
				expect(component.view.isGoing).toBe(true);
				expect(btn).toBeFalsy();
				expect(spinner).toBeTruthy();
			});
			it("should call the .go function", () => {
				// enable the go button and avoid .go errors
				component.current = {truck: {}, delivery: {}, district: {}};
				fixture.detectChanges();

				let btn = fixture.nativeElement.querySelector(`#buttonGo`);
				let spy = spyOn(component,'go');
				btn.click();
				fixture.detectChanges();
				expect(spy).toHaveBeenCalled();
			});
			it("should be disabled until the truck, district, and delivery are specified", () => {
				component.current = {};
				fixture.detectChanges();
				let btn = fixture.nativeElement.querySelector(`#buttonGo`);
				expect(btn).toBeTruthy();
				expect(btn.disabled).toBe(true);

				component.current = {truck: {},  district: {}};
				fixture.detectChanges();
				btn = fixture.nativeElement.querySelector(`#buttonGo`);
				expect(btn).toBeTruthy();
				expect(btn.disabled).toBe(true);

				component.current = {delivery: {}, district: {}};
				fixture.detectChanges();
				btn = fixture.nativeElement.querySelector(`#buttonGo`);
				expect(btn).toBeTruthy();
				expect(btn.disabled).toBe(true);

				component.current = {truck: {}, delivery: {}, district: {}};
				fixture.detectChanges();

				btn = fixture.nativeElement.querySelector(`#buttonGo`);
				expect(btn).toBeTruthy();
				expect(btn.disabled).toBe(false);
			});
		});
		describe("internal component functions", () => {
			describe(".ngOnInit", () => {
				it("should track the .current and .selectors to the dataservice", () => {
					let spy = spyOn(component,"storeSelectors");
					component.ngOnInit();
					expect(component.current).toBe(component["ds"].current);
					expect(component.selectors).toBe(component["ds"].selectors);
				});
			});
			describe(".storeSelectors", () => {
				it("should store the results of an observable array in the selector at the key specified", () => {
					let obs$ = of([{tstId: 3}]);
					let rtn$ = component.storeSelectors('test', obs$);
					expect(component.selectors["test"]).toEqual([{tstId: 3}]);
				});
				it("should return the observable", () => {
					let obs$ = of([{tstId: 3}]);
					let rtn$ = component.storeSelectors('test', obs$);
					expect(rtn$).toBe(obs$);
				})
			});
			describe(".clearCurrentStartingWithKey", () => {
				it("should clear the .current values for everything lower in the hierarchy", () => {
					let keys = component.selectorKeys;

					// work backward through the keys, deleting and rebuilding as you go
					for (let i = keys.length-2; i >= 0; i--) {
						// set all the values to see if deletion works
						keys.forEach( key => {
							component.current[key.s] = {};
							component.selectors[key.p] = [{}];
						});

						component.clearCurrentStartingWith(keys[i].p);

						keys.forEach( (key, j) => {
							if (j < i) {
								expect(component.current[key.s]).toBeTruthy();
								expect(component.selectors[key.p]).toBeTruthy();
							} else {
								expect(component.current[key.s]).toBeFalsy();
								expect(component.selectors[key.p]).toBeFalsy();
							}
						});
					}
				});
			});
			describe(".go", () => {
				it("should call router.navigate with proper params", () => {
					component.current = {
						district: { DistrictID: 1 },
						delivery: { DeliveryID: 7 },
						truck: { TruckNumber: 45, Day: '2018-05-13'}
					};

					let spy = spyOn(component["router"],'navigate');
					component.go();
					expect(spy).toHaveBeenCalledWith(['/confirm-route', {
						DistrictID: component.current.district.DistrictID,
						DeliveryID: component.current.delivery.DeliveryID,
						TruckNumber: component.current.truck.TruckNumber,
						Day: component.current.truck.Day
					}]);
				})
				it("should set view.isGoing to true", () => {
					component.current = {
						district: { DistrictID: 1 },
						delivery: { DeliveryID: 7 },
						truck: { TruckNumber: 45, Day: '2018-05-13'}
					};
					expect(component.view.isGoing).toBe(false);
					let spy = spyOn(component["router"],'navigate');
					component.go();
					expect(component.view.isGoing).toBe(true);
				})
			});
			describe(".logout", () => {
				it('should set .isLoggingOUt', () => {
					component["ds"].logout = jasmine.createSpy();
					component.logout();
					expect(component.view.isLoggingOut).toBe(true);
				})
				it('should call .ds.logout', () => {
					component["ds"].logout = jasmine.createSpy();
					component.logout();
					expect(component["ds"].logout).toHaveBeenCalled();
				})
			});
			describe(".setTruck", () => {
				it("should set the object as the current.truck object", () => {
					let obj = {TruckNumber:1, Day:'2018-05-13'};
					component.setTruck(obj);
					expect(component.current.truck).toBe(obj);
				})
			});
			describe(".getTruckDate", () => {
				it("should be 'unscheduled' if the truck.Day is not specified", () => {
					let obj:any = { TruckNumber: 123 };
					let unscheduled = '(unscheduled)';
					expect(component.getTruckDate(null)).toEqual(unscheduled);
					expect(component.getTruckDate(obj)).toEqual(unscheduled);
					obj.Day = null;
					expect(component.getTruckDate(obj)).toEqual(unscheduled);
				});
				it("should prettify the date if truck.day is specified", () => {
					let obj:any = { TruckNumber: 123, Day: new Date('12/31/2709')}
					expect(component.getTruckDate(obj)).toEqual('2709-12-31');
				})
			});
			describe(".getTruckDescription", () => {
				it("Should not fail if truck or its properties are not specified", () => {
					let truck = { noothingGood: "Don't use this"}
					expect(function() {
						component.getTruckDescription(truck);
					}).not.toThrow();
					expect(function() {
						component.getTruckDescription(null);
					}).not.toThrow();
					expect(typeof component.getTruckDescription(truck)).toEqual('string');
				})
			});
			describe(".getDistricts", () => {
				it("should call store selectors function with 'districts' param", () => {
					let spy = spyOn(component,'storeSelectors');
					let districts$ = of(['district1'])
					component["ds"].fetchDistrictsFromCountryId = jasmine.createSpy()
																.and.returnValue(districts$);
					component.getDistricts({CountryID: 1});
					expect(spy).toHaveBeenCalledWith('districts',districts$);
				});
				it("should call clear selectors function with 'districts' param", () => {
					let spy = spyOn(component,'clearCurrentStartingWith');
					let districts$ = of(['district1'])
					component["ds"].fetchDistrictsFromCountryId = jasmine.createSpy()
					let spy2 = spyOn(component,'storeSelectors');
					component.getDistricts({CountryID: 1});
					expect(spy).toHaveBeenCalledWith('districts');
				});
				it("should call .ds.fetchDistricts", () => {
					let districts$ = of(['district1'])
					component["ds"].fetchDistrictsFromCountryId = jasmine.createSpy()
																.and.returnValue(districts$);
					component.getDistricts({CountryID: 1});
					expect(component["ds"].fetchDistrictsFromCountryId).toHaveBeenCalledWith(1);
				});
			});
			describe(".getSeasons", () => {
				let vals = { param: 'seasons', getObj: { DistrictID: 1 },
										retObj: [{DistrictID: 1, SeasonID: 2 }],
										fetchFunc: 'fetchSeasons', getFunc: 'getSeasons'}
				it(`should call store selectors function with '${vals.param}' param`, () => {
					let spy = spyOn(component,'storeSelectors');
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param,obs$);
				});
				it(`should call clear selectors function with '${vals.param}' param`, () => {
					let spy = spyOn(component,'clearCurrentStartingWith');
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param);
				});
				it(`should call .ds.${vals.fetchFunc}`, () => {
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					let getObjVals = Object.keys(vals.getObj).map(key => vals.getObj[key]);
					expect(component["ds"][vals.fetchFunc]).toHaveBeenCalledWith(...getObjVals);
				});
			});
			describe(".getDeliveries", () => {
				let vals = { param: 'deliveries', getObj: { DistrictID: 1, CreditCycleID: 10 },
										retObj: [{DistrictID: 1, DeliveryID: 4 }],
										fetchFunc: 'fetchDeliveries', getFunc: 'getDeliveries'}
				it(`should call store selectors function with '${vals.param}' param`, () => {
					let spy = spyOn(component,'storeSelectors');
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param,obs$);
				});
				it(`should call clear selectors function with '${vals.param}' param`, () => {
					let spy = spyOn(component,'clearCurrentStartingWith');
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param);
				});
				it(`should call .ds.${vals.fetchFunc}`, () => {
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					let getObjVals = Object.keys(vals.getObj).map(key => vals.getObj[key]);
					expect(component["ds"][vals.fetchFunc]).toHaveBeenCalledWith(...getObjVals);
				});
			});
			describe(".getCreditCycles", () => {
				let vals = { param: 'creditCycles', getObj: { DistrictID: 1, SeasonID: 9 },
										retObj: [{DistrictID: 1, CreditCycleyID: 3 },
															{DistrictID: 1, CreditCycleyID: 4 }],
										fetchFunc: 'fetchCreditCycles', getFunc: 'getCreditCycles'}
				it(`should call store selectors function with '${vals.param}' param`, () => {
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					let spy = spyOn(component,'storeSelectors').and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param,obs$);
				});
				it(`should call clear selectors function with '${vals.param}' param`, () => {
					let spy = spyOn(component,'clearCurrentStartingWith');
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param);
				});
				it(`should call .ds.${vals.fetchFunc}`, () => {
					let obs$ = of(vals.retObj)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					let spy = spyOn(component,'storeSelectors').and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					let getObjVals = Object.keys(vals.getObj).map(key => vals.getObj[key]);
					expect(component["ds"][vals.fetchFunc]).toHaveBeenCalledWith(...getObjVals);
				});
				it(`should select the credit cycle and call getDeliveries if only 1 credit cycle is returned`, () => {
					let ccs = [vals.retObj[0]];
					let obs$ = of(ccs)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					let getDelSpy = spyOn(component,"getDeliveries");
					let spy = spyOn(component,'storeSelectors').and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(component.current.creditCycle).toBe(ccs[0]);
					expect(getDelSpy).toHaveBeenCalledWith(ccs[0]);
				})
				it(`should hide the credit cycles if only 1 credit cycle is returned`, () => {
					let ccs = [vals.retObj[0]];
					let obs$ = of(ccs)
					component["ds"][vals.fetchFunc] = jasmine.createSpy()
																.and.returnValue(obs$);
					let getDelSpy = spyOn(component,"getDeliveries");
					let spy = spyOn(component,'storeSelectors').and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(component.view.hideCreditCycles).toBe(true);
				})
			});
			describe(".getTrucks", () => {
				let vals = { param: 'trucks', getObj: { DistrictID: 1, DeliveryID: 9 },
									retObj: [{DistrictID: 1, TruckNumber: 3, Day: '2010-05-13' }],
									fetchFunc: 'getTrucksFromDropAssignments', getFunc: 'getTrucks'};
				let obs$ = of(vals.retObj)
				beforeEach(() => {
					component["ds"][vals.fetchFunc] =
																		jasmine.createSpy().and.returnValue(obs$);
					component["ds"].fetchDropAssignments =
																		jasmine.createSpy().and.returnValue(obs$);
				});
				it(`should call store selectors function with '${vals.param}' param`, () => {
					let spy = spyOn(component,'storeSelectors').and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param,obs$);
				});
				it(`should call clear selectors function with '${vals.param}' param`, () => {
					let spy = spyOn(component,'clearCurrentStartingWith');
					component[vals.getFunc](vals.getObj);
					expect(spy).toHaveBeenCalledWith(vals.param);
				});
				it(`should call .ds.${vals.fetchFunc}`, () => {
					let spy = spyOn(component,'storeSelectors').and.returnValue(obs$);
					component[vals.getFunc](vals.getObj);
					let getObjVals = Object.keys(vals.getObj).map(key => vals.getObj[key]);
					expect(component["ds"][vals.fetchFunc]).toHaveBeenCalledWith(vals.retObj);
				});
			});
		});
	});  // Post Init tests
});
