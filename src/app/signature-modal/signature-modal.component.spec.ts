import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureModalComponent } from './signature-modal.component';

import { ModalModule } from "ngx-bootstrap/modal";
import { SignaturePadModule } from 'angular2-signaturepad';

describe('SignatureModalComponent', () => {
  let component: SignatureModalComponent;
  let fixture: ComponentFixture<SignatureModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
			imports: [
				ModalModule.forRoot(),
				SignaturePadModule,
			],
			providers: [
			],
      declarations: [ SignatureModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
