import React, { ComponentType, useContext } from 'react';
import { PersonalizationHelper  } from "../lib/PersonalizationHelper";
import {JssRuleEngine, RuleEngineContext} from "@jss-rule-engine/core"
import { Placeholder, PlaceholderComponentProps, SitecoreContextValue } from '@sitecore-jss/sitecore-jss-nextjs';
import { withSitecoreContext } from '@sitecore-jss/sitecore-jss-react';
import { RuleEnginePersonalizationContext } from '@jss-rule-engine/edge';


export interface PersonalizedPlaceholderComponentProps extends PlaceholderComponentProps
{
    sitecoreContext: SitecoreContextValue; 
}

export class PersonalizedPlaceholder extends React.Component<any,any> {

    graphQLEndpoint:string;
    sitecoreApiKey:string;
    ruleEngine:JssRuleEngine;

    constructor(props:PersonalizedPlaceholderComponentProps) {
        super(props);

        this.graphQLEndpoint = props.endpointUrl as string;
        this.ruleEngine = props.ruleEngine as JssRuleEngine;
        this.sitecoreApiKey = props.sitecoreApiKey as string;

        this.state = {
            elements: null            
        };
    }

    async componentDidMount() {        

        var personalizeOnEdge = this.props.rendering.fields["PersonalizeOnEdge"]

        if(personalizeOnEdge && personalizeOnEdge.value)
        {
            return;
        }        

        const personalizedRenderings = await this.personalizePlaceholder();

        if (personalizedRenderings) {
            console.log('Set personalized renderings', personalizedRenderings);            
            this.setState({
                elements: personalizedRenderings                
            });
        }
    }

    shouldComponentUpdate() {
        return true;
    }

    render() {

        const rendering = {
            ...this.props.rendering
        };

        rendering.placeholders[this.props.name] = this.state.elements ? this.state.elements :
            this.props.hideInitialContents ? [] : rendering.placeholders[this.props.name];


        const placeholderProps: PlaceholderComponentProps = {
            ...this.props,
            rendering,
            name: this.props.name,
        }

        return <Placeholder {...placeholderProps}  />
    }

    isClientside() {
        return typeof window !== 'undefined';
    }

    isDisconnectedMode() {
        const disconnectedMode = this.props.sitecoreContext?.site?.name === 'JssDisconnectedLayoutService';
        return disconnectedMode;
    }

    isPageEditing() {
        const isEditing = this.props.sitecoreContext?.pageEditing;
        return isEditing;
    }

    async personalizePlaceholder() {
        var doRun =
            this.isClientside() &&
            !this.isDisconnectedMode() &&
            !this.isPageEditing();

        if (!doRun) {
            return null;
        }
        
        var elementPlaceholderRenderings = this.props.rendering.placeholders[this.props.name];

        var personalizationRule = this.props.rendering.fields["PersonalizationRules"]                

        if(typeof(window) !== "undefined" && window){          
            this.ruleEngine.setRequestContext({
                url: window.location.href                    
            })
        }

        var ruleEngineContext = this.ruleEngine.getRuleEngineContext() as RuleEngineContext;


        if(!personalizationRule?.value)
        {
            return elementPlaceholderRenderings;
        }
        
        try {
            
            await this.ruleEngine.parseAndRunRule(personalizationRule.value, ruleEngineContext);

            const personalization = ruleEngineContext.sessionContext?.get<RuleEnginePersonalizationContext>("personalization");
            console.log('Personalization data', personalization);

            var placeholderPersonalizationRule = personalization?.placeholders[this.props.name]
    
            console.log("Rule parsed", placeholderPersonalizationRule);

            var personalizationHelper = new PersonalizationHelper(this.graphQLEndpoint, this.sitecoreApiKey);
            var elementPlaceholderRenderings = 
            await personalizationHelper.doPersonalizePlaceholder(placeholderPersonalizationRule, elementPlaceholderRenderings);

            return elementPlaceholderRenderings;
        
        } catch (error) {
            console.warn('Failed to parse personalization rule - ', error);            
            return elementPlaceholderRenderings;
        }
        
        
    }
}

export default withSitecoreContext()<PersonalizedPlaceholderComponentProps>(PersonalizedPlaceholder);
