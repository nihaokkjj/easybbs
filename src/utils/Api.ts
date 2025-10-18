import request from './Request'
import {type ApiResponse} from './Request'


//封装接口式的写法
export const loadArticleList = (params: any) => {
  return request({
    url: "/forum/loadArticle",
    params: params
  })
}

export const loadBoard = (params: any) => {
  return request({
    url: "/forum/loadArticle",
    params: params
  })
}

