import { Component, EventEmitter, OnInit, OnChanges, SimpleChanges,
					HostListener, ViewChild } from '@angular/core';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@Component({
  selector: 'signature-modal-content',
  templateUrl: './signature-modal-content.component.html',
	styleUrls: ['./signature-modal-content.component.css']
})

export class SignatureModalContentComponent implements OnChanges {

	public onClose: Subject<string>;

	data: any;
	title: string;
	icon: string | 'warning' | 'danger' | 'info';
	signaturePadOptions: any = {
		canvasWidth: 470,
		canvasHeight: 300,
		minWidth: .5
	};
	signature: any;
	format: string = 'data';

  constructor(public bsModalRef: BsModalRef) {}


	@ViewChild(SignaturePad) signaturePad: SignaturePad;

	@HostListener('document:keydown', ['$event'])
	onkeydown(ev: KeyboardEvent) {
		// keys were being captured by underlying view.  Since this modal
		// has no need of keys (except enter to select the default choice);
		// simply detect enter and stop propagation on all others
		ev.preventDefault();
		ev.stopPropagation();
		if (ev.key == "Enter") {
		} else if (ev.key == "Escape") {
			this.dismiss('cancel');
		}
	}

	ngAfterViewInit() {
		this.onClose = new Subject();
		this.setSignature();
  }

	ngOnChanges(changes: SimpleChanges) {
	}

	setSignature() {
		if (!this.signature) {
			this.clearSignaturePad();
			return;
		}

		if (this.format != 'data') { // png
			this.signaturePad.fromDataURL(this.signature);
		} else {
			this.signaturePad.fromData(this.signature);
		}
	}

	close(closeObject: any, leaveOpen?: boolean) {
		this.onClose.next(closeObject);
		if (!leaveOpen) this.bsModalRef.hide();
	}

	clearSignaturePad() {
		this.signaturePad.clear();
		this.signature = null;
	}

	dismiss(text: string) {
		this.close({status: text, signature: null});
	}

	ok() {
		this.data = this.signaturePad.toData();
		if (this.data.length == 0) this.data = null
		this.close({ status: 'ok', signature: this.data});
	}

	onDrawStart(ev) {
		console.log('start drawing: ', ev)
	}

	onDrawEnd(ev) {
			console.log('end drawing: ', ev)
	}
}
