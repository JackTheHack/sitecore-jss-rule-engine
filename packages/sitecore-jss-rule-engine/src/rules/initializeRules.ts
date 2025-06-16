import andRule from './andRule'
import orRule from './orRule'
import websiteNameRule from './websiteNameRule'
import dateHasPassedRule from './dateHasPassedRule'
import dayOfMonthRule from './dayOfMonthRule'
import dayOfWeekRule from './dayOfWeekRule'
import monthOfYearRule from './monthOfYearRule'
import deviceQueryStringRule from './deviceQueryStringRule'
import deviceUserAgentRule from './deviceUserAgentRule'
import fieldComparesToRule from './fieldComparesToRule'
import fieldIsEmptyRule  from './fieldIsEmptyRule'
import fieldTypeRule from './fieldTypeRule'
import itemBaseTemplateRule from './itemBaseTemplateRule'
import itemIdRule from './itemIdRule'
import itemNameRule from './itemNameRule'
import itemTemplateRule from './itemTemplateRule'
import itemAncestorOrSelfRule from './itemAncestorOrSelfRule'
import itemDescendantOrSelfRule from './itemDescendantOrSelfRule'
import itemLevelRule from './itemLevelRule'
import itemPathRule from './itemPathRule'
import itemParentNameRule from './itemParentNameRule'
import itemParentTemplateRule from './itemParentTemplateRule'
import itemIsInSiteContextRule from './itemIsInSiteContextRule'
import requestCookieExistsRule from './requestCookieExistsRule'
import requestCookieValueRule from './requestCookieValueRule'
import requestReferrerRule from './requestReferrerRule'
import requestParamExistsRule from './requestParamExistsRule'
import requestParamValueRule from './requestParamValueRule'
import itemLanguageRule from './itemLanguageRule'
import sitecoreQueryRule from './sitecoreQueryRule'
import trueRule from './trueRule'
import { ruleIds } from '../constants'
import { JssRuleEngine } from '../ruleEngine'

export default function(ruleEngine:JssRuleEngine) {
    //conditions
    ruleEngine.registerCondition(ruleIds.and, andRule) //covered
    ruleEngine.registerCondition(ruleIds.or, orRule) //covered
    
    //context    
    ruleEngine.registerCondition(ruleIds.websiteName, websiteNameRule)

    //dates
    ruleEngine.registerCondition(ruleIds.dateHasPassed, dateHasPassedRule) //covered
    ruleEngine.registerCondition(ruleIds.dayOfMonth, dayOfMonthRule) //covered
    ruleEngine.registerCondition(ruleIds.dayOfWeek, dayOfWeekRule) //covered
    ruleEngine.registerCondition(ruleIds.monthOfYear, monthOfYearRule) //covered

    //device
    ruleEngine.registerCondition(ruleIds.deviceQueryString, deviceQueryStringRule)
    ruleEngine.registerCondition(ruleIds.deviceUserAgent, deviceUserAgentRule)

    //fields
    ruleEngine.registerCondition(ruleIds.fieldComparesTo, fieldComparesToRule)
    ruleEngine.registerCondition(ruleIds.fieldIsEmpty, fieldIsEmptyRule)
    ruleEngine.registerCondition(ruleIds.fieldType, fieldTypeRule)
    
    //item hierarchy
    ruleEngine.registerCondition(ruleIds.itemAncestorOrSelf, itemAncestorOrSelfRule)
    ruleEngine.registerCondition(ruleIds.itemDescendantOrSelf, itemDescendantOrSelfRule)
    ruleEngine.registerCondition(ruleIds.itemLevel, itemLevelRule)
    ruleEngine.registerCondition(ruleIds.itemPath, itemPathRule)
    ruleEngine.registerCondition(ruleIds.itemParentName, itemParentNameRule)
    ruleEngine.registerCondition(ruleIds.itemParentTemplate, itemParentTemplateRule)
    ruleEngine.registerCondition(ruleIds.itemIsInSiteContext, itemIsInSiteContextRule)

    //item information
    ruleEngine.registerCondition(ruleIds.itemBaseTemplate, itemBaseTemplateRule)
    ruleEngine.registerCondition(ruleIds.itemId, itemIdRule)
    ruleEngine.registerCondition(ruleIds.itemName, itemNameRule)
    ruleEngine.registerCondition(ruleIds.itemTemplate, itemTemplateRule)

    //item version
    ruleEngine.registerCondition(ruleIds.itemLanguage, itemLanguageRule)

    //request
    ruleEngine.registerCondition(ruleIds.requestCookieExists, requestCookieExistsRule) //covered
    ruleEngine.registerCondition(ruleIds.requestCookieValue, requestCookieValueRule) //covered
    ruleEngine.registerCondition(ruleIds.requestReferrer, requestReferrerRule) //covered
    ruleEngine.registerCondition(ruleIds.requestParamExists, requestParamExistsRule) //covered
    ruleEngine.registerCondition(ruleIds.requestParamValue, requestParamValueRule) //covered

    //sitecore query
    ruleEngine.registerCondition(ruleIds.sitecoreQuery, sitecoreQueryRule)

    //system
    ruleEngine.registerCondition(ruleIds.true, trueRule)  //covered

}