import { Directive, Renderer, ElementRef, Input } from '@angular/core';
import { FocusDirective } from './focus.directive';

class MockElementRef extends ElementRef { nativeElement = {}; }

describe('FocusDirective', () => {
	let el = new ElementRef({});

	// beforeEach(() => {
	// 	TestBed.configureTestingModule({
	// 		declarations: [FocusDirective]
	// 	});
	//
	// })
  // it('should create an instance', () => {
  //   //const directive = new FocusDirective(el, r);
  //   //expect(directive).toBeTruthy();
  // });
});
