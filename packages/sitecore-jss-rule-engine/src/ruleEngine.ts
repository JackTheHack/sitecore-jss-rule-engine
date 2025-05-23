import rulesFactory from './rules/initializeRules'
import commandFactory from './commands/initializeCommands'
import operatorFactory from './operators/initializeOperators'

import ruleParser from './ruleParser'
import ruleEngineRunner from './ruleEngineRunner'
import { RuleEngineRequestContext, RuleEngineContext, RuleEngineSitecoreContext, ParsedRuleXmlData, OperatorFunctionDefinition, ConditionFunctionDefinition, ActionFunctionDefinition } from './types/ruleEngine'

export interface IJssRuleEngine {
    commandDefinitions: Map<string, ActionFunctionDefinition>;
    ruleDefinitions: Map<string, ConditionFunctionDefinition>;
    operatorDefinitions: Map<string, OperatorFunctionDefinition>;
    debug: boolean;
    sitecoreContext?: RuleEngineSitecoreContext;
    requestContext?: RuleEngineRequestContext;
    mockDate?: Date;

    setOptions(options?: RuleEngineContext): void;
    initialize(options?: any): void;
    registerCommand(id: string, command: ActionFunctionDefinition): void;
    registerRule(id: string, rule: ConditionFunctionDefinition): void;
    registerOperator(id: string, operator: OperatorFunctionDefinition): void;
    parseRuleXml(ruleXml: string, ruleEngineContext: RuleEngineContext): ParsedRuleXmlData | null;
    setSitecoreContext(sitecoreContext: RuleEngineSitecoreContext): void;
    setRequestContext(requestContext?: RuleEngineRequestContext): void;
    setMockDate(dateObj: Date): void;
    getRuleEngineContext(): RuleEngineContext;
    runRule(parsedRule: ParsedRuleXmlData | null, ruleEngineContext: RuleEngineContext): Promise<any>;
    runRuleActions(parsedRule: ParsedRuleXmlData | null, ruleActions: any, ruleEngineContext: RuleEngineContext): Promise<void>;
    prefetchItems(ruleEngineContext: RuleEngineContext): void;
    parseAndRunRule(ruleXml: any, context?: RuleEngineContext): Promise<any>;
    debugMessage(...args: any[]): void;
}

export class JssRuleEngine implements IJssRuleEngine {
    commandDefinitions: Map<string, ActionFunctionDefinition>
    ruleDefinitions: Map<string, ConditionFunctionDefinition>
    operatorDefinitions: Map<string, OperatorFunctionDefinition>
    debug: boolean
    sitecoreContext?: RuleEngineSitecoreContext
    requestContext?: RuleEngineRequestContext
    mockDate?: Date

    constructor(options?:RuleEngineContext) {
        this.commandDefinitions = new Map<string, any>();
        this.ruleDefinitions = new Map<string, any>();
        this.operatorDefinitions = new Map<string, any>();

        this.setOptions(options);
        this.initialize(options);
    }

    setOptions(options?:RuleEngineContext) {
        if(options)
        {
            this.debug = options.debug ? options.debug : false;
            this.sitecoreContext = options.sitecoreContext;
            this.requestContext = options.requestContext;
            this.mockDate = options.mockDate;
        }

        if(typeof(window) !== "undefined" && window && !this.requestContext)
        {
            if(!this.requestContext)            
            {
                this.requestContext = {
                    url: window.location.href                    
                };
            }            
        }    
        
        this.setRequestContext(this.requestContext)
    }

    initialize(_options:any) {
        rulesFactory(this);
        commandFactory(this);
        operatorFactory(this);
    }

    registerCommand(id:string, command:ActionFunctionDefinition) {
        this.commandDefinitions.set(id, command);
    }

    registerRule(id:string, rule:ConditionFunctionDefinition) {
        this.ruleDefinitions.set(id, rule);
    }

    registerOperator(id:string, operator:OperatorFunctionDefinition) {
        this.operatorDefinitions.set(id, operator);
    }

    parseRuleXml(ruleXml:string, ruleEngineContext:RuleEngineContext) : ParsedRuleXmlData | null {
        var parsedRule = ruleParser(ruleXml, ruleEngineContext);        
        return parsedRule;
    }

    setSitecoreContext(sitecoreContext:RuleEngineSitecoreContext)
    {
        this.sitecoreContext = sitecoreContext;
    }

    setRequestContext(requestContext?:RuleEngineRequestContext)
    {
        this.requestContext = requestContext;        

        if(this.requestContext && 
           this.requestContext.url)            
        {            
            var queryString = this.requestContext.url.indexOf('?')>=0 ? this.requestContext.url.split('?')[1] : '';
            this.requestContext.queryString = queryString;
            const urlParams = new URLSearchParams(this.requestContext.queryString);
            this.requestContext.urlParams = urlParams;
            this.requestContext.cookies = requestContext?.cookies;
        }
    }

    setMockDate(dateObj:Date)
    {
        this.mockDate = dateObj;
    }

    getRuleEngineContext() : RuleEngineContext{

        var dateObj = {
            now: this.mockDate ? this.mockDate : new Date()            
        };

        return {            
            //location: typeof(window) !== "undefined" && window ? window.location : null,
            //cookies: typeof(document) !== "undefined" && document ? document.cookie : null,
            sitecoreContext: this.sitecoreContext,
            requestContext: this.requestContext,
            dateTime: dateObj,
            //env: process.env,
            ruleEngine: this as JssRuleEngine,                        
        };
    }

    async runRule(parsedRule:ParsedRuleXmlData | null, ruleEngineContext:RuleEngineContext){        
        var result = await ruleEngineRunner(parsedRule, ruleEngineContext);
        return result;
    }

    async runRuleActions(parsedRule:ParsedRuleXmlData | null, ruleActions:any, ruleEngineContext:RuleEngineContext) {

        console.log('#### runRuleActions');

        if(!parsedRule?.rules || parsedRule.rules.length != ruleActions.length)
        {
            console.warn("Parsed rules and provided rule actions array lengths doesn't match");
            console.log('$$$$$', parsedRule, ruleActions);
            console.log('#######')
            return;
        }

        if(parsedRule.rules.length == 0)
        {
            console.log('Empty rules array');
        }
        
        var rules = parsedRule.rules;        

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];

            if(ruleActions[i] && rule.actions)
            {
                await Promise.all(rule.actions.map(async(ruleAction)=> {
                    var actionFunction = ruleEngineContext.ruleEngine?.commandDefinitions.get(ruleAction.id);
    
                    if (typeof(actionFunction) === "undefined" || !ruleAction) {
                        throw new Error('Rule definitions missing for id ' + ruleAction.id);
                    }
                    
                    await actionFunction(ruleAction, ruleEngineContext);
                }));                
            }
            
        }
        
        console.log('#### runRuleActions end');
    }

    prefetchItems(_ruleEngineContext: RuleEngineContext){

        //ruleEngineContext.prefetchKeys = uniq(ruleEngineContext.prefetchKeys);

        //TODO: Retrieve items for the rule here
    }

    async parseAndRunRule(ruleXml:any, context?:RuleEngineContext){
        let ruleEngineContext = context ? context : this.getRuleEngineContext();        
        let parsedRule = this.parseRuleXml(ruleXml, ruleEngineContext);
        this.prefetchItems(ruleEngineContext);
        var ruleResult = await this.runRule(parsedRule, ruleEngineContext);        
        return ruleResult;
    }

    debugMessage(..._args: any[])
    {
        if(this.debug && typeof(console) !== 'undefined')
        {            
            console.log.apply(console, arguments);
        }
    }
}

