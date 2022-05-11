/*
 * Author : Jesus Enrique Salazar
 * Description : The component to show the simulator.
 */
import { LightningElement, wire, track  } from 'lwc';
import getCarModels from '@salesforce/apex/ProductController.getCarModels';
import exportCSVFile from './exportCSVFile'

const columns = [
    { label: '# Pay'},
    { label: 'Unpaid Auto Balance'},
    { label: 'Monthly Auto Capital Payment'},
    { label: 'Monthly Payment of Auto Interest'},
    { label: 'Total Payment with VAT'}            
];

const termOptions = [
    {label: '1', value: '1'},
    {label: '2', value: '2'},
    {label: '3', value: '3'},
    {label: '4', value: '4'},
    {label: '5', value: '5'},
    {label: '6', value: '6'},
    {label: '7', value: '7'},
    {label: '8', value: '8'},
    {label: '9', value: '9'},
    {label: '10', value: '10'},
    {label: '11', value: '11'},
    {label: '12', value: '12'},
];

const CSVFileHeaders = {
    Pay_Number:"# Pay",
    Unpaid_Auto_Balance:"Unpaid Auto Balance",
    Monthly_Auto_Capital_Payment:"Monthly Auto Capital Payment",
    Monthly_Payment_of_Auto_Interest:"Monthly Payment of Auto Interest",
    Total_Payment_with_VAT:"Total Payment with VAT",
}

export default class ProductSimulator extends LightningElement {
    // Public Property
    // Private Property
    columns = columns;
    data;
    termOptions = termOptions;
    modelValue = '';
    amountValue;
    downPaymentValue;
    termValue = '';
    CSVFileHeaders = CSVFileHeaders;
    isButtonDisabled = true;
    @track modelOptions = [];

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

    handleModelOptionSelected(event){
        this.modelValue = event.detail.value;
    }

    handleAmountChange(e) {
        this.amountValue = e.detail.value;
    }

    handleDownPaymentChange(e) {
        this.downPaymentValue = e.detail.value;
    }

    handleTermOptionSelected(event){
        this.termValue = event.detail.value;
    }

    handleCalculatePayment(){
        let paymentCalculation = [];
        let monthlyPayment = (this.amountValue - this.downPaymentValue) / this.termValue;
        let current_unpaid_balance = this.amountValue-this.downPaymentValue
        for (let index = 0; index < this.termValue; index++) {
            const row = {
                'Pay_Number': index+1,
                'Unpaid_Auto_Balance': current_unpaid_balance,
                'Monthly_Auto_Capital_Payment': monthlyPayment,
                'Monthly_Payment_of_Auto_Interest': monthlyPayment*.16,
                'Total_Payment_with_VAT': monthlyPayment*1.16,
            };
            paymentCalculation = [ ...paymentCalculation, row ];
            current_unpaid_balance = current_unpaid_balance-monthlyPayment;
        }
        this.data = paymentCalculation;
        this.isButtonDisabled = false;
    }

    handleDownloadCSVFile(){
        if(this.data || this.data.length){
            exportCSVFile("Simulator Calculation", this.CSVFileHeaders, this.data);
        }
    }
}