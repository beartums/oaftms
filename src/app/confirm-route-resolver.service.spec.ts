import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'

import { ConfirmRouteResolver } from './confirm-route-resolver.service';
import { DataService } from './shared/data.service';

class MockDs {
	getDropAssignementsByTruck() {
		return {};
	}
	fetchAndSetDrops() {
		return {}
	}
	fetchAndSetDropMovementDetails() {
		return {}
	}
	fetchAndSetInputs() {
		return {}
	}
	fetchAndSetSeasonInputSizes() {

	}
}
describe('ConfirmRouteResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ],
			providers: [
				ConfirmRouteResolver,
			{ provide: DataService, useClass: MockDs }]
    });
  });

  it('should be created', inject([ConfirmRouteResolver], (service: ConfirmRouteResolver) => {
    expect(service).toBeTruthy();
  }));
});
