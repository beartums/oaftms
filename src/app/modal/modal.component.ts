import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ModalContentComponent } from './modal-content.component';

@Component({
	selector: 'modal',
	template: ''
})
export class ModalComponent {

	subscription: any;
	bsModalRef: BsModalRef;
	//@ViewChild('template') templateRef: TemplateRef<any>;
	@Input() content;
	@Input() isAutoOpen: boolean;
	@Output() onResult: EventEmitter<any> = new EventEmitter();

	constructor(private modalService: BsModalService) {
	}

	openModal() {
		let initialState = this.content;
		this.bsModalRef = this.modalService.show(ModalContentComponent,{initialState});
		this.subscription = this.bsModalRef.content.onClose.subscribe( result => { this.onResult.emit(result)
		});
	}

	ngOnInit() {
		if (this.isAutoOpen) this.openModal();
	}

	ngOnDestroy() {
		try {
			this.subscription.unsubscribe()
		} catch (e) {};
	}

	ngOnChanges(changes: SimpleChanges) {
		for (let prop in changes) {
			if (prop=="icon") {

			}
		}
	}

	cancel(msg) {
		console.log('cancel: ', msg);
	}
	confirm(msg) {
		console.log('close: ', msg);
	}
	dismiss(msg) {
		console.log('dismiss: ', msg);
	}
}
