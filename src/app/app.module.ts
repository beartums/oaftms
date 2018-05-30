import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { HttpClientModule } from '@angular/common/http'
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryService } from './shared/in-memory.service'

import { ModalModule } from "ngx-bootstrap/modal";
import { SignaturePadModule } from 'angular2-signaturepad';

//import { NgForageModule } from "ngforage";

import { ObjectIndexService } from 'object-index-service';
import { DataService } from './shared/data.service';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SelectTruckComponent } from './select-truck/select-truck.component';
import { ConfirmRouteComponent } from './confirm-route/confirm-route.component';
import { DropMovementComponent } from './drop-movement/drop-movement.component';
import { ConfirmRouteResolver } from './confirm-route-resolver.service';
import { ModalComponent } from './modal/modal.component';
import { ModalContentComponent } from './modal/modal-content.component';
import { FocusDirective } from './focus.directive';
import { SignatureModalComponent } from './signature-modal/signature-modal.component';
import { SignatureModalContentComponent } from './signature-modal/signature-modal-content.component';


@NgModule({
  declarations: [
    AppComponent, LoginComponent, SelectTruckComponent, ConfirmRouteComponent,
				DropMovementComponent, ModalComponent, ModalContentComponent, FocusDirective, SignatureModalComponent, SignatureModalContentComponent
  ],
  imports: [
    BrowserModule,
		FormsModule,
		HttpClientModule,
		HttpClientInMemoryWebApiModule.forRoot(InMemoryService),
		AppRoutingModule,
		ModalModule.forRoot(),
		SignaturePadModule,
  ],
	entryComponents: [ ModalContentComponent, SignatureModalContentComponent ],
  providers: [DataService,ObjectIndexService,DatePipe,ConfirmRouteResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
