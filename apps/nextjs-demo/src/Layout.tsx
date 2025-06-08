import React from 'react';
import Head from 'next/head';
import { Placeholder, LayoutServiceData, Field, HTMLLink } from '@sitecore-jss/sitecore-jss-nextjs';
import config from 'temp/config';
import Navigation from 'src/Navigation';
import Scripts from 'src/Scripts';

import { getRuleEngineInstance } from '@jss-rule-engine/core';
import { PersonalizedPlaceholder } from '@jss-rule-engine/nextjs';
import { ChatBotWidget } from '@jss-rule-engine/chat';

// Prefix public assets with a public URL to enable compatibility with Sitecore editors.
// If you're not supporting Sitecore editors, you can remove this.
const publicUrl = config.publicUrl;

interface LayoutProps {
  layoutData: LayoutServiceData;
  headLinks: HTMLLink[];
}

interface RouteFields {
  [key: string]: unknown;
  pageTitle: Field;
}

const Layout = ({ layoutData, headLinks }: LayoutProps): JSX.Element => {
  const { route } = layoutData.sitecore;

  const ruleEngineInstance = getRuleEngineInstance();

  const fields = route?.fields as RouteFields;

  return (
    <>
      <Scripts />
      <Head>
        <title>{fields.pageTitle?.value.toString() || 'Page'}</title>
        <link rel="icon" href={`${publicUrl}/favicon.ico`} />
        <link rel="stylesheet" href={`${publicUrl}/chatbotify/style.css`} />
        {headLinks.map((headLink) => (
          <link rel={headLink.rel} key={headLink.href} href={headLink.href} />
        ))}
      </Head>

      <Navigation />
      
      <ChatBotWidget 
        welcomeMessage="Hi! I'm Peter, your friendly chatbot, and ready to answer any of your questions." 
        flowId="{EBAA5C94-B003-4169-AA19-BC0EADDB05DC}"
        title="Peter The Bot"
        iconUrl={`${publicUrl}/chatbotify/icons8-sitecore.svg`}/>

      {/* root placeholder for the app, which we add components to using route data */}
      <div className="container">
        {route && <PersonalizedPlaceholder
          name="headless-main"
          rendering={route}
          endpointUrl={config.edgeQLEndpoint}
          ruleEngine={ruleEngineInstance}
          sitecoreApiKey={config.sitecoreApiKey}
          suppressHydrationWarning
        />}
        {route && <Placeholder name="headless-main" rendering={route} />}
      </div>
    </>
  );
};

export default Layout;
