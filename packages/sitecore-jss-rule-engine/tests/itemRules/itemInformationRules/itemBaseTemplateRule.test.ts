
import test from 'ava'

import * as ruleMocks from '@coreroot/mocks/ruleMocks'
import { parseAndRun } from '@coreroot/tests/_testHelpers';
import { sitecoreContextMockBuilder } from '@coreroot/mocks/itemMockBuilder';


test('itemBaseTemplateRule', async t => {
    var xml = ruleMocks.itemBaseTemplateRuleXml;
    
    var itemMock1 = 
        sitecoreContextMockBuilder("item1", "item1")
        .fieldValue("Title", "")
        .getInstance();

    let ruleEngineOptions1 = {
        sitecoreContext: itemMock1
    };

    var result = await parseAndRun(xml, ruleEngineOptions1);
    t.true(result);
});