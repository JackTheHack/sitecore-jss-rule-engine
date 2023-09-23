import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { SitecorePageProps } from 'lib/page-props';

import config from 'temp/config'
import * as plugins from 'temp/page-props-factory-plugins';
//@ts-ignore
import { getRuleEngineInstance} from 'sitecore-jss-rule-engine'
import { RulesPersonalizationPlugin } from 'sitecore-jss-rule-engine-nextjs';

var middlewarePlugins = Object.values(plugins) as Plugin[];

var ruleEngine = getRuleEngineInstance();

var personalizationPlugin = new RulesPersonalizationPlugin(config.graphQLEndpoint, config.sitecoreApiKey, ruleEngine);

middlewarePlugins.push(personalizationPlugin)


/**
 * Determines whether context is GetServerSidePropsContext (SSR) or GetStaticPropsContext (SSG)
 * @param {GetServerSidePropsContext | GetStaticPropsContext} context
 */
export const isServerSidePropsContext = function (
  context: GetServerSidePropsContext | GetStaticPropsContext
): context is GetServerSidePropsContext {
  return (<GetServerSidePropsContext>context).req !== undefined;
};

export interface Plugin {
  /**
   * Detect order when the plugin should be called, e.g. 0 - will be called first (can be a plugin which data is required for other plugins)
   */
  order: number;
  /**
   * A function which will be called during page props generation
   */
  exec(
    props: SitecorePageProps,
    context: GetServerSidePropsContext | GetStaticPropsContext
  ): Promise<SitecorePageProps>;
}

export class SitecorePagePropsFactory {
  /**
   * Create SitecorePageProps for given context (SSR / GetServerSidePropsContext or SSG / GetStaticPropsContext)
   * @param {GetServerSidePropsContext | GetStaticPropsContext} context
   * @see SitecorePageProps
   */
  public async create(
    context: GetServerSidePropsContext | GetStaticPropsContext
  ): Promise<SitecorePageProps> {      

    const extendedProps = await middlewarePlugins
      .sort((p1, p2) => p1.order - p2.order)
      .reduce(async (result, plugin) => {        
        
        const props = await result;        
        const newProps = await plugin.exec(props, context);
        return newProps;
      }, Promise.resolve({} as SitecorePageProps));

    return extendedProps;
  }
}

export const sitecorePagePropsFactory = new SitecorePagePropsFactory();
