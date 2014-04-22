var fs = require('fs');
var _ = require('underscore');
var Q = require('Q');
var uploader = require('file-uploader');
var pool = require('../config').settings.pool;
var mailConfig = require('../config').settings.mailConfig;
var logger = require('../config').logger;

var feedback = {
    type: '',
    message: ''
};

exports = module.exports = {
    welcome: function(req, res){
        res.send('welcome');
    },

    updateTemplate: function(req, res){
        var file_name = req.body.templateName;
        var html_content = _.escape(req.body.templateRaw);
        var template_title = req.body.templateTitle;
        var template_uuid = req.body.templateId;

        logger.info('Start to update Template, and args = (' +
                    'file_name=' + file_name + ', ' +
                    'template_title=' + template_title + ', ' +
                    'template_uuid=' + template_uuid + ')');

        var dataHandler = function(){
            var defferred = Q.defer();
            pool.getConnection(function(err, connection) {
                if(err){
                    defferred.reject(new Error(err));
                    return;
                }
                connection.query('update mail_template set' +
                ' file_name = ' + '"' + file_name + '"' +
                ', html_content = ' + '"' + html_content + '"' +
                ', template_title = ' + '"' + template_title + '"' +
                ' where template_uuid = ' + '"' + template_uuid + '"',
                function(err, result){
                    connection.release();
                    if(err){
                        defferred.reject(new Error(err));
                    }else{
                        defferred.resolve(result);
                    }
                });
            });
            return defferred.promise;
        }

        var fileHandler = function(result){
            var fileUrl = __dirname + '/../app/' + req.body.templateUrl;
            var fileData = _.unescape(req.body.templateRaw);
            try{
                fs.writeFileSync(fileUrl, fileData, 'utf8');
            }catch(err){
                throw(new Error(err));
            }
            return result;
        }

        dataHandler().then(fileHandler).then(function(result){
            logger.info('Updating a template successfully, and the result is: ' + result);
            feedback.type = 'success';
            feedback.message = '邮件模板已更新';
            res.send(feedback);
        }).fail(function(err){
            logger.error('Error occurred in updating a template, and the error is: ' + err);
            feedback.type = 'failure';
            feedback.message = '邮件模板更新失败，错误信息：' + err.toString().substr(0, 80);;
            res.send(feedback);
        }).done();
    },

    addTemplate: function(req, res){
        var file_name = req.body.templateName;
        var html_content = _.escape(req.body.templateRaw);
        var template_title = req.body.templateTitle;
        var template_uuid = req.body.templateId;

        logger.info('Start to update Template, and args = (' +
                    'file_name=' + file_name + ', ' +
                    'template_title=' + template_title + ', ' +
                    'template_uuid=' + template_uuid + ')');

        var dataHandler = function () {
            var defferred = Q.defer();
            pool.getConnection(function(err, connection) {
                connection.query('insert into mail_template set ?', {
                    template_uuid: template_uuid,
                    file_name: file_name,
                    html_content: html_content,
                    template_title: template_title
                }, function(err, result){
                    connection.release();
                    if(err){
                        defferred.reject(new Error(err));
                    }else{
                        defferred.resolve(result);
                    }
                });
            });
            return defferred.promise;
        }

        var fileHandler = function(result){
            var fileUrl = __dirname + '/../app/' + req.body.templateUrl;
            var fileData = _.unescape(req.body.templateRaw);
            try{
                fs.writeFileSync(fileUrl, fileData, 'utf8');
            }catch(err){
                throw(new Error(err));
            }
            return result;
        }

        dataHandler().then(fileHandler).then(function(result){
            logger.info('Adding a template successfully, and the result is: j%', result, {});
            feedback.type = 'success';
            feedback.message = '邮件模板添加成功';
            res.send(feedback);
        }).fail(function(err){
            logger.error('Error occurred in adding a template, and the error is: ' + err);
            feedback.type = 'failure';
            feedback.message = '邮件模板添加失败，错误信息：' + err.toString().substr(0, 80);;
            res.send(feedback);
        }).done();
    },

    getTemplateList: function(req, res){
        logger.info('Start to get template list');

        var dataHandler = function () {
            var defferred = Q.defer();
            pool.getConnection(function(err, connection) {
                connection.query('select template_uuid, file_name,' +
                ' template_title from mail_template', function (err, rows, fields) {
                    connection.release();
                    if (err) {
                        defferred.reject(new Error(err));
                    }else{
                        var data = {templateList: []};
                        _.each(rows, function(row, i){
                            data.templateList[i] = _.pick(row, 'template_uuid', 'template_title', 'file_name');
                        })
                        defferred.resolve(data);
                    }
                });
            });
            return defferred.promise;
        }

        dataHandler().then(function(data){
            logger.info('Getting templates successfully');
            feedback.type = 'success';
            feedback.message = '邮件模板列表获取成功';
            data.feedback = feedback;
            res.send(data);
        }).fail(function(err){
            logger.error('Error occured in getting templates, and the error is: ' + err);
            feedback.type = 'failure';
            feedback.message = '邮件模板列表获取失败，错误信息：' + err.toString().substr(0, 80);;
            var data = {templateList: []};
            data.feedback = feedback;
            res.send(data);
        }).done();
    },

    getTemplateByUUID: function(req, res){
        var template_uuid = req.params.id;
        logger.info('start to update Template, and args = (' +
                    'template_uuid=' + template_uuid + ')');

        var dataHandler = function(){
            var defferred = Q.defer();
            pool.getConnection(function(err, connection){
                connection.query('select template_title,' +
                " html_content from mail_template where template_uuid = '" +
                template_uuid + "'", function(err, rows, fields){
                    connection.release();
                    if (err) {
                        defferred.reject(new Error(err));
                    }else{
                        var templateData = {};
                        if(_.isArray(rows) && !_.isUndefined(rows[0])){
                            templateData = _.pick(rows[0], 'template_uuid', 'template_title', 'html_content');
                            templateData.type = "success";
                            templateData.message = "find template successful";
                        }else{
                            templateData.type = "failure";
                            templateData.message = "find template failed";
                        }
                    }
                    defferred.resolve(templateData);
                });
            });
            return defferred.promise;
        }

        dataHandler().then(function(data){
            logger.info('Getting template by uuid was successful');
            res.send(data);
        }).fail(function(err){
            logger().error('Error occurred in getting template by uuid, and the error is: ' + err);
            res.send(data);
        }).done();
    },

    deleteTemplate: function(req, res){
        var template_uuid = req.body.template_uuid;
        logger.info('start to update Template, and args = (' +
                    'template_uuid=' + template_uuid + ')');

        var dataHandler = function(){
            var defferred = Q.defer();
            var template_uuid = template_uuid;
            pool.getConnection(function(err, connection) {
                connection.query('delete from mail_template where template_uuid = "'+ template_uuid +'"',
                function (err, rows) {
                    connection.release();
                    if(err){
                        defferred.reject(new Error(err));
                    }else{
                        defferred.resolve();
                    }
                });
            });
            return defferred.promise;
        }

        var fileHandler = function(){
            var fileUrl = __dirname + '/../app/views/' + req.body.file_name;
            try{
                fs.unlinkSync(fileUrl);
            }catch(err){
                throw new Error(err);
            }
        }

        dataHandler().then(fileHandler).then(function(){
            logger.info('Deleting template was successful');
            feedback.type = 'success';
            feedback.message = '邮件模板删除成功';
            res.send(feedback);
        }).fail(function(err){
            logger.error('Deleting template was failed, and the error is: ' + err);
            feedback.type = 'failure';
            feedback.message = '邮件模板删除失败，错误信息：' + err.toString().substr(0, 80);
            res.send(feedback);
        }).done();
    },

    sendMail: function(req, res){
        logger.info('Start to send mail');

        var fields = req.body;
        if(!fields){
            feedback.type = 'failure';
            feedback.message = '邮件发送失败，错误信息：' + '请求数据为空';
            res.send(feedback);
        }
        var fieldsArray = _.values(fields);

        // validate send mail data
        var isLegal = _.every(fieldsArray, function(val){
            if(_.isUndefined(val) || val.length < 1){
                return false;
            }else{
                return true;
            }
        })
        if(isLegal){
            logger.info('Mail is sending...');
            uploader.postData(fields, null, mailConfig, {}, function(err, res) {
                if(err){
                    logger.error('Error occurred in sending mail, and the error is: ' + err);
                }else{
                    logger.info('Sending mail was successful');
                }
            });
            feedback.type = 'success';
            feedback.message = '邮件已发送 (抵达状态请于log中查询)';
            res.send(feedback);
        }else{
            logger.error('Error occurred in sending mail, and the error is: Post data was wrong');
            feedback.type = 'failure';
            feedback.message = '邮件发送失败，错误信息：' + '请求数据部分字段格式错误';
            res.send(feedback);
        }
    }
}
