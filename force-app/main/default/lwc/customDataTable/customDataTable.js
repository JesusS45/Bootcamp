/*
 * Author : Jesus Enrique Salazar
 * Description : The component to show a custom data type in a Datatable component.
 */
import LightningDatatable from 'lightning/datatable';
import customImageDataTable from './customImageDataTable.html';

export default class CustomDataTable extends LightningDatatable {
    static customTypes = {
        image: {
            template: customImageDataTable
        }
    };
}