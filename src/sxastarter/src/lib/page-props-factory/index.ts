import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { SitecorePageProps } from 'lib/page-props';

import * as plugins from 'temp/page-props-factory-plugins';
//@ts-ignore
import { getRuleEngineInstance} from 'sitecore-jss-rule-engine'

import { RulesSSGPersonalizationPlugin, RulesSSRPersonalizationPlugin, ResolvePersonalizationPathPlugin } from 'sitecore-jss-rule-engine-nextjs';


import config from 'temp/config'

const ruleEngine = getRuleEngineInstance();

const ssrPersonalizationPlugin = new RulesSSRPersonalizationPlugin(config.graphQLEndpoint, config.sitecoreApiKey, ruleEngine);
const ssgPersonalizationPlugin = new RulesSSGPersonalizationPlugin(config.graphQLEndpoint, config.sitecoreApiKey, ruleEngine);
const resolvePersonalizationPathPlugin = new ResolvePersonalizationPathPlugin();

const middlewarePlugins = Object.values(plugins) as Plugin[];

middlewarePlugins.push(ssrPersonalizationPlugin);
middlewarePlugins.push(ssgPersonalizationPlugin);
middlewarePlugins.push(resolvePersonalizationPathPlugin);


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
        if(!plugin) return props;
        const newProps = await plugin.exec(props, context);
        console.log('Page props plugin - ', plugin?.constructor.name, props.notFound);                
        console.log('Placeholders - ', props.layoutData?.sitecore?.route?.placeholders);
        return newProps;
      }, Promise.resolve({} as SitecorePageProps));

    return extendedProps;
  }
}

export const sitecorePagePropsFactory = new SitecorePagePropsFactory();
