/*
 * Author : Jesus Enrique Salazar
 * Description : The component to show a Data table with all the cars information.
 */
import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCarsInformation from '@salesforce/apex/ProductController.getCarsInformation';
import getCarBrands from '@salesforce/apex/ProductController.getCarBrands';
import getCarModels from '@salesforce/apex/ProductController.getCarModels';
import getCarColors from '@salesforce/apex/ProductController.getCarColors';
import isGuest from '@salesforce/user/isGuest';

const actions = [
    { label: 'Edit', name: 'edit'}
];

const columns = [
    { label: 'Model', fieldName: 'Family', type: 'text'},
    { label: 'Brand', fieldName: 'Product_Brand__c', type: 'text'},
    { label: 'Image', fieldName: 'DisplayUrl', type:'image'},
    { label: 'Color', fieldName: 'Product_Color__c', type: 'text'},
    { label: 'Price', fieldName: 'Product_Price__c', type: 'currency', typeAttributes: { currencyCode: 'USD' }},
    { label: 'Is Active?', fieldName: 'IsActive', type: 'boolean'},
];


export default class BasicDatatable extends LightningElement {
    // Public Property
    // Private Property
    isGuestUser = isGuest;
    vehiculeValue = '';
    brandValue = '';
    modelValue = '';
    vehiculeOption = '';
    brandOption = '';
    modelOption = '';
    objectApiName;
    currentRecordId;
    error;
    wiredCarInformation;
    datatableRendered = false;
    @track cars = [];
    @track brandOptions = [];
    @track modelOptions = [];
    @track colorOptions = [];
    @track isModalOpen = false;
    @track isFilterActive = false;
    @track columns = columns;
    @track isEditModalOpen = false;

    renderedCallback(){
        if(!this.isGuestUser && !this.datatableRendered){
            const editAction = {
                type: 'action',
                typeAttributes: {
                    rowActions: actions,
                    menuAlignment: 'right'
                }
            };
            this.columns = [...this.columns, editAction ];
            this.datatableRendered = true;
        }
    }

    // Get all Cars Information
    @wire(getCarsInformation, { vehiculeOption: '$vehiculeOption', brandOption: '$brandOption', modelOption: '$modelOption', isCarrousel: false }) 
    carsInformation(result) {
        this.wiredCarInformation = result;
        if (result.data) {
            this.cars = result.data;
        } else if (result.error) {
            this.error = result.error;
            console.log(result.error);
        }
    }

    // Get all Car Brands
    @wire(getCarBrands) 
    carsBrands({ error, data }) {
        if (data) {
            for(const list of data){
                const option = {
                    label: list,
                    value: list
                };
                this.brandOptions = [ ...this.brandOptions, option ];
            }
        } else if (error) {
            this.error = error;
            console.log(error);
        }
    }

    // Get all Car Models
    @wire(getCarModels) 
    carsModels({ error, data }) {
        if (data) {
            for(const list of data){
                const modelOption = {
                    label: list,
                    value: list
                };
                this.modelOptions = [ ...this.modelOptions, modelOption ];
            }
        } else if (error) {
            this.error = error;
            console.log(error);
        }
    }

    // Get all Car Colors
    @wire(getCarColors) 
    carColors({ error, data }) {
        if (data) {
            for(const list of data){
                const colorOption = {
                    label: list,
                    value: list
                };
                this.colorOptions = [ ...this.colorOptions, colorOption ];
            }
        } else if (error) {
            this.error = error;
            console.log(error);
        }
    }

    openFilterSection(){
        this.isFilterActive = !this.isFilterActive;
    }

    handleBrandOptionSelected(event){
        this.brandValue = event.detail.value;
    }

    handleModelOptionSelected(event){
        this.modelValue = event.detail.value;
    }

    handleSearchFilter(){
        this.vehiculeOption = this.vehiculeValue;
        this.brandOption = this.brandValue;
        this.modelOption = this.modelValue;
    }

    handleRemoveFilters(){
        this.vehiculeValue = '';
        this.brandValue = '';
        this.modelValue = '';
        this.vehiculeOption = '';
        this.brandOption = '';
        this.modelOption = '';
    }

    handleRowActions(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.objectApiName = 'Product2';
                this.currentRecordId = row.Id;
                this.isEditModalOpen = true;
                break;
        }
    }

    handleSuccess() {
        this.isEditModalOpen = false;
        const toastEvent = new ShowToastEvent({
            title: 'Success!',
            message: 'The car was edited correctly',
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
        refreshApex(this.wiredCarInformation); 
    }

    closeEditModal(){
        this.isEditModalOpen = false;
    }

    handleCreateCar(){
        refreshApex(this.wiredCarInformation); 
    }
}
