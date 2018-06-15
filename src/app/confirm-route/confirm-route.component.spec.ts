import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing'
import { convertToParamMap, ActivatedRoute } from '@angular/router';
//import { HttpModule } from '@angular/http';
import { of } from 'rxjs';

import { ConfirmRouteComponent } from './confirm-route.component';
import { DataService } from '../shared/data.service';

import { HttpModule } from '@angular/http';

class MockDs {
	current = {
		delivery: {},
		district: {},
		truck: {
			dropAssignments: [],
		}
  };

	data = {
		dropMovement: {
			dropMovementDetails: [],
		}
	}
	getDrop() {
		return {};
	}
	getDropMovement() {
		return this.data.dropMovement;
	}
	getInput() {
		return {};
	}
	getSeasonInputSize() {
		return {};
  }
  getDropMovementDetails() {
    return [];
  }
}

describe('ConfirmRouteComponent', () => {
  let component: ConfirmRouteComponent;
  let fixture: ComponentFixture<ConfirmRouteComponent>;
  let activatedRouteParamMap = of(
    convertToParamMap(
      {	DistrictId: 1, DeliveryId: 1, TruckNumber: 1, Day: '2017-05-05'}
    )
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
			providers: [
        { provide: DataService, useClass: MockDs },
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
