import { GraphQLItemProvider, JssRuleEngine } from '@jss-rule-engine/core';

// Placeholder: import or define your RAG DB service here
import { DatabaseService } from '@jss-rule-engine/workflow'
import { getDatabaseServiceOptions } from './dbOptions';

interface IndexSitecoreItemsToRagDbOptions {
  itemId: string;  
  sitecoreApiEndpoint: string;
  sitecoreApiKey: string;  
}

interface IndexSitecoreItemOptions {
  itemId: string;
  itemProvider: GraphQLItemProvider;
  indexId: string;
  indexingRule: string;
  indexedFieldIds: string[];
}

function concatenateItemFields(itemData: any, indexedFieldIds: string[]): string {
  let concatenatedFields = `name: ${itemData?.item?.name}\npath: ${itemData?.item?.path}\n`;
  
  // Check if itemData and fields exist
  if (!itemData?.item?.fields || !Array.isArray(itemData.item.fields)) {
    console.warn('No fields found for item:', itemData?.item?.id);
    return concatenatedFields;
  }
  
  for (const fieldId of indexedFieldIds) {
    const field = itemData.item.fields.find((f: any) => f.name === fieldId);
    if (field && field?.value) {
      concatenatedFields += "```\n" + `#${fieldId}#\n${field?.value}\n` + "```\n\n";
    }
  }
  
  return concatenatedFields;
}

async function indexSitecoreItem(options: IndexSitecoreItemOptions) {
  const { itemId, itemProvider, indexingRule, indexedFieldIds, indexId } = options;

    // 2. Get children of RootItemId
  
  console.log('Getting ', itemId)
  const itemInfo = await itemProvider.getItemById(itemId);
  const children = itemInfo?.item?.children?.results || [];

  const dbServiceOptions = getDatabaseServiceOptions();
  console.log('Creating db service - ', dbServiceOptions);

  const dbService = new DatabaseService(dbServiceOptions);

  // 4. Clean all RAG items if they are parent in RAG DB, but not in item children anymore
  // TODO: Fetch current RAG DB items for this parent/root
  console.log('Getting rag items for parent', itemId);
  const ragDbItems = await dbService.getEmbeddingsByParentId(itemId, indexId);

  console.log('Rag items - ', ragDbItems);

  const currentChildIds = children.map((c: any) => c.id);

  console.log('Current child ids - ', currentChildIds);

  for (const ragItem of ragDbItems) {
    if (!currentChildIds.includes(ragItem.id)) {
      console.log('Removing embedding - ', ragItem.id);
      await dbService.removeEmbedding(ragItem.id, indexId);
    }
  }

  const ruleEngine = new JssRuleEngine();    

  console.log("Indexing children...");

  // 5. Evaluate RAG indexing rule for each indexed item
  for (const child of children) {
    
    console.log("Indexing child ", child.id);

    const itemData = await itemProvider.getItemById(child.id);

    ruleEngine.setSitecoreContext({
      itemId: child.id,
      itemProvider: itemProvider      
    });

    const ruleEngineContext = ruleEngine.getRuleEngineContext();    
    const ruleEngineResult = indexingRule ? await ruleEngine.parseAndRunRule(indexingRule, ruleEngineContext) : true;

    if (ruleEngineResult) {
      // 6. If rule is true, re-index item
      // TODO: Upsert item into RAG DB
      const concatenatedFields = concatenateItemFields(itemData, indexedFieldIds);
      
      await dbService.addEmbedding(
        {
          content: concatenatedFields,
          id: itemData?.item?.id || '',
          parentId: itemData?.item?.parent?.id || '',
          indexId: indexId,
          name: itemData?.item?.name || '',
          path: itemData?.item?.path || ''          
        });
      console.log(`Would re-index item ${child.id}`);
    }
  }

  console.log('Indexing item', itemId)

  ruleEngine.setSitecoreContext({
    itemId: itemId,
    itemProvider: itemProvider     
  });
  const ruleEngineContext = ruleEngine.getRuleEngineContext();    
  const ruleEngineResult = indexingRule ? await ruleEngine.parseAndRunRule(indexingRule, ruleEngineContext) : true;

  // Optionally, index the root item itself
  if (ruleEngineResult) {
    console.log(`Would re-index item ${itemId}`);
    const rootItemData = await itemProvider.getItemById(itemId);

    console.log('Item data - ', rootItemData)

    const concatenatedFields = concatenateItemFields(rootItemData, indexedFieldIds);
    
    const rootParentId = rootItemData?.item?.parent?.id;
    if (rootParentId) {      
      await dbService.addEmbedding({
        id: itemId, 
        parentId: rootParentId,
        indexId: indexId,
        name: rootItemData?.item?.name || '',
        path: rootItemData?.item?.path || '',
        content: concatenatedFields
      });
      console.log('Indexing completed.');
    } else {
      console.warn(`Root item ${itemId} has no parent. Skipping root item indexing.`);
    }
  }
}

export async function indexSitecoreItemsToRagDb(options: IndexSitecoreItemsToRagDbOptions) {
  
  const { itemId, sitecoreApiEndpoint, sitecoreApiKey } = options;
  
  const itemProvider = new GraphQLItemProvider({
    graphEndpoint: sitecoreApiEndpoint,
    apiKey: sitecoreApiKey,
  });
  
  const configItemId = process.env.RAG_CONFIG_ITEMID;

  if(!configItemId){
    console.warn("RAG_CONFIG_ITEMID is not configured. Skipping RAG indexing.");
    return;
  }

  // Get all RAG Index items from the config item
  const ragIndexItems = await itemProvider.getItemDescendantsInfoById(configItemId);  
  
  if (!ragIndexItems || !ragIndexItems?.item?.children || ragIndexItems?.item?.children?.total === 0) {
    console.warn("No RAG Index items found in config. Skipping RAG indexing.");
    return;
  }

  // Process each RAG Index item
  for (const ragIndex of ragIndexItems?.item?.children?.results) {
    // Get the full RAG Index item data to access its fields
    const ragIndexData = await itemProvider.getItemById(ragIndex.id);

    console.log('RAG Index data - ', ragIndexData);
    
    if (!ragIndexData || !ragIndexData?.item?.fields) {
      console.warn(`RAG Index item ${ragIndex.id} has no fields. Skipping.`);
      continue;
    }

    const fields = ragIndexData?.item?.fields;

    console.log("Index fields - ", fields);

    // Extract indexing rule and field IDs from the RAG Index item
    const indexingRule = fields?.find((x:any) => x.name =="IndexingRule")?.value;
    const indexedFieldIdsRaw = fields?.find((x:any) => x.name =="IndexedFieldIDs")?.value || '';
    const enabled = fields?.find((x:any) => x.name =="Enabled")?.value == "1";

    console.log(`Processing RAG Index: ${ragIndex.id}`);
    console.log(`Indexing rule:`, indexingRule, indexedFieldIdsRaw, enabled);

    const indexedFieldIds = indexedFieldIdsRaw
      .split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => !!id);

    
    console.log(`Indexed field IDs: ${indexedFieldIds.join(', ')}`);

    // Index the target item using this RAG Index configuration
    await indexSitecoreItem({
      itemId,
      itemProvider,
      indexId: ragIndex.id,
      indexingRule,
      indexedFieldIds
    });
  }

  return { success: true };
} 