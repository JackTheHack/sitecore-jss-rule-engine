
import { JssRuleEngine } from '@jss-rule-engine/core'

export function registerWorkflowRuleEngine(ruleEngine:JssRuleEngine)
{
    ruleEngine.registerRule('{0FF3ABD2-064E-42B9-8442-1B9B2F51008E}', addEventListener) //trigger name compares to
    ruleEngine.registerRule('{FB533DCD-E59E-4FB5-ABD6-1ED7D130A6A6}', addRenderingCommand) //chat message compares to
    ruleEngine.registerCommand('{15911B1E-4A68-439F-83C9-A063FAAF9A6C}', hideRenderingCommand) //send chat message
    ruleEngine.registerCommand('{B4F98CF3-08CA-4D2B-987E-4E0B4D8E72EF}', setDataSourceCommand) //set workflow state    
}