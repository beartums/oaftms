import { Directive, Renderer, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[focus]'
})
export class FocusDirective {

	@Input('focus') isFocused: boolean;

	constructor(private hostElement: ElementRef, private renderer: Renderer) {}

	ngOnInit() {
		if (this.isFocused) {
			this.renderer.invokeElementMethod(this.hostElement.nativeElement, 'focus');
		}
	}

}
