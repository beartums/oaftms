import { fakeAsync, async, ComponentFixture, TestBed, inject, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'
//import { RouterTestingModule } from '@angular/router/testing'
import { By }              from '@angular/platform-browser';

import { HttpModule } from '@angular/http'

import { LoginComponent } from './login.component';
import { DataService } from '../shared/data.service';
//import { IndexService } from '../shared/index.service';

class MockDs {
	getUsers(cred) {
		if (cred.name == "valid" && cred.password == "user") return [{}];
		return [];
	}
}
let mockRouter = {
	navigate: jasmine.createSpy('navigate'),
};

describe('LoginComponent', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
			providers: [ { provide: DataService, useClass:MockDs },
									{ provide: Router, useValue: mockRouter }],
			imports: [ FormsModule, HttpModule],
      declarations: [ LoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

	it('should be created', () => {
    expect(component).toBeTruthy();
  });
	it('should have a title', () => {
		component.title = "Test Title";
		fixture.detectChanges();
		let titleDe = fixture.debugElement;
		let titleElement = titleDe.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toContain(component.title);
  });
	it('#userName input should change component.userName', () => {
		let name = 'Jon Snow';
		let UnEl = fixture.debugElement.nativeElement.querySelector('#userName');
		UnEl.value = name;
		UnEl.dispatchEvent(new Event('input'));
    expect(component.userName).toEqual(name);
  });
	it('#password input should change component.userPassword', () => {
		let pw = 'very very secret';
		let pwEl = fixture.debugElement.nativeElement.querySelector('#password');
		pwEl.value = pw;
		pwEl.dispatchEvent(new Event('input'));
    expect(component.userPassword).toEqual(pw);
  });
	it("#password should have type='password'", () => {
		let pwEl = fixture.debugElement.nativeElement.querySelector('#password');
		expect(pwEl.type).toEqual('password');
  });
	it("#buttonContinue should be disabled to start", () => {
		let btn = fixture.nativeElement.querySelector('#buttonContinue');
		expect(btn.disabled).toBe(true);
	});
	it("#buttonContinue should be disabled if only one input has data", () => {
		let pwEl = fixture.debugElement.nativeElement.querySelector('#password');
		let btn = fixture.nativeElement.querySelector('#buttonContinue');
		let unEl = fixture.debugElement.nativeElement.querySelector('#userName');
		pwEl.value = 'text';
		pwEl.dispatchEvent(new Event('input'));
		expect(btn.disabled).toBe(true);
		pwEl.value = '';
		pwEl.dispatchEvent(new Event('input'));
		unEl.value = 'text';
		unEl.dispatchEvent(new Event('input'));
		expect(btn.disabled).toBe(true);
	});
	it("#buttonContinue should be enabled if only both inputs have data", () => {
		let pwEl = fixture.debugElement.nativeElement.querySelector('#password');
		let btn = fixture.nativeElement.querySelector('#buttonContinue');
		let unEl = fixture.debugElement.nativeElement.querySelector('#userName');
		pwEl.value = 'text';
		pwEl.dispatchEvent(new Event('input'));
		unEl.value = 'text';
		unEl.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		expect(btn.disabled).toBe(false);
	});
	it("#alert should be hidden to start", () => {
		let alEl = fixture.debugElement.nativeElement.querySelector('#alert');
		expect(alEl.hidden).toBe(true);
	});
	it("#alert should not be hidden when invalid data is entered", () => {
		let pwEl = fixture.debugElement.nativeElement.querySelector('#password');
		let unEl = fixture.nativeElement.querySelector('#userName');
		let alEl = fixture.debugElement.nativeElement.querySelector('#alert');
		//let spy = spyOn(component,"login").andPassThrough();
		pwEl.value = 'user';
		pwEl.dispatchEvent(new Event('input'));
		unEl.value = 'invalid';
		unEl.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		component.login();
		fixture.detectChanges();
		expect(alEl.hidden).toBe(false);
	});
	it("#alert should be hidden when the data is considered valid", () => {
		let alEl = fixture.debugElement.nativeElement.querySelector('#alert');
		component.invalid = true;
		fixture.detectChanges();
		expect(alEl.hidden).toBe(false);
		component.invalid = false;
		fixture.detectChanges();
		expect(alEl.hidden).toBe(true);
	});
	it("#alert should be hidden when valid data is entered", () => {
		let pwEl = fixture.debugElement.nativeElement.querySelector('#password');
		let unEl = fixture.nativeElement.querySelector('#userName');
		let alEl = fixture.debugElement.nativeElement.querySelector('#alert');
		//let spy = spyOn(component,"login").andPassThrough();
		pwEl.value = 'user';
		pwEl.dispatchEvent(new Event('input'));
		unEl.value = 'valid';
		unEl.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		component.login();
		fixture.detectChanges();
		expect(alEl.hidden).toBe(true);
	});
	it("should navigate to '/select-truck' when valid credentials entered",  () => {
		let pwEl = fixture.debugElement.nativeElement.querySelector('#password');
		let unEl = fixture.nativeElement.querySelector('#userName');
		pwEl.value = 'user';
		pwEl.dispatchEvent(new Event('input'));
		unEl.value = 'valid';
		unEl.dispatchEvent(new Event('input'));
		component.login();
		fixture.detectChanges();
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/select-truck']);
	});
	it("#buttonContinue should call .login", fakeAsync(() => {
		let btn = fixture.nativeElement.querySelector('#buttonContinue');
		let loginSpy = spyOn(component,'login');
		// give the fields values to enable the button
		component.userName = 'user';
		component.userPassword = 'password';
		fixture.detectChanges();
		btn.click();
		tick();
		expect(loginSpy).toHaveBeenCalled();
	}));
});
