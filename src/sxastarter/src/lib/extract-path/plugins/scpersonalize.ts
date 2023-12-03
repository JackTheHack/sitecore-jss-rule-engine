import { Plugin } from '..';
import { ScPersonalizePlugin } from 'sitecore-jss-rule-engine-nextjs';

class PersonalizePlugin implements Plugin {
  exec(path: string) {
    // Remove personalize rewrite segment from the path    
    const plugin = new ScPersonalizePlugin();
    return plugin.exec(path);
  }
}

export const scpersonalizePlugin = new PersonalizePlugin();
