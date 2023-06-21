import { linkTrackingTools } from "@/core/link-tracking-tools";
import { createWebHashHistory, createRouter } from "vue-router";
// 1. 定义路由组件.
// 也可以从其他文件导入
const About = { template: '<div>About</div>' }

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
  {
    path: '/',
    name: "/",
    component: () => import("../components/Home.vue")
  },
  {
    path: '/about',
    name: "/about",
    component: About
  },
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})

router.beforeEach(async(to, from, next) => {
  // const user = store.getters.getAccountInfo.adminUser;
  // store.commit("SET_DEFAULT_ORGANIZATION", store.getters.getAccountInfo);
  linkTrackingTools.setOptions({
    ...linkTrackingTools,
    // tracePageName: to.name,
    tracePagePath: to.path,
    extend: {
      // traceUserId: user?.id,
      // traceRealName: user?.realName,
      traceSiteId: to?.params?.sid || "",
      traceProjectId: to?.params?.pid || "",
      tracePageLoadedTime: Date.now()
    }
  })
  next()
})

export default router;