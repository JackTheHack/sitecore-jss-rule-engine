import useSitecoreChatPlugin from "./useSitecoreChatPlugin";
import { PluginConfig } from "./pluginConfig";

/**
 * Factory that prepares the plugin hook to be consumed by the core library.
 *
 * @param pluginConfig configurations for the plugin
 */
const SitecoreChatPluginFactory = (pluginConfig?: PluginConfig) => {
    // any custom logic to be ran before hook initialization can be done here
    
    // prepares and returns the plugin hook without calling it, because the
    // initialization of the hook should be handled by the core library itself
    const usePreparedSitecoreChatPlugin = () => useSitecoreChatPlugin(pluginConfig);
    return usePreparedSitecoreChatPlugin;
};

export default SitecoreChatPluginFactory;