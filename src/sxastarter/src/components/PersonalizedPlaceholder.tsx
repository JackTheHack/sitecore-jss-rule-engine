import React from 'react';
import { constants, withSitecoreContext, Placeholder, LayoutServiceData, GraphQLRequestClient } from '@sitecore-jss/sitecore-jss-nextjs';
import createRuleEngine from '../lib/rule-engine/ruleEngineProvider'
import config from 'temp/config';


import { GetItemByIdQuery } from '../lib/queries/getItemById.js'

class ClientSidePlaceholder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            elements: null,
            uid: null
        };
    }

    async componentDidMount() {

        const personalizedRenderings = await this.shouldUpdatePlaceholder();

        if (personalizedRenderings) {
            this.setState({
                elements: personalizedRenderings,
                uid: this.guid()
            });
        }
    }

    render() {
        const rendering = {
            ...this.props.rendering
        };

        rendering.placeholders[this.props.name] = this.state.elements ? this.state.elements :
            this.props.hideInitialContents ? [] : rendering.placeholders[this.props.name];

        const placeholderProps = {
            ...this.props,
            rendering
        }

        return <Placeholder {...placeholderProps} />
    }

    isClientside() {
        return typeof window !== 'undefined';
    }

    isDisconnectedMode() {
        const disconnectedMode = this.props.sitecoreContext.site.name === 'JssDisconnectedLayoutService';
        return disconnectedMode;
    }

    isPageEditing() {
        const isEditing = this.props.sitecoreContext.pageEditing;
        return isEditing;
    }

    guid() {
        var w = () => { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
        return `${w()}${w()}-${w()}-${w()}-${w()}-${w()}${w()}${w()}`;
    }

    async getItemById(itemId: String) {
        if (process.env.JSS_MODE === constants.JSS_MODE.DISCONNECTED) {
            return null;
        }

        const graphQLClient = new GraphQLRequestClient(config.externalGraphQLEndpoint, {
            apiKey: config.sitecoreApiKey,
        });

        var graphQlResponse = await graphQLClient.request(GetItemByIdQuery, {
            "id": itemId
        });
        return graphQlResponse;
    }

    async populateFields(rendering: Object, originalDatasource: any) {

        if (!rendering?.dataSource?.length || rendering.dataSource == originalDatasource) {
            return;
        }

        var itemResult = await this.getItemById(rendering?.dataSource);

        if (!itemResult) {
            return;
        }

        itemResult.item.fields.forEach(async fieldObj => {
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

    async shouldUpdatePlaceholder() {
        var doRun =
            this.isClientside() &&
            !this.isDisconnectedMode() &&
            !this.isPageEditing();

        if (!doRun) {
            return null;
        }

        var elementPlaceholderRenderings = this.props.rendering.placeholders[this.props.name];

        if (!elementPlaceholderRenderings) {
            return null;
        }

        var personalizationRule = this.props.rendering.fields["PersonalizationRules"]

        if (personalizationRule?.value?.length > 0) {

            var ruleEngine = createRuleEngine();
            ruleEngine.setSitecoreContext(this.props.sitecoreContext);
            var ruleEngineContext = ruleEngine.getRuleEngineContext();

            ruleEngine.parseAndRunRule(personalizationRule.value, ruleEngineContext);

            var placeholderPersonalization = ruleEngineContext.personalization?.placeholders[this.props.name];

            if (placeholderPersonalization && placeholderPersonalization.renderings) {

                for (let y = 0; y < elementPlaceholderRenderings.length; y++) {

                    let renderingToUpdate = elementPlaceholderRenderings[y];

                    var originalDatasource = renderingToUpdate.dataSource;

                    var renderingPersonalization = placeholderPersonalization.renderings.find(i => i.name == renderingToUpdate.componentName);

                    if (!renderingPersonalization) {
                        continue;
                    }

                    if (renderingPersonalization.hide) {
                        if (!renderingToUpdate) {
                            console.log('Layout is missing rendering named ', renderingPersonalization.name);
                            continue;
                        }

                        elementPlaceholderRenderings = elementPlaceholderRenderings.filter(y => y.uid != renderingToUpdate.uid);
                    }

                    if (renderingPersonalization.update) {
                        if (!renderingToUpdate) {
                            console.log('Layout is missing rendering named ', renderingPersonalization.name);
                            continue;
                        }

                        if (renderingToUpdate.dataSource != renderingPersonalization.datasource) {

                            renderingToUpdate.dataSource = renderingPersonalization.datasource;

                            await this.populateFields(renderingToUpdate, originalDatasource);

                        }
                    }
                }

                placeholderPersonalization.renderings.filter(i => i.add).forEach(async renderingPersonalization => {

                    var newRendering = {
                        componentName: renderingPersonalization.name,
                        dataSource: renderingPersonalization.datasource,
                        fields: {},
                        params: [],
                        experiences: {},
                        uid: this.guid()
                    };

                    await this.populateFields(newRendering, null);

                    elementPlaceholderRenderings.push(newRendering);
                });


                return elementPlaceholderRenderings;

            } else {
                return elementPlaceholderRenderings;
            }
        }

        return elementPlaceholderRenderings;
    }
}

export default withSitecoreContext()(ClientSidePlaceholder);