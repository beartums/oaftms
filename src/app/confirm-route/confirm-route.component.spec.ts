import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing'
import { convertToParamMap, ActivatedRoute } from '@angular/router';
//import { HttpModule } from '@angular/http';
import { of } from 'rxjs';

import { ConfirmRouteComponent } from './confirm-route.component';
import { DataService } from '../shared/data.service';

import { HttpModule } from '@angular/http';

// Dataservice provider; needed functions created as spies
let dsSpyObj = jasmine.createSpyObj("DataService", [
  'getDrop', 'getDropMovement',
  'getInput','getSeasonInputs','getDropMovementDetails'
]);
// properties used
dsSpyObj.current = {
  delivery: {},
  district: {},
  truck: {
    dropAssignments: [],
  }
}
dsSpyObj.data = {
  dropMovement: {
    dropMovementDetails: [],
  }
}

// Parameters for the mock activated route
let params: any = {
  DistrictID: 1, DeliveryID: 1, TruckNumber: 1, Day: '2017-05-05'
}

describe('ConfirmRouteComponent', () => {
	let component: ConfirmRouteComponent;
	let fixture: ComponentFixture<ConfirmRouteComponent>;
	let activatedRouteParamMap = of(
		convertToParamMap( params )
	);

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: DataService, useValue: dsSpyObj },
				{ provide: ActivatedRoute, useValue: { paramMap: activatedRouteParamMap}}
			],
			imports: [ FormsModule,
								 HttpModule, RouterTestingModule ],
			declarations: [ ConfirmRouteComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfirmRouteComponent);
    component = fixture.componentInstance;
    spyOn(component,'ngOnInit').and.callThrough();
    spyOn(component,'populateDisplayEntities').and.callThrough();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
	it("should create data.truck that matches params",() => {
		params.date = new Date(params.Day);
		expect(component.data.truck).toEqual(params);
  });
  it('should call .populateDisplayEntities', () => {
    expect(component['populateDisplayEntities']).toHaveBeenCalledTimes(1);
    params.date = new Date(params.Day);
    expect(component['populateDisplayEntities']).toHaveBeenCalledWith(params);
  })
});
