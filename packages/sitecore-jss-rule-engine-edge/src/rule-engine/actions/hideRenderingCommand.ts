import { RuleActionData, RuleEngineContext } from "@jss-rule-engine/core";
import { RuleEnginePersonalizationContext } from "../ruleEngineProvider";

export default async function(command:RuleActionData, ruleContext:RuleEngineContext) {
    //parameters: renderingName, datasourcePath, placeholderName    

    var placeholderName = command.attributes.get("placeholderName");
    var renderingName = command.attributes.get("renderingName");

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

    personalizationContext.placeholders[placeholderName] = placeholder;

    ruleContext.sessionContext?.set("personalization", personalizationContext);

    var rendering = placeholder.renderings.find((i:any) => i.name == renderingName);

    if(rendering)
    {
        //update personalization for the rendering
        rendering.hide = true;
    }else{
        //add new personalization
        var newPersonalization = {
            name: renderingName, 
            hide: true
        };

        placeholder.renderings.push(newPersonalization);
    }
}