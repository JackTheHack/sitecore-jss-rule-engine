/**
 * @param {import('next').NextConfig} nextConfig
 */



const aliasPlugin = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack: (config, options) => {

      console.log("Processing alias plugin");

      const path = require('path');
      
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      config.resolve.alias['@src'] = path.resolve(__dirname, '../../../../../../src');
      config.resolve.alias['@utils'] = path.resolve(__dirname, '../../../../../../src/utils');

      console.log('Webpack config: ', config.resolve.alias);

      return config;
    }
  });
};

module.exports = aliasPlugin;
