import PersonalizedPlaceholder  from "./components/PersonalizedPlaceholder";
import { registerNextJS } from '@jss-rule-engine/edge';
import { getRuleEngineInstance } from '@jss-rule-engine/core'


//register commands for global instance
let ruleEngine = getRuleEngineInstance();
registerNextJS(ruleEngine);

//module index.js
export {PersonalizedPlaceholder}
export { PersonalizationHelper } from "./lib/PersonalizationHelper";
export { registerNextJS } from '@jss-rule-engine/edge';
export { RulesSSRPersonalizationPlugin } from "./plugins/page-props-factory/rulesSSRPersonalizationPlugin";
export { RulesSSGPersonalizationPlugin } from "./plugins/page-props-factory/rulesSSGPersonalizationPlugin";
export { ResolvePersonalizationPathPlugin } from "./plugins/page-props-factory/resolvePersonalizationPathPlugin";
export { ScPersonalizePlugin, scpersonalizePlugin } from './plugins/extractPath/scpersonalize'
export { BasePersonalizeGraphQLSitemapService } from './plugins/sitemapFetcher/base-personalize-graphql-sitemap-service';
export type { BaseGraphQLSitemapServiceConfig } from './plugins/sitemapFetcher/base-personalize-graphql-sitemap-service';
export { MultisitePersonalizeGraphQLSitemapService } from './plugins/sitemapFetcher/multisite-personalize-sitemap-fetcher';
export type { MultisiteGraphQLSitemapServiceConfig } from './plugins/sitemapFetcher/multisite-personalize-sitemap-fetcher';

