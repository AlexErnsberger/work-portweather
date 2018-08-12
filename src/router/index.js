import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router =new Router({
  routes: [
    {
      path: '/portsWeather',
      name: 'portsWeather',
      component: require('../views/portsWeather').default,
      alias:'/'
    },
    {
      path: '*', redirect: '/'
    }
  ]
})

export default router
