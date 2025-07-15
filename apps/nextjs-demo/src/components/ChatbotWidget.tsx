import { ChatBotWidget } from '@jss-rule-engine/chat/client';
import { Field } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';
import config from 'temp/config';

type ChatbotWidgetProps = ComponentProps & {
  fields: {
    heading: Field<string>;
  };
};


// Prefix public assets with a public URL to enable compatibility with Sitecore editors.
// If you're not supporting Sitecore editors, you can remove this.
const publicUrl = config.publicUrl;

const workflowId = process.env.CHAT_WORKFLOW_ID || '{C880D84B-A088-454C-9FB0-78236A81B573}';

const ChatbotWidget = (_props: ChatbotWidgetProps): JSX.Element => (
  <ChatBotWidget 
        welcomeMessage="Hi! I'm Peter, your friendly chatbot, and ready to answer any of your questions." 
        flowId={workflowId}
        title="Peter The Bot"
        iconUrl={`${publicUrl}/chatbotify/icons8-sitecore.svg`}/>
);

export default ChatbotWidget;
