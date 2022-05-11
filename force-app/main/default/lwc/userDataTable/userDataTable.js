/*
 * Author : Jesus Enrique Salazar
 * Description : The component to create a new Lead record.
 */
import { LightningElement, track, wire} from 'lwc';
import getAppoitments from '@salesforce/apex/LeadController.getAppoitments';
import isGuest from '@salesforce/user/isGuest';

const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'To Assign', name: 'assign' },
];

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text'},
    { label: 'Email', fieldName: 'Email', type: 'text'},
    { label: 'Company', fieldName: 'Company', type:'text'},
    { label: 'State', fieldName: 'State', type: 'text'},
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    }, 
];

export default class UserDataTable extends LightningElement {
    // Public Property
    // Private Property
    columns = columns;
    error;
    isGuestUser = isGuest;
    @track appointments = [];

    // Get all Appointments
    @wire(getAppoitments) 
    appointmentsInformation({ error, data }) {
        if (data) {
            console.log(data);
            this.appointments = data;
        } else if (error) {
            this.error = error;
            console.log(error);
        }
    }
}