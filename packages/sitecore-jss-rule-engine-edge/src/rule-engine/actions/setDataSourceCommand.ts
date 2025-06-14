import { RuleActionData, RuleEngineContext } from "@jss-rule-engine/core";
import { RuleEnginePersonalizationContext } from "../ruleEngineProvider";

export default async function(command:RuleActionData, ruleContext:RuleEngineContext) {
    //parameters: renderingName, datasourcePath, placeholderName

    var placeholderName = command.attributes.get("placeholderName");
    var renderingName = command.attributes.get("renderingName");
    var datasourcePath = command.attributes.get("datasourcePath");

    if(!ruleContext.sessionContext)
    {
        throw new Error("Session context is missing");
    }

    console.log('Running set datasource rendering command');

    let personalizationContext = ruleContext.sessionContext?.get<RuleEnginePersonalizationContext>("personalization");

    if (!personalizationContext) {
        personalizationContext = {
            placeholders: []
        };
    }

    var placeholder = personalizationContext.placeholders[placeholderName];

    var placeholder = placeholder ? placeholder : {
        name: placeholderName,
        renderings: []
    };





    var rendering = placeholder.renderings.find((x:any) => x.name == renderingName);

    if(rendering)
    {
        //update personalization for the rendering
        rendering.datasource = datasourcePath;
    }else{
        //add new personalization
        var newPersonalization = {
            name: renderingName, 
            datasource: datasourcePath,
            update: true
        };
        placeholder.renderings.push(newPersonalization);
    }

    personalizationContext.placeholders[placeholderName] = placeholder;
    console.log('Updated personalization ', personalizationContext)
    ruleContext.sessionContext?.set("personalization", personalizationContext);

}