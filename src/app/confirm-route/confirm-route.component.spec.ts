import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing'

import { HttpModule } from '@angular/http';

import { ConfirmRouteComponent } from './confirm-route.component';
import { DataService } from '../shared/data.service';
import { ObjectIndexService } from 'object-index-service';

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
}

describe('ConfirmRouteComponent', () => {
  let component: ConfirmRouteComponent;
  let fixture: ComponentFixture<ConfirmRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
			providers: [ {provide: DataService, useClass: MockDs} ],
			imports: [ FormsModule, HttpModule, RouterTestingModule ],
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
