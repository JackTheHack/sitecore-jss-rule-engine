import { IChatActionCommand } from "../chatActionFactory";
import { CommandExecutionContext } from "../types";

export default class aiResponseCommand implements IChatActionCommand {
    
    async execute(context: CommandExecutionContext): Promise<void> {
        try{
            const parsedContent = JSON.parse(context.action.content);
            const responseText = parsedContent.response;

            await context.injectMessage(responseText);
        }catch(e)
        {
            console.error("Failed to process ", context.action.type);
        }
        
    }

}