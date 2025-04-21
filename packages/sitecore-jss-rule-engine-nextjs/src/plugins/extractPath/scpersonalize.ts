interface Plugin {
  /**
   * A function which will be called during path extraction
   */
  exec(path: string): string;
}

import { normalizePersonalizedRewrite } from '@jss-rule-engine/edge';

export class ScPersonalizePlugin implements Plugin {
  exec(path: string) {
    // Remove personalize rewrite segment from the path
    console.log('ScPersonalizePlugin', path);
    return normalizePersonalizedRewrite(path);
  }
}

export const scpersonalizePlugin = new ScPersonalizePlugin();
