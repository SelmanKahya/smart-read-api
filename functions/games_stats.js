var db = require('../lib/db.js');
var resultModel = require('../lib/models/result.js');

// new game stat
exports.create = function(req, res){

    var game = req.params.game;
    var action = req.params.action;
    var stats_name = getStatName(game,action);

    if(stats_name){
        db.execute('UPDATE stats SET stats_value = stats_value + 1 WHERE stats_name = ?', [stats_name], function(err, result){
            if(err)
                res.send(500, new resultModel.result(false, {}, 'Error while creating a new stat!'));

            else
                res.send(new resultModel.result(true, {}));
        });
    }

    else
        res.send(new resultModel.result(false, {}, 'Error while creating stat! - wrong parameters.'));
};

// return stat
exports.read = function(req, res){

    var game = req.params.game;
    var action = req.params.action;
    var stats_name = getStatName(game,action);

    if(stats_name){

        db.execute('SELECT stats_value FROM stats WHERE stats_name = ?', [stats_name], function(err, result){
            if(err)
                res.send(500, new resultModel.result(false, {}, 'Error while getting stat!'));

            else{
                res.send(new resultModel.result(true, result));
            }
        });
    }

    else
        res.send(new resultModel.result(false, {}, 'Error while getting stat! - wrong parameters.'));

};

var getStatName = function(game, action){

    if(!game || !action)
        return false;

    else if(action == 'played'){

        if(game == 'synonyma')
            return 'played_synonyma';

        else if(game == 'word_quiz')
            return 'played_word_quiz';

        else
            return false;
    }

    else
        return false;
}