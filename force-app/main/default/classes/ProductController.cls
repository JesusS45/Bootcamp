public without sharing class ProductController {
    static final Integer MAX_CAROUSEL_IMAGES = 5; 

    @AuraEnabled(cacheable=true)
    public static List<Product2> getCarsInformation(String vehiculeOption, String brandOption, String modelOption, Boolean isCarrousel){
        List<Product2> lstCars = new List<Product2>();
        try {
            String query = 'SELECT Id, Product_Brand__c, Family, DisplayUrl, Product_Color__c, Product_Price__c, IsActive FROM Product2 WHERE ProductCode = \'CAR\' ';
            if(String.isNotBlank(brandOption)){
                query += 'AND Product_Brand__c = \'' + String.escapeSingleQuotes(brandOption) + '\'';
            }
            
            if(String.isNotBlank(modelOption)){
                query += 'AND Family = \'' + String.escapeSingleQuotes(modelOption) + '\'';
            }
            
            if(String.isNotBlank(brandOption) || String.isNotBlank(modelOption)){
                lstCars = Database.query(query);
            } else if(isCarrousel){
                lstCars = [SELECT Id, Product_Brand__c, Family, DisplayUrl, Product_Color__c, Product_Price__c, IsActive FROM Product2 WHERE IsActive = True AND ProductCode = 'CAR' ORDER BY CreatedDate DESC LIMIT :MAX_CAROUSEL_IMAGES];
            } else{
                lstCars = [SELECT Id, Product_Brand__c, Family, DisplayUrl, Product_Color__c, Product_Price__c, IsActive FROM Product2 WHERE ProductCode = 'CAR' ORDER BY CreatedDate DESC ];
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return lstCars;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getCarBrands(){
        List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = Product2.Product_Brand__c.getDescribe();
		List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListValue : picklistValues){
			pickListValuesList.add(pickListValue.getLabel());
		}     
		return pickListValuesList;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getCarModels(){
        List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = Product2.Family.getDescribe();
		List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListValue : picklistValues){
			pickListValuesList.add(pickListValue.getLabel());
		}     
		return pickListValuesList;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getCarColors(){
        List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = Product2.Product_Color__c.getDescribe();
		List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListValue : picklistValues){
			pickListValuesList.add(pickListValue.getLabel());
		}     
		return pickListValuesList;
    }

    @AuraEnabled(cacheable=false)
    public static void createNewCar(String newProductJson){
        try {
            Map<String, Object> newCarData = (Map<String, Object>)JSON.deserializeUntyped(newProductJson);
            Product2 newCar = new Product2();
            newCar.Family = (String) newCarData.get('model');
            newCar.Name = (String) newCarData.get('brand');
            newCar.Product_Brand__c = (String) newCarData.get('brand');
            newCar.Product_Color__c = (String) newCarData.get('color');
            newCar.Product_Price__c = Double.valueOf(newCarData.get('price'));
            newCar.IsActive = (Boolean) newCarData.get('isActive');
            newCar.ProductCode = 'CAR';
            insert newCar;

            String fileName = (String) newCarData.get('fileName');
            String fileBase64 = (String) newCarData.get('fileBase64');
            ContentVersion cv = createContentVersion(fileBase64, fileName);
            ContentDocumentLink cdl = createContentLink(cv.Id, newCar.Id);
            ContentDistribution cd = createContentDistribution(cv.Id, fileName);

            Product2 updateNewCarRecord = [SELECT Id, DisplayUrl FROM Product2 WHERE Id =: newCar.Id];
            updateNewCarRecord.DisplayUrl = getCarImageURL(cv.Id,cd.Id);
            update updateNewCarRecord;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = filename;
        cv.PathOnClient = filename;
        try {
            insert cv;
            return cv;
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
    }

      private static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
        if (contentVersionId == null || recordId == null) { return null; }
        
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: contentVersionId].ContentDocumentId;
        cdl.LinkedEntityId = recordId;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        try {
            insert cdl;
            return cdl;
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
    }        

    private static ContentDistribution createContentDistribution(String cvId, String filename){
        ContentDistribution cd = new ContentDistribution();
        cd.Name = filename;
        cd.ContentVersionId = cvId;
        cd.PreferencesAllowViewInBrowser= true;
        cd.PreferencesLinkLatestVersion=true;
        cd.PreferencesNotifyOnVisit=false;
        cd.PreferencesPasswordRequired=false;
        cd.PreferencesAllowOriginalDownload= true;
        try {
            insert cd;
            return cd;
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
    }

    private static String getCarImageURL(String cvId, String cdId){
        ContentVersion cv = [SELECT Id,FileType,ContentBodyId FROM ContentVersion WHERE Id =: cvId];
        ContentDistribution cd = [SELECT Id,DistributionPublicUrl FROM ContentDistribution WHERE Id =: cdId];
        
        String fileType = cv.FileType.toLowerCase().capitalize();
        String cVersionId = cv.Id;
        String cBodyId = cv.ContentBodyId;
        String originalUrl = String.valueOf(cd.DistributionPublicUrl);
        String cDistParam = originalUrl.substring(originalUrl.indexOf('/a/'));
        String orgId = ConnectApi.Organization.getSettings().orgId;
        String baseDomain = Url.getOrgDomainUrl().toExternalForm();
        baseDomain = baseDomain.substringBefore('.') + '--c.documentforce.com';
        String theUrl = baseDomain + '/sfc/dist/version/renditionDownload?rendition=ORIGINAL_' +
            fileType + '&versionId=' + cVersionId + '&operationContext=DELIVERY&contentId=' + cBodyId +
            '&page=0&d=' + cDistParam + '&oid=' + orgId + '&dpt=null&viewId=';
        return theUrl;
    }

}