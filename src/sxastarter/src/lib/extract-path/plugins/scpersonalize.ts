import { Plugin } from '..';
import { normalizePersonalizedRewrite } from 'lib/personalizationUtils';

class ScPersonalizePlugin implements Plugin {
  exec(path: string) {
    // Remove personalize rewrite segment from the path
    return normalizePersonalizedRewrite(path);
  }
}

export const scpersonalizePlugin = new ScPersonalizePlugin();
