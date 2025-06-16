
import runScriptCommand from  './runScriptCommand'
import logMessageCommand from './logMessageCommand'
import { JssRuleEngine } from '../ruleEngine'
import { commandIds } from '../constants'


export default function(ruleEngine:JssRuleEngine) {
    ruleEngine.registerAction(commandIds.runScript, runScriptCommand)
    ruleEngine.registerAction(commandIds.logMessage, logMessageCommand)            
}