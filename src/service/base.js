import * as API from './index'

/**
 * blogger 博主请求
 */
//登录验证
export const LoginBack = (params) => {
    return API.GET('/blogger/login',params);
}

//获取用户（博主）信息
export const GetBloggerInfoById = (params) => {
    return API.GET('/blogger/findBloggerById',params);
}

//修改用户(博主)信息
export const UpdateBloggerInfo = (params) => {
    return API.POST('/blogger/updateBlogger',params);
}

/**
 * general 综合请求
 */
//删除图片（文件）
export const RemoveImg = (params) => {
    return API.GET('/general/deleteImg',params);
}

//统计数据
export const Staticsitc = (params) => {
    return API.GET('/general/staticsitc',params);
}

/**
 * blogtype 博客类型请求
 */
//通过主键查询博客类型
export const FindBlogtypeById = (params) => {
    return API.GET('/blogtype/findBlogtypeById',params);
}

//查询全部博客类型
export const FindAllBlogtype = (params) => {
    return API.GET('/blogtype/findAllBlogtype',params);
}

//分页查询博客类型
export const FindBlogtypeByPage = (params) => {
    return API.GET('/blogtype/findBlogtypeByPage',params);
}

//新增博客类型
export const AddBlogtype = (params) => {
    return API.POST('/blogtype/addBlogtype',params);
}

//修改博客类型
export const UpdateBlogtype = (params) => {
    return API.POST('/blogtype/updateBlogtype',params);
}

//删除博客类型
export const DeleteBlogtype = (params) => {
    return API.GET('/blogtype/deleteBlogtype',params);
}

//批量删除博客类型
export const DeleteBlogtypeList = (params) => {
    return API.POST('/blogtype/deleteBlogtypeList',params);
}

/**
 * link 友情链接请求
 */
//通过主键查询友情链接
export const FindLinkById = (params) => {
    return API.GET('/link/findLinkById',params);
}

//查询全部友情链接
export const FindAllLink = (params) => {
    return API.GET('/link/findAllLink',params);
}

//分页查询友情链接
export const FindLinkByPage = (params) => {
    return API.GET('/link/findLinkByPage',params);
}

//新增友情链接
export const AddLink = (params) => {
    return API.POST('/link/addLink',params);
}

//修改友情链接
export const UpdateLink = (params) => {
    return API.POST('/link/updateLink',params);
}

//删除友情链接
export const DeleteLink = (params) => {
    return API.GET('/link/deleteLink',params);
}

//批量删除友情链接
export const DeleteLinkList = (params) => {
    return API.POST('/link/deleteLinkList',params);
}

/**
 * blog 博客请求
 */
//通过主键查询博客
export const FindBlogById = (params) => {
    return API.GET('/blog/findBlogById',params);
}

//查询全部博客(分页查询，按照type排序)
export const FindAllBlog = (params) => {
    return API.GET('/blog/findAllBlog',params);
}

//查询发布博客的名字
export const FindPublishBlogName = (params) => {
    return API.GET('/blog/findPublishBlogName',params);
}

//查询全部发布博客（分页查询，按照type排序）
export const FindAllPublishBlog = (params) => {
    return API.GET('/blog/findAllPublishBlog',params);
}

//新增博客
export const AddBlog = (params) => {
    return API.POST('/blog/addBlog',params);
}

//修改博客
export const UpdateBlog = (params) => {
    return API.POST('/blog/updateBlog',params);
}

//发表博客
export const PublishBlog = (params) => {
    return API.GET('/blog/publishBlog',params);
}

//增加博客点击数
export const AddBlogClickNum = (params) => {
    return API.GET('/blog/addBlogClickNum',params);
}

//删除博客
export const DeleteBlog = (params) => {
    return API.GET('/blog/deleteBlog',params);
}

//批量删除博客
export const DeleteBlogList = (params) => {
    return API.POST('/blog/deleteBlogList',params);
}

//获取各种类型的博客数量
export const GetBlogNumOfType = (params) => {
    return API.GET('/blog/getBlogNumOfType',params);
}

//通过博客类型查询博客
export const FindBlogByTypeId = (params) => {
    return API.GET('/blog/findBlogByTypeId',params);
}


/**
 * comment 评论请求
 */

 //通过主键查询评论
 export const FindCommentById = (params) => {
     return API.GET('/comment/findCommentById',params);
 }

 //分页查询全部评论
 export const FindAllCommentByPage = (params) => {
     return API.GET('/comment/findAllCommentByPage',params);
 }

 //查询某篇博客的评论 
 export const FindCommentByBlogId = (params) => {
     return API.GET('/comment/findCommentByBlogId',params);
 }

 //添加评论
 export const AddComment = (params) => {
     return API.POST('/comment/addComment',params);
 }

 //删除评论
 export const DeleteComment = (params) => {
     return API.GET('/comment/deleteComment',params);
 }

 //批量删除评论
 export const DeleteCommentList = (params) => {
     return API.POST('/comment/deleteCommentList',params);
 }