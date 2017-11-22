import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import axios from 'axios'
import store from 'store.js'
import cookie from 'js-cookie'
import 'element-ui/lib/theme-chalk/index.css'
import './style/index.less'
import {rvue, rvuex, relem, rserver, rstore, rcookie} from './repair'

window.$vue = rvue(Vue)
window.$vuex = rvuex(Vuex)
window.$elementui = relem(ElementUI)
window.$server = rserver(axios)
window.$store = rstore(store)
window.$cookie = rcookie(cookie)
