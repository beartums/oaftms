import { FormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Observable, of } from 'rxjs';
import { HttpModule } from '@angular/http';
import { DataService } from '../shared/data.service';
import { ModalModule } from "ngx-bootstrap/modal";
import { SignaturePadModule } from 'angular2-signaturepad';
import { SignatureModalComponent } from '../signature-modal/signature-modal.component';

import { DropMovementComponent } from './drop-movement.component';
//import { IndexService } from '../shared/index.service';

class MockDs {
	current = {};
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

describe('DropMovementComponent', () => {
  let component: DropMovementComponent;
  let fixture: ComponentFixture<DropMovementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
			providers: [
				{ provide: DataService, useClass: MockDs },
			 	{ provide: ActivatedRoute, useValue: {
						paramMap: of(
							convertToParamMap(
								{	DistrictId: 1, DeliveryId: 1, TruckNumber: 1, DropID: 1,
										direction: 'to', confirm: 'false'}
							)
						)
					}
				}
			],
			imports: [ FormsModule,	ModalModule.forRoot(), RouterTestingModule,
									SignaturePadModule, HttpModule ],
      declarations: [ DropMovementComponent, SignatureModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
