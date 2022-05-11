/*
 * Author : Jesus Enrique Salazar
 * Description : The component to show a carousel.
 */
import { LightningElement, wire, track } from 'lwc';
import getCarsInformation from '@salesforce/apex/ProductController.getCarsInformation';

export default class Carousel extends LightningElement {
    // Public Property
    // Private Property
    @track cars = [];
    error;

    // Get all Cars Information
    @wire(getCarsInformation, {isCarrousel: true}) 
    carsInformation({ error, data }) {
        if (data) {
            this.cars = data;
        } else if (error) {
            this.error = error;
            console.log(error);
        }
    }
}