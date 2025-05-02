export default function isChatMessage(message: any, context:any): boolean {
    // Check if the message has a 'type' property and if it is equal to 'chat'
    return message.type === "chat";
}