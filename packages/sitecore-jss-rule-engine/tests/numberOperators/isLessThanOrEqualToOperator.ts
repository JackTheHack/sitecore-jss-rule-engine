
import test from 'ava'

import { getOperator} from '../_testHelpers'
import { operatorIds } from '@src/constants'

test('isLessThanOrEqualToOperator', async t=> {
    var operator = getOperator(operatorIds.isLessThanOrEqualTo)

    if (!operator) {
        t.fail("Operator not found.");
        return;
    }

    var operatorContext = {
        parameter1: 5,
        parameter2: 5
    }
    var result = await operator(operatorContext);
    t.true(result);

    var operatorContext = {
        parameter1: 4,
        parameter2: 5
    }
    var result = await operator(operatorContext);
    t.true(result);

    var operatorContext = {
        parameter1: 6,
        parameter2: 5
    }
    var result = await operator(operatorContext);
    t.false(result);
})