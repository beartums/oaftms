import { TestBed, inject, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { DataService } from './data.service';
import { IndexService } from './index.service';
import * as _ from 'lodash';

let countries = [
	{ CountryId: 1, Country: 'Winterfell'},
	{ CountryId: 2, Country: 'King\'s Landing'},
	{ CountryId: 3, Country: 'The Eyrie'},
]

describe('DataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
      providers: [DataService, IndexService ]
    });
  });

  it('should be created',
			inject([HttpTestingController, DataService],
						(httpMock: HttpTestingController, dataService:  DataService) => {
		let mockReq = httpMock.expectOne('api/data')
		mockReq.flush({data:{Users: [{name:'Jon',password:'Jon'}]}});
		expect(dataService).toBeTruthy();
  }));

	describe(".fetchCountries", () => {
		it("should call fetch with proper params",
						inject([HttpTestingController, DataService],
										(httpMock: HttpTestingController, dataService:  DataService) =>  {
			let spy = spyOn(dataService,'fetch').and.returnValue(of(countries));
			spyOn(dataService,'fetchAllData'); // so we don't have to worry about dependencies
			dataService.fetchCountries();
			expect(spy).toHaveBeenCalledWith('Countries');
		}));
		it("should return an observable array sorted by.Country",
						inject( [DataService],	(dataService:  DataService) => {
			let unsorted = _.cloneDeep(countries);
			let spy = spyOn(dataService,'fetch').and.returnValue(of(countries));
			spyOn(dataService,'fetchAllData'); // so we don't have to worry about dependencies
			let sorted = dataService.fetchCountries();
			sorted.subscribe(c=> {
				expect(countries).not.toEqual(unsorted);
				unsorted.sort((a,b)=>a.Country>b.Country?1:-1)
				expect(countries).toEqual(unsorted);
			});
		}));
	});
});
