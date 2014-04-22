var fs = require('fs');
var _ = require('underscore');
var Q = require('Q');
var md5 = require('MD5');
var settings = require('../config').settings;
var pool = settings.pool;
var loginConfig = settings.loginConfig;
var logger = require('../config').logger;

var feedback = {
    type: '',
    message: ''
};

exports = module.exports = {
    getUserList: function(req, res){
        logger.info('Start to getting user list');
        var dataHandler = function () {
            var defferred = Q.defer();
            pool.getConnection(function(err, connection) {
                if(err){
                    defferred.reject(new Error(err));
                }
                connection.query('select email, username from user', function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        deferred.reject(new Error(error));
                    }else{
                        var data = {userList: []};
                        _.each(rows, function(row, i){
                            data.userList[i] = _.pick(row, 'email', 'username');
                        })
                        defferred.resolve(data);
                    }
                });
            });
            return defferred.promise;
        }
        dataHandler().then(function(data){
            logger.info('Getting user list is successful')
            feedback.type = 'success';
            feedback.message = '用户列表获取成功';
            data.feedback = feedback;
            res.send(data);
        }).fail(function(err){
            logger.error('Error occurred in getting user list, and the error is: ' + err);
            feedback.type = 'failure';
            feedback.message = '用户列表获取失败，错误信息：' + err.toString().substr(0, 80);
            var data = {templateList: []};
            data.feedback = feedback;
        }).done();
    },

    login: function(req, res){
        logger.info('Start to login');
        var username = req.body.username;
        var password = req.body.password;
        var ip = req.ip;
        var data = {};
        if(_.isString(username) && _.isString(password)){
            var distPassword = md5(loginConfig.password);
            if(username === loginConfig.username && password === distPassword){
                logger.info('Login successfully, and the user ip is: ' + ip);
                feedback.type = 'success';
                feedback.message = '登录成功';
                req.session['isLogin'] = true;
            }else{
                logger.error('Login faillingly, and the user ip is: ' + ip);
                feedback.type = 'failure';
                feedback.message = '用户名或密码错误';
                req.session['isLogin'] = false;
            }
        }else{
            logger.error('Login faillingly, and the user ip is: ' + ip);
            feedback.type = 'failure';
            feedback.message = '用户名或密码错误';
        }
        data.feedback = feedback;
        res.send(data);
    }
}
