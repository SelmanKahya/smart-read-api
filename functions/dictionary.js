var request = require('request');
var resultModel = require('../lib/models/result.js');

// return word defitinion
exports.lookup = function(req, res){
    var word = req.params.word;
    var limit = 5; // limit the maximum number of results to return

    // Making calls to wordnik dictionary api
    // See Wordnik API for more information:
    // http://developer.wordnik.com/
    var url = 'http://api.wordnik.com:80/v4/word.json/' + word + '/definitions?limit=' + limit + '&includeRelated=false&sourceDictionaries=all&useCanonical=true&includeTags=false&api_key=ef0b53ce4323052b4a0080d4d6d04f8de987b039242b741f8'

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(new resultModel.result(true, body));
        }

        else
            res.json(500, new resultModel.result(false, {}, 'Error while getting word definition!'));
    })
}