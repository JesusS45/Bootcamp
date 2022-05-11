/*
 * Author : Jesus Enrique Salazar
 * Description : Apex
 */
public without sharing class LeadController {
    // Get all Lead appointments
    @AuraEnabled(cacheable=true)
    public static List<Lead> getAppoitments(){
        List<Lead> appointmentList = new List<Lead>();
        try {
            appointmentList = [SELECT Id, Name, Email, Company, State FROM Lead WHERE LeadSource = 'Bootcamp'];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return appointmentList;
    }
}