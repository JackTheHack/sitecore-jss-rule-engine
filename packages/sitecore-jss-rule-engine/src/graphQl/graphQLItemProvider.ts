import { GraphQLRequestClient } from '@sitecore-jss/sitecore-jss/graphql';
import { IItemProvider } from './itemProvider';
import { itemAncestorsByIdQuery } from "./queries/itemAncestorsById"
import { itemDescendantsByIdQuery } from "./queries/itemDescendantsById"
import { itemByIdQuery } from "./queries/itemByIdQuery"

export class GraphQLItemProvider implements IItemProvider {
  endpointUrl: any;
  apiKey: any;
  cache: Map<string, any> = new Map<string, any>()

  constructor(options: any) {
    this.endpointUrl = options.graphEndpoint;
    this.apiKey = options.apiKey;
  }

  async getItemAncestorInfoById(itemId: string) {
    let cacheKey = "anc_"+ itemId;

    if(this.cache.has(cacheKey)){
      return this.cache.get(cacheKey);
    }

    let result =  await this.runQuery(itemAncestorsByIdQuery, { id: itemId });
    this.cache.set(cacheKey, result);
    return result;
  }

  async getItemDescendantsInfoById(itemId: string) {

    let cacheKey = "desc_"+ itemId;

    if(this.cache.has(cacheKey)){
      return this.cache.get(cacheKey);
    }

    let result =  this.runQuery(itemDescendantsByIdQuery, { id: itemId });
    this.cache.set(cacheKey, result);
    return result;
  }

  async getItemById(itemId: string) {

    let cacheKey = "item_"+itemId;

    if(this.cache.has(cacheKey)){
      return this.cache.get(cacheKey);
    }

    let result =  await this.runQuery(itemByIdQuery, { id: itemId });
    this.cache.set(cacheKey, result);

    return result;
  }

  async runQuery(query: any, variables: any) {
    
    let client = new GraphQLRequestClient(this.endpointUrl, {
      apiKey: this.apiKey,
    });

    const response = await client.request(query, variables);

    console.log(response);

    return response;
  }
}
