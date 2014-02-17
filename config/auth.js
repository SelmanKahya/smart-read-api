var crypto = require('crypto');

exports.init = function(passport, passportStrategy){
    //==================================================================
    // Define the strategy to be used by PassportJS
    passport.use(new passportStrategy(
        function(username, password, done) {

            var db = require('../lib/db.js');
            var resultModel = require('../lib/models/result.js');

            // user to be authenticated
            var user = {
                user_email: username,
                user_password: password
            }

            // md5 user password, we wouldn't want to keep user passwords in plain text, right?
            user.user_password = crypto.createHash('md5').update(user.user_password).digest('hex');
                              console.log(user.user_password)
            db.execute('SELECT * FROM user WHERE user_email = ? AND user_password = ?', [user.user_email, user.user_password], function(err, result){

                if(err)
                    return done(null, false, new resultModel.result(false, {}, ['Error while logging in!']));

                else{
                    if(result.length != 1)
                        return done(null, false, new resultModel.result(false, {}, ['Wrong credentials, please try again!']));

                    else
                        done(null, new resultModel.result(true, result[0]));
                }

            });
        }
    ));

    // Serialized and deserialized methods when got from session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

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
