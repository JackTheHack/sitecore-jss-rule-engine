import PersonalizedPlaceholder  from "./src/components/PersonalizedPlaceholder";
import { registerNextJS } from '@jss-rule-engine/edge';
import { getRuleEngineInstance } from '@jss-rule-engine/core'


//register commands for global instance
let ruleEngine = getRuleEngineInstance();
registerNextJS(ruleEngine);

//module index.js
export {PersonalizedPlaceholder}
export { PersonalizationHelper } from "./src/lib/PersonalizationHelper";
export { registerNextJS } from '@jss-rule-engine/edge';
export { RulesSSRPersonalizationPlugin } from "./src/plugins/page-props-factory/rulesSSRPersonalizationPlugin";
export { RulesSSGPersonalizationPlugin } from "./src/plugins/page-props-factory/rulesSSGPersonalizationPlugin";
export { ResolvePersonalizationPathPlugin } from "./src/plugins/page-props-factory/resolvePersonalizationPathPlugin";
export { ScPersonalizePlugin, scpersonalizePlugin } from './src/plugins/extractPath/scpersonalize'
export { BaseGraphQLSitemapServiceConfig, BasePersonalizeGraphQLSitemapService } from './src/plugins/sitemapFetcher/base-personalize-graphql-sitemap-service'
export { MultisiteGraphQLSitemapServiceConfig, MultisitePersonalizeGraphQLSitemapService } from './src/plugins/sitemapFetcher/multisite-personalize-sitemap-fetcher'

