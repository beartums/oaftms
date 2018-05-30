import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	@HostListener('document:keypress', ['$event'])
	keypress(e: KeyboardEvent) {
		if (e.key=='Enter') {
			this.login();
		}
	}
	userName: string;
	userPassword: string;
	invalid: boolean = false;
	title: string = "Login";

  constructor(private ds: DataService, private router: Router) { }

  ngOnInit() {
		// this.userName = 'me';
  }

	login(): void {
		this.invalid = false;
		let users;
		try {
			users = this.ds.getUsers({name:this.userName, password: this.userPassword});
		} catch(e) {
			this.invalid = true
			return
		}
		this.invalid = !users || !users.length || (users.length && users.length != 1);
		if (!this.invalid) {
			this.router.navigate(['/select-truck']);
		}
	}

}
