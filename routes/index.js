var ctrl = require('../controllers');

exports = module.exports = function(app){
    app.get('/', ctrl.mailCtrl.welcome);
    app.get('/template/all', authUser, ctrl.mailCtrl.getTemplateList);
    app.put('/template', authUser, ctrl.mailCtrl.updateTemplate);
    app.post('/template', authUser, ctrl.mailCtrl.addTemplate);
    app.delete('/template', authUser, ctrl.mailCtrl.deleteTemplate);
    app.get('/user/all', authUser, ctrl.userCtrl.getUserList);
    app.post('/mail/send', authUser, ctrl.mailCtrl.sendMail);
    app.get('/template/:id', authUser, ctrl.mailCtrl.getTemplateByUUID);
    app.post('/user/login', ctrl.userCtrl.login);

    // pre auth
    function authUser(req, res, next){
        if(req.session['isLogin']){
            next();
        }else{
            var data = {
                feedback: {
                    type: 'authFailure',
                    message: '请先登录'
                }
            };
            res.send(data);
        }
    }
};
