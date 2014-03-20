var db = require('../lib/db.js');
var resultModel = require('../lib/models/result.js');
var crypto = require('crypto');

// import mandrill to send emails
var mandrill_api_key = require('../config/auth_credentials.js').credentials.mandrill_api_key;
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(mandrill_api_key);

// register a user
exports.register = function(req, res){

    // user to be created
    var user = {
        user_first_name: req.body.user_first_name,
        user_last_name: req.body.user_last_name,
        user_email: req.body.user_email,
        user_password: req.body.user_password,
        user_gender: req.body.user_gender,
        user_created_date: new Date()
    }

    // md5 user password, we wouldn't want to keep user passwords in plain text, right?
    user.user_password = crypto.createHash('md5').update(user.user_password).digest('hex');

    db.execute('SELECT * FROM user WHERE user_email = ?', [user.user_email], function(err, result){

        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while registering!]']));

        else{

            // if no user with given email
            if(result.length == 0){

                db.execute('INSERT INTO user SET ?', user, function(err, result){
                    if(err)
                        res.send(500, new resultModel.result(false, {}, 'Error while creating the user!'));

                    else{
                        user.user_id = result.insertId;
                        res.send(new resultModel.result(true, user));
                    }
                });
            }

            else
                res.send(new resultModel.result(false, {}, ['Username (' + user.user_email + ') already exists. Please register with another e-mail address!']));
        }
    });


};

//==================================================================
// route to test if the user is logged in or not
exports.loggedin = function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
};

// route to log in
exports.login = function(req, res) {
    res.send(req.user);
};

// route to log out
exports.logout = function(req, res) {
    req.logOut();
    res.send(200);
};

// route to forgot password
exports.forgot = function(req, res) {

    var email = req.body.user_email;

    db.execute('SELECT * FROM user WHERE user_email = ?', [email], function(err, result){

        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while looking up user information!]']));

        else{

            // if no user with given email
            if(result.length == 1){

                var user = result[0];
                var newPassword = generatePassword();
                var newHashedPassword = crypto.createHash('md5').update(newPassword).digest('hex');

                db.execute('UPDATE user SET user_password = ? WHERE user_id = ?', [newHashedPassword, user.user_id], function(err, result){
                    if(err)
                        res.send(new resultModel.result(false, {}, 'Error happened while sending the new password. Please try again later.'));
                    else {
                        var userNameSurname = user.user_first_name + " " + user.user_last_name;
                        var message = {
                            "text": "Thanks for using Smart-Read! Your new password: " + newPassword,
                            "subject": "Your new Smart-Read Password!",
                            "from_email": "smartreadproject@gmail.com",
                            "from_name": "Smart-Read Ebook Reader",
                            "to": [{
                                "email": email,
                                "name": userNameSurname,
                                "type": "to"
                            }],
                            "headers": {
                                "Reply-To": "smartreadproject@gmail.com"
                            },
                            "important": true
                        };

                        var mandrill_config = {
                            "message": message,
                            "async": true,
                            "ip_pool": null,
                            "send_at": null
                        };

                        mandrill_client.messages.send(mandrill_config, function(result) {
                            res.send(new resultModel.result(true, {user_email: email}));
                        }, function(e) {
                            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                            res.send(new resultModel.result(false, {}, 'Error happened while sending the new password. Please try again later.'));
                        });
                    }
                });
            }

            else
                res.send(new resultModel.result(false, {}, ['Username with (' + email + ') doesn\'t exists. Please try another e-mail address!']));
        }
    });
};

function generatePassword() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";
    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}