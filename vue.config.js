const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/link-tracking": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // pathRewrite: {
        //   "^/lt": "/"
        // }
      }
    }
  },
  chainWebpack: (config) => {
    if(process.env.npm_config_report) {
      config.plugin("webpack-bundle-analyzer")
      .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin)
      .end();
    }
  }
})
