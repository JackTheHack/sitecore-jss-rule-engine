import { ChatBotWidget } from '@jss-rule-engine/chat';
import { Text, Field, withDatasourceCheck } from '@sitecore-jss/sitecore-jss-nextjs';
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

const ChatbotWidget = (props: ChatbotWidgetProps): JSX.Element => (
  <ChatBotWidget 
        welcomeMessage="Hi! I'm Peter, your friendly chatbot, and ready to answer any of your questions." 
        flowId="{EBAA5C94-B003-4169-AA19-BC0EADDB05DC}"
        title="Peter The Bot"
        iconUrl={`${publicUrl}/chatbotify/icons8-sitecore.svg`}/>
);

export default ChatbotWidget;
