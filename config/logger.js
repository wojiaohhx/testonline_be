var winston = require('winston');

// 单例logger
exports = module.exports = (function(){
    var instance;

    function create_logger(){
        logger = new winston.Logger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'testonline.log' })
            ]
        });
        return logger;
    }

    return function(){
        if(!instance){
            instance = create_logger();
        }
        return instance;
    }
})();
