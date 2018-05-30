import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureModalContentComponent } from './signature-modal-content.component';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ModalModule } from "ngx-bootstrap/modal";
import { SignaturePadModule } from 'angular2-signaturepad';

describe('SignatureModalContentComponent', () => {
  let component: SignatureModalContentComponent;
  let fixture: ComponentFixture<SignatureModalContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
			imports: [ ModalModule.forRoot(),
				SignaturePadModule, ModalModule
			],
		providers: [ BsModalRef	],
      declarations: [ SignatureModalContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureModalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
