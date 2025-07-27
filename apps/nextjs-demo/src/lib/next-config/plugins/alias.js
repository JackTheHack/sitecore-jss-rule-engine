/**
 * @param {import('next').NextConfig} nextConfig
 */



const aliasPlugin = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack: (config, options) => {

      const path = require('path');
      
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      config.resolve.alias['@src'] = path.resolve(__dirname, 'src');
      config.resolve.alias['@utils'] = path.resolve(__dirname, 'src/utils');

      return config;
    }
  });
};

module.exports = aliasPlugin;
