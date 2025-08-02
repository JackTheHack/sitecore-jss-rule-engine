import { GraphQLItemProvider, JssRuleEngine } from '@jss-rule-engine/core';

// Placeholder: import or define your RAG DB service here
import { getDatabaseServiceOptions } from './dbOptions';
import { DatabaseService } from '../databaseService';


export interface IndexSitecoreItemOptions {
  itemId: string;
  itemProvider: GraphQLItemProvider;
  indexId: string;
  indexSource: string;
  indexingRule: string;
  indexedFieldIds: string[];
  ruleEngine: JssRuleEngine
}

export function concatenateItemFields(itemData: any, indexedFieldIds: string[]): string {
  let concatenatedFields = `name: ${itemData?.item?.name}\npath: ${itemData?.item?.path}\n`;
  
  // Check if itemData and fields exist
  if (!itemData?.item?.fields || !Array.isArray(itemData.item.fields)) {
    console.warn('No fields found for item:', itemData?.item?.id);
    return concatenatedFields;
  }
  
  for (const fieldId of indexedFieldIds) {
    const field = itemData.item.fields.find((f: any) => f.name === fieldId);
    if (field && field?.value) {
      // Strip HTML tags from the field value before concatenating
      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
      concatenatedFields += "```\n" + `#${fieldId}#\n${stripHtml(field?.value)}\n` + "```\n\n";
    }
  }
  
  return concatenatedFields;
}

export async function indexSitecoreItem(options: IndexSitecoreItemOptions) {
  const { itemId, itemProvider, indexingRule, indexSource, indexedFieldIds, indexId } = options;

    // 2. Get children of RootItemId
  
  console.log('Getting ', itemId)
  const itemInfo = await itemProvider.getItemById(itemId);

  if(!indexSource){
    console.log('Missing index source');
    return;
  }

  console.log('Getting index source item', indexSource)
  const indexSourceItem = await itemProvider.getItemById(indexSource);

  console.log('Indexing check: ', itemInfo?.item.path, indexSourceItem?.item.path);

  if(!itemInfo?.item.path.indexOf(indexSourceItem?.item.path)){
    console.log('Not part of RAG index. Skipping.', itemInfo.path, indexSource);
    return;
  }

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

  const ruleEngine = options.ruleEngine;      

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
