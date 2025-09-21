import { defineStore } from "pinia";
import {ref, computed} from 'vue'

//原版视频用的vuex, 这里为了练习,采用的pinia
export const useUserStore = defineStore('user', () => {

    const loginUserInfo = ref() //用户信息
    const showLogin = ref(false) //是否展示登录

    const boardList = ref([]) //板块信息

    const activePboardId = ref(0) //一级板块
    const activeBoardId = ref(0) //二级板块

    //更新用户登录信息
    function updateLoginUserInfo(value) {
        loginUserInfo.value = value
    }
    //登录弹窗显示
    function changeLoginState(value) {
        showLogin.value = value
    }
    const getSubBoardList = computed(() => (boardId)=> {
        
        let board = boardList.value.find(item => {
            return item.boardId == boardId
        })
        return board ? board.children : []
    })
    function saveBoardList(value) {
        boardList.value = value
    }
    return {
        loginUserInfo,
        updateLoginUserInfo,
        showLogin,
        getSubBoardList,
        saveBoardList,
        boardList,
        activeBoardId,
        activePboardId,
        changeLoginState,
    }
})