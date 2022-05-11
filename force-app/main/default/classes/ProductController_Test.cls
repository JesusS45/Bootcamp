@isTest
public with sharing class ProductController_Test {
	@testSetup 
    static void setup() {
    	Product2 newProduct = new Product2();
        newProduct.Name = 'Ford';
        newProduct.Family = 'SUV';
        newProduct.Product_Brand__c = 'Ford';
        newProduct.Product_Color__c = 'Black';
        newProduct.Product_Price__c = 123456;
        newProduct.IsActive = true;
        newProduct.ProductCode = 'CAR';
        insert newProduct;
    }

    @isTest
    static void getCarouselImages_Test(){
        Test.startTest();
        List<Product2> lstCarouselImages = ProductController.getCarsInformation('', '', true);
        System.assert(lstCarouselImages.size() > 0);
        Test.stopTest();
    }
    
    @isTest
    static void getCarsInformation_Test(){
        Test.startTest();
        List<Product2> lstCars = ProductController.getCarsInformation('Ford', 'SUV', false);
        System.assert(lstCars.size() > 0);
        Test.stopTest();
    }
    
    @isTest
    static void getCarBrands_Test(){
        Test.startTest();
        List<String> lstCarBrands = ProductController.getCarBrands();
        System.assert(lstCarBrands.size() > 0);
        Test.stopTest();
    }
    
    @isTest
    static void getCarModels_Test(){
        Test.startTest();
        List<String> lstCarModels = ProductController.getCarModels();
        System.assert(lstCarModels.size() > 0);
        Test.stopTest();
    }
    
    @isTest
    static void getCarColors_Test(){
        Test.startTest();
        List<String> lstCarColors = ProductController.getCarColors();
        System.assert(lstCarColors.size() > 0);
        Test.stopTest();
    }
    
    @IsTest
    static void createNewCar_Test(){
        Test.startTest();
        String jsonData = '{"model":"Micro","brand":"Ford","fileName":"ford.jpg","fileBase64":"/9j/4A","color":"Black","price":"123456","isActive":true}';
        ProductController.createNewCar(jsonData);
        
        List<Product2> lstCar = [SELECT Id, Name FROM Product2 WHERE Family = 'Micro'];
        System.assert(lstCar.size() > 0);
        Test.stopTest();
    }
}