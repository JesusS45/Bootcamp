/*
 * Author : Jesus Enrique Salazar
 * Description : The component to create a new Car Product.
 */
import { LightningElement, api, track } from 'lwc';
import createNewCar from '@salesforce/apex/ProductController.createNewCar';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateNewProduct extends LightningElement {
    // Public Property
    @api modelOptions;
    @api brandOptions;
    @api colorOptions;
    // Private Property
    modelValue;
    brandValue;
    file;
    fileData;
    colorValue;
    priceValue;
    isActive = false;
    @track isModalOpen = false;

    handleModelOptionSelected(event){
        this.modelValue = event.detail.value;
    }

    handleBrandOptionSelected(event){
        this.brandValue = event.detail.value;
    }

    handleFileAttached(event){
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = () => {
            var base64 = reader.result.split(',')[1];
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
            }
        }
        reader.readAsDataURL(file);
        const toastEvent = new ShowToastEvent({
            title: 'Success!',
            message: 'File uploaded successfully',
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
    }

    handleColorOptionSelected(event){
        this.colorValue = event.detail.value;
    }

    handlePriceChange(event){
        this.priceValue = event.detail.value;
    }
    
    handleActiveProduct(event){
        this.isActive = event.target.checked;
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.modelValue = '';
        this.brandValue = '';
        this.file = '';
        this.fileData = '';
        this.colorValue = '';
        this.priceValue = '';
        this.isActiv = false;
        this.isModalOpen = false;
    }

    submitDetails() {
        const {base64, filename} = this.fileData
        const newProductData = {
            model: this.modelValue,
            brand: this.brandValue,
            fileName: filename,
            fileBase64: base64,
            color: this.colorValue,
            price: this.priceValue,
            isActive: this.isActive
        };
        const data = JSON.stringify(newProductData);
        createNewCar({newProductJson: data})
        .then(() => {
            const createEvent = new CustomEvent('create');
            this.dispatchEvent(createEvent);
        })
        .catch((error) => {
            console.log(error);
        });
        const toastEvent = new ShowToastEvent({
            title: 'Success!',
            message: 'New Car Product added successfully',
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
        this.closeModal();
    }
}