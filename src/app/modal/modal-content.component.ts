import { Component, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'modal-content',
  templateUrl: './modal-content.component.html'
})

export class ModalContentComponent implements OnInit, OnChanges {

	public onClose: Subject<string>;

	title: string;
	message: string;
	icon: string | 'warning' | 'danger' | 'info';
	buttons: [
		{
			text: string,  					// displayed on the button AND returned when clicked
			class?: string,  				// For styling.
			leaveOpen?:	boolean, 		// Click closes modal if false
			isDefault?: boolean			// Default selection when pressing enter
		}]

  constructor(public bsModalRef: BsModalRef) {}

	@HostListener('document:keydown', ['$event'])
	onkeydown(ev: KeyboardEvent) {
		// keys were being captured by underlying view.  Since this modal
		// has no need of keys (except enter to select the default choice);
		// simply detect enter and stop propagation on all others
		ev.preventDefault();
		ev.stopPropagation();
		if (ev.key == "Enter") {
			let button = this.buttons.find( btn => { return btn.isDefault } );
			if (button) this.close(button.text,button.leaveOpen);
		}
	}

	ngOnInit() {
		this.onClose = new Subject();
  }

	ngOnChanges(changes: SimpleChanges) {
		for (let prop in changes) {
			if (prop == "buttons") {
				
			}
		}
	}

	close(text: string, leaveOpen: boolean) {
		this.onClose.next(text);
		if (!leaveOpen) this.bsModalRef.hide();
	}
}
