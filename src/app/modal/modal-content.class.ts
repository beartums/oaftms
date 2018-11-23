export class ModalModel {
	title: string;
	message: string;
	icon: string | 'warning' | 'danger' | 'info';
	buttons: [
		{
			text: string,  					// displayed on the button AND returned when clicked
			class?: string,  				// For styling.
			leaveOpen?:	boolean, 		// Click closes modal if false
			isDefault?: boolean			// Default selection when pressing enter
		}];
	}
