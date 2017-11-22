const path = {
  apiRoot: '/',
  apiUS: '/us/v1/',
  apiSP: '/sp/v1/',
  apiCP: '/cp/v1/',
  apiPlatform: '/platform/v1/',
  apiOS: '/os/v1/',
  apiCUS: '/cus/v1/',
  apiCU: '/cu/v1/',
  apiCS: '/cs/v1/',
  apiPortal: '/portal/v1/',
  apiUser: '/api/current_user/',
  apiPS: '/ps/v1/'
}
let error = (error) => {
  console.log(error)
  return Promise.reject(error)
}
let reqs = []
let ress = []

export default function (axios) {
  axios.path = path
  axios.clearAllNull = clearAllNull
  axios.clearNull = clearNull
  axios.defaults.headers.common['Authorization'] = cookie2header()
  axios.setError = setError
  axios.addRequest = addRequest
  axios.addResponse = addResponse
  request()
  response()
  return axios
}
// 添加请求拦截器
function request (axios) {
  axios.interceptors.request.use(function (config) {
    repeatAjax()
    reqs.forEach((cb) => {
      cb.call(this, config)
    })
    return config
  }, error)
}
// 添加响应拦截器
function response (axios) {
  axios.interceptors.response.use(function (response) {
    ress.reduce((res, cb) => {
      return cb.call(this, res)
    }, response)
  }, error)
}
function setError (cb) {
  error = cb
}
// 添加请求拦截器
function addRequest (cb) {
  reqs.push(cb)
}
// 添加响应拦截器
function addResponse (cb) {
  ress.push(cb)
}
// 清空所有数据为空的数据
function clearAllNull (obj) {
  return obj
}
// 清空第一层数据为空的数据
function clearNull (obj) {
  return obj
}

function repeatAjax () {
  // window.event
  // event.target
}
// userid to header
function cookie2header () {

}
