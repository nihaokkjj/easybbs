import request from './Request'
//封装接口式的写法
export const loadArticleList = (params) => {
  return request({
    url: "/forum/loadArticle",
    params: params
  })
}

export const loadBoard = (params) => {
  return request({
    url: "/forum/loadArticle",
    params: params
  })
}

