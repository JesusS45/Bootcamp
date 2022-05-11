@isTest
public with sharing class LeadController_Test {
    @testSetup 
    static void setup() {
        Lead newLead = new Lead();
        newLead.FirstName = 'Test';
        newLead.LastName = 'Test';
        newLead.Email = 'test@test.com';
        newLead.Company = 'Test';
        newLead.City = 'Test';
        newLead.State = 'Test';
        newLead.LeadSource = 'Bootcamp';
        insert newLead;
    }
    
    @isTest
    static void getAppoitments_Test(){        
        Test.startTest();
        List<Lead> lstLead = LeadController.getAppoitments();
        System.assert(lstLead.size() > 0);
        Test.stopTest();
    }
}