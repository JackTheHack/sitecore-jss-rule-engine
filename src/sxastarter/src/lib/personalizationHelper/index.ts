import createRuleEngine from '../rule-engine/ruleEngineProvider'
import config from 'temp/config';
import { GetItemByIdQuery } from '../queries/getItemById.js'
import { constants, GraphQLRequestClient } from '@sitecore-jss/sitecore-jss-nextjs';
import { SitecorePageProps } from 'lib/page-props';

class PersonalizationHelper {
    guid() {
        var w = () => { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
        return `${w()}${w()}-${w()}-${w()}-${w()}-${w()}${w()}${w()}`;
    }

    async getItemById(itemId: String, externalEdgeEndpoint: Boolean) {
        if (process.env.JSS_MODE === constants.JSS_MODE.DISCONNECTED) {
            return null;
        }

        const graphQLClient = new GraphQLRequestClient(
            !externalEdgeEndpoint ? config.graphQLEndpoint : config.edgeQLEndpoint, {
            apiKey: config.sitecoreApiKey,
        });

        var graphQlResponse = await graphQLClient.request(GetItemByIdQuery, {
            "id": itemId
        });
        return graphQlResponse;
    }

    async populateFields(rendering: any, externalEdgeEndpoint: Boolean) {

        if (!rendering?.dataSource?.length) {
            return;
        }

        var itemResult = await this.getItemById(rendering?.dataSource, externalEdgeEndpoint);

        if (!itemResult) {
            return;
        }

        itemResult.item.fields.forEach(async (fieldObj: any) => {
            if (rendering.fields[fieldObj.name]?.value) {
                rendering.fields[fieldObj.name].value = fieldObj.value;
            } else {
                rendering.fields[fieldObj.name] = {
                    value: fieldObj.value
                };
            }
        });
        return rendering;
    }

    async doPersonalizePlaceholder(placeholderPersonalization: any, elementPlaceholderRenderings: any, externalEdgeEndpoint: Boolean) {
        if (placeholderPersonalization && placeholderPersonalization.renderings) {

            for (let y = 0; y < elementPlaceholderRenderings.length; y++) {

                let renderingToUpdate = elementPlaceholderRenderings[y];

                var renderingPersonalization = placeholderPersonalization.renderings
                    .find((i: any) => i.name == renderingToUpdate.componentName);

                if (!renderingPersonalization) {
                    continue;
                }

                if (renderingPersonalization.hide) {
                    if (!renderingToUpdate) {
                        console.log('Layout is missing rendering named ', renderingPersonalization.name);
                        continue;
                    }

                    elementPlaceholderRenderings = elementPlaceholderRenderings
                        .filter((y: any) => y.name != renderingToUpdate.componentName);
                }

                if (renderingPersonalization.update) {
                    if (!renderingToUpdate) {
                        console.log('Layout is missing rendering named ', renderingPersonalization.name);
                        continue;
                    }

                    if (renderingToUpdate.dataSource != renderingPersonalization.datasource) {

                        renderingToUpdate.dataSource = renderingPersonalization.datasource;

                        await this.populateFields(renderingToUpdate, externalEdgeEndpoint);

                    }
                }
            }

            var personalizationsToAdd = placeholderPersonalization.renderings.filter((i: any) => i.add);

            for await (const renderingPersonalization of personalizationsToAdd) {
                var newRendering = {
                    componentName: renderingPersonalization.name,
                    dataSource: renderingPersonalization.datasource,
                    fields: {},
                    params: [],
                    experiences: {},
                    uid: this.guid()
                };

                await this.populateFields(newRendering, externalEdgeEndpoint);

                elementPlaceholderRenderings.push(newRendering);
            }

            return elementPlaceholderRenderings;
        }
        else {
            return elementPlaceholderRenderings;
        }
    }

    async personalize(props: SitecorePageProps, personalizationRule: any) {

        let placeholdersLayout = props.layoutData.sitecore.route?.placeholders;

        if (placeholdersLayout && personalizationRule?.value?.length > 0) {

            console.log('Applying personalization')

            var ruleEngine = createRuleEngine();
            var ruleEngineContext = ruleEngine.getRuleEngineContext();

            ruleEngine.parseAndRunRule(personalizationRule.value, ruleEngineContext);

            console.log("Rule parsed")

            var placeholderPersonalizationsKeys = Object.keys(ruleEngineContext.personalization?.placeholders);

            for await (const phName of placeholderPersonalizationsKeys) {
                console.log('Personalizing placeholder - ', phName)

                var placeholderPersonalization = ruleEngineContext.personalization?.placeholders[phName];
                var placeholderRenderings = placeholdersLayout[phName];
                var personalizedRenderings =
                    await this.doPersonalizePlaceholder(placeholderPersonalization, placeholderRenderings, false);
                placeholdersLayout[phName] = personalizedRenderings;
            }
        }

        return props;
    }
}

export const personalizationHelper = new PersonalizationHelper();