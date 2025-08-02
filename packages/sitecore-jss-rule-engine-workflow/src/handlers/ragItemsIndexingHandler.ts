import { GraphQLItemProvider, JssRuleEngine } from "@jss-rule-engine/core";
import { indexSitecoreItem } from "../db/indexSitecoreItemsToRagDb";

export async function ragItemsIndexingHandler({
    itemId,
    registerRuleEngine
}: {
    itemId: string,
    registerRuleEngine?: (ruleEngine: JssRuleEngine) => void
}) {

    try {
        const sitecoreEdgeUrl = process.env.EDGE_QL_ENDPOINT || '';
        const sitecoreApiKey = process.env.SITECORE_API_KEY || '';

        const itemProvider = new GraphQLItemProvider({
            graphEndpoint: sitecoreEdgeUrl,
            apiKey: sitecoreApiKey,
        });

        const configItemId = process.env.RAG_CONFIG_ITEMID;

        if (!configItemId) {
            console.warn("RAG_CONFIG_ITEMID is not configured. Skipping RAG indexing.");
            return {
                success: false,
                errorMessage: "RAG_CONFIG_ITEMID is not configured. Skipping RAG indexing.",
                errorCode: 400
            };
        }

        const ruleEngine = new JssRuleEngine();
        if(registerRuleEngine)
        {
            registerRuleEngine(ruleEngine);
        }

        // Get all RAG Index items from the config item
        const ragIndexItems = await itemProvider.getItemDescendantsInfoById(configItemId);

        if (!ragIndexItems || !ragIndexItems?.item?.children || ragIndexItems?.item?.children?.total === 0) {
            console.warn("No RAG Index items found in config. Skipping RAG indexing.");
            return {
                success: false,
                errorMessage: "No RAG Index items found in config. Skipping RAG indexing.",
                errorCode: 400
            };
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
            const indexingRule = fields?.find((x: any) => x.name == "IndexingRule")?.value;
            const indexedFieldIdsRaw = fields?.find((x: any) => x.name == "IndexedFieldIDs")?.value || '';
            const enabled = fields?.find((x: any) => x.name == "Enabled")?.value == "1";
            const source = fields?.find((x:any) => x.name == "Source")?.value;

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
                indexSource: source,
                indexingRule,
                indexedFieldIds,
                ruleEngine
            });
        }

        return {
            success: true
        };

    } catch (error) {
        return {
            success: false,
            errorCode: 500,
            errorMessage: error?.toString()
        };
    }
} 