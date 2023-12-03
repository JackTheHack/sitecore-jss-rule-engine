import { SitecorePageProps } from 'lib/page-props';
import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { Plugin } from '..';
import { ResolvePersonalizationPathPlugin } from 'sitecore-jss-rule-engine-nextjs';

class ScRulesResolvePersonalization implements Plugin {
  private resolvePersonalizePlugin: ResolvePersonalizationPathPlugin;

  order = 3;

  constructor() {
    this.resolvePersonalizePlugin = new ResolvePersonalizationPathPlugin(); 
    this.order = this.resolvePersonalizePlugin.order;
  }

  async exec(props: SitecorePageProps, context: GetServerSidePropsContext | GetStaticPropsContext) {
    return await this.resolvePersonalizePlugin.exec(props, context);
  }
}

export const scRuleResolvePersonalizationPlugin = new ScRulesResolvePersonalization();
