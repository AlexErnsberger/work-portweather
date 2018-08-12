module.exports={
    proxyList:{
        '/api': {
            //开发环境
            target: 'http://10.246.172.130/COLSAPI/CRUDE',
            //是否跨域
            changeOrigin: true,
            //需要rewrite重写
            pathRewrite: {
                '^/api': ''
            }
        },
        // '/api':{
        //      //测试环境
        //      target: 'http://10.246.172.77/CRUDEAPI/CRUDE',
        //      //是否跨域
        //      changeOrigin: true,
        //      //需要rewrite重写
        //      pathRewrite: {
        //          '^/api': ''
        //      }
        // }
    }
}