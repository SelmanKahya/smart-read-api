exports.init = function(passport, passportStrategy){
    //==================================================================
    // Define the strategy to be used by PassportJS

    passport.use(new passportStrategy.DigestStrategy(
        function(username, done) {

            var db = require('../lib/db.js');
            var resultModel = require('../lib/models/result.js');

            // user to be authenticated
            var user = {
                user_email: username
            }

            db.execute('SELECT * FROM user WHERE user_email = ?', [user.user_email], function(err, result){

                if(err)
                    return done(new resultModel.result(false, {}, ['Error while logging in!']));

                else{
                    if(result.length != 1)
                        return done(null, false);

                    else
                        done(null, new resultModel.result(true, result[0]), result[0].user_password);
                }

            });
        }     ,
        function(params, done) {
            // validate nonces as necessary
            done(null, true)
        }
    ));
}


// Define a middleware function to be used for every secured routes
exports.auth = function(req, res, next){
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

exports.getSecretKey = function(){
    return require('./auth_credentials.js').credentials.secret_key;
}
