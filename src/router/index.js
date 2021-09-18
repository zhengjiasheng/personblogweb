import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router =  new Router({
  mode: 'hash',
  base: '/',
  routes: [
    {
      path:'/',
      redirect:'/login'
    },
    {
      path:'/login',
      name:'login',
      component: resolve => require(['../page/back/Loginback.vue'],resolve),
      meta:{
        title:'后台登录'
      }
    },
    {
      path:'/front',
      name:'front',
      redirect:'/front/homePage',
      component: resolve => require(['../page/front/Homefront.vue'],resolve),
      meta:{
        title:'前台'
      },
      children:[
        {
          path:'homePage',
          name:'homePage',
          component: resolve => require(['../page/front/homefront/home_page.vue'],resolve),
          meta:{
            title:'首页'
          },
        },
        {
          path:'typePage',
          name:'typePage',
          component: resolve => require(['../page/front/homefront/type_page.vue'],resolve),
          meta:{
            title:'分类'
          },
        },
        {
          path:'linkPage',
          name:'linkPage',
          component: resolve => require(['../page/front/homefront/link_page.vue'],resolve),
          meta:{
            title:'友链'
          },
        },
        {
          path:'commentPage',
          name:'commentPage',
          component: resolve => require(['../page/front/homefront/comment_page.vue'],resolve),
          meta:{
            title:'评论'
          },
        },
        {
          path:'aboutMe',
          name:'aboutMe',
          component: resolve => require(['../page/front/homefront/about_me.vue'],resolve),
          meta:{
            title:'关于我'
          },
        },
        {
          path:'blogDetail',
          name:'blogDetail',
          component: resolve => require(['../page/front/homefront/blog_detail.vue'],resolve),
          meta:{
            title:'博客详情'
          },
          beforeEnter(to,from,next){
            if(!to.query.blog_id || !to.query.blog_title){
              next({path:'/front'});
            }
            next();
          }
        }
      ]
    },
    {
      path:'/back',
      name:'back',
      redirect:'/back/manageHome',
      component: resolve => require(['../page/back/Homeback.vue'],resolve),
      meta:{
        title:'后台管理'
      },
      children:[
        {
          path:'manageHome',
          name:'manageHome',
          component: resolve => require(['../page/back/homeback/home_manage.vue'],resolve),
          meta:{
            title:'管理首页'
          },
        },
        {
          path:'addBlog',
          name:'addBlog',
          component: resolve => require(['../page/back/homeback/add_blog.vue'],resolve),
          meta:{
            title:'新增博客'
          },
        },
        {
          path:'manageBlog',
          name:'manageBlog',
          component: resolve => require(['../page/back/homeback/blog_manage.vue'],resolve),
          meta:{
            title:'博客管理'
          },
        },
        {
          path:'manageComment',
          name:'manageComment',
          component: resolve => require(['../page/back/homeback/comment_manage.vue'],resolve),
          meta:{
            title:'评论管理'
          },
        },
        {
          path:'manageBlogType',
          name:'manageBlogType',
          component: resolve => require(['../page/back/homeback/blogtype_manage.vue'],resolve),
          meta:{
            title:'分类管理'
          },
        },
        {
          path:'friendLink',
          name:'friendLink',
          component: resolve => require(['../page/back/homeback/friend_link.vue'],resolve),
          meta:{
            title:'友情链接'
          },
        },
        {
          path:'manageUser',
          name:'manageUser',
          component: resolve => require(['../page/back/homeback/user_manage.vue'],resolve),
          meta:{
            title:'用户管理'
          },
        },
        {
          path:'jscoreStudy',
          name:'jscoreStudy',
          component: resolve => require(['../page/back/homeback/jscoreStudy.vue'],resolve),
          meta:{
            title:'jscoreStudy'
          },
        }
      ]
    }
  ]
});

//路由拦截
router.beforeEach((to,from,next) => {
  if(to.meta.title){
    document.title = to.meta.title;
  }
  next();
});

export default router