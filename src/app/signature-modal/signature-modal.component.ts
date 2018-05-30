import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { SignatureModalContentComponent } from './signature-modal-content.component';

@Component({
	selector: 'signature-modal',
	template: ''
})
export class SignatureModalComponent {

	subscription: any;
	bsModalRef: BsModalRef;
	//@ViewChild('template') templateRef: TemplateRef<any>;
	@Input() signaturePadOptions: any = {
		canvasWidth: 470,
		canvasHeight: 300,
		minWidth: .5
	};
	@Input() format: ''|'image/jpeg'|'image/svg+xml'|'data' = 'data';
	@Input() isAutoOpen: boolean;
	@Input() signature: any;
	@Output() signatureChange: EventEmitter<any> = new EventEmitter();

	@Output() onResult: EventEmitter<any> = new EventEmitter();

	constructor(private modalService: BsModalService) {
	}

	openModal(signature) {
		// Having a hard time getting directives to pass data through HTML, so
		// am passing signature directly when opening the modal
		//signature = signature || this.signature
		let initialState = { signature: signature,
													signaturePadOptions: this.signaturePadOptions,
													format: this.format };
		this.bsModalRef = this.modalService.show(SignatureModalContentComponent,
													{initialState});
		this.subscription = this.bsModalRef.content.onClose.subscribe( result => {
			//console.log(result);
			this.onResult.emit(result);
			if (result.status == 'ok') {
				this.signatureChange.emit(result.signature);
				this.signature = null;
			}

		});
	}

	ngOnInit() {
		if (this.isAutoOpen) this.openModal(null);
	}

	ngOnDestroy() {
		if (this.subscription) this.subscription.unsubscribe();
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
