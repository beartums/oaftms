import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SelectTruckComponent } from './select-truck/select-truck.component';
import { ConfirmRouteComponent } from './confirm-route/confirm-route.component';
import { DropMovementComponent } from './drop-movement/drop-movement.component';
import { ConfirmRouteResolver } from './confirm-route-resolver.service';
const appRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: 'login',
				component: LoginComponent
				//resolve: { data: DataResolverService }
			},
			{
				path: 'select-truck',
				component: SelectTruckComponent,
				//resolve: { data: SelectTruckResolverService }
			},
			{
				path: 'confirm-route',
				component: ConfirmRouteComponent,
				resolve: { data: ConfirmRouteResolver }
			},
			{
				path: 'drop-movement',
				component: DropMovementComponent,
				//resolve: { data: DataResolverService }
			},
			{ path: '', redirectTo: '/login', pathMatch: 'full' }
		]
	}
]

@NgModule({
	imports: [ RouterModule.forRoot(appRoutes) ],
	exports: [ RouterModule	],
//	providers: [ DataResolverService ]
})
export class AppRoutingModule{}
