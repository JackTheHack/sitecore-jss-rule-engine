import { SitecorePageProps } from 'lib/page-props';
import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { Plugin, isServerSidePropsContext } from '..';
import { getRuleEngineInstance} from '@jss-rule-engine/core'
import { RulesSSGPersonalizationPlugin, RulesSSRPersonalizationPlugin } from '@jss-rule-engine/nextjs';
import config from 'temp/config'

class ScRulesPersonalization implements Plugin {
  private ssgPersonalizePlugin: RulesSSGPersonalizationPlugin;
  private ssrPersonalizePlugin: RulesSSRPersonalizationPlugin;

  order = 3;

  constructor() {
    const ruleEngine = getRuleEngineInstance();
    this.ssgPersonalizePlugin = new RulesSSGPersonalizationPlugin(config.graphQLEndpoint, config.sitecoreApiKey, ruleEngine); 
    this.ssrPersonalizePlugin = new RulesSSRPersonalizationPlugin(config.graphQLEndpoint, config.sitecoreApiKey, ruleEngine); 
    this.order = Math.min(this.ssgPersonalizePlugin.order, this.ssrPersonalizePlugin.order);
  }

  async exec(props: SitecorePageProps, context: GetServerSidePropsContext | GetStaticPropsContext) {
    if (!props.layoutData.sitecore.route) return props;

    // Retrieve component props using side-effects defined on components level
    if (isServerSidePropsContext(context)) {
      return await this.ssrPersonalizePlugin.exec(props, context);
    } else {
      return await this.ssgPersonalizePlugin.exec(props, context);
    }
  }
}

export const scRulePersonalizationPlugin = new ScRulesPersonalization();
