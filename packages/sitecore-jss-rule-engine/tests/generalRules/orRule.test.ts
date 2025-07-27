
import test from 'ava'

import * as ruleMocks  from '@coreroot/mocks/ruleMocks'

import { parseAndRun} from '../_testHelpers'

test('orRule', async t => {
    var xml = ruleMocks.orRuleXml;    
    var result = await parseAndRun(xml);
    t.true(result);
})

