var resultModel = require('../lib/models/result.js');
var wordnik = require('../lib/wordnik.js');

// return word definition
exports.lookup = function(req, res){
    var word = req.params.word;
    var limit = 5; // limit the maximum number of results to return

    wordnik.getDefinition(word, limit, function(result, definition){
        if (result)
            res.json(new resultModel.result(true, definition));

        else
            res.json(500, new resultModel.result(false, {}, 'Error while getting word definition!'));
    })
}
