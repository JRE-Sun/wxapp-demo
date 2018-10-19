let Fly           = require('./fly');
let {ajaxBaseURL} = require('./config');
let http          = new Fly;

http.config.baseURL = ajaxBaseURL;
http.config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
http.config.timeout = 10000;

http.interceptors.request.use(request => {
    // wx.showNavigationBarLoading();
    return request;
});

http.interceptors.response.use(
    response => {
        // wx.hideNavigationBarLoading();
        return response.data
    },
    err => {
        return Promise.resolve("error")
    }
);

module.exports = http;