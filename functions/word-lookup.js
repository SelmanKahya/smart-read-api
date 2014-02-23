var db = require('../lib/db.js');
var resultModel = require('../lib/models/result.js');

// return word-lookup by id
exports.read = function(req, res){
    var word_lookup_id = req.params.id;
    db.execute('SELECT * FROM word_lookup WHERE word_lookup_id = ? AND word_lookup_is_deleted != 1', [word_lookup_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while getting word lookup data!'));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};

// create an word-lookup
exports.create = function(req, res){

    // object to be created
    var object = {
        word_lookup_word: req.body.word_lookup_word,
        word_lookup_quiz_taken: req.body.word_lookup_quiz_taken || 0,
        word_lookup_quiz_result: req.body.word_lookup_quiz_result || 0,
        word_lookup_created_time: new Date(),
        book_name: req.body.book_name,
        user_id: req.body.user_id
    }

    db.execute('INSERT INTO word_lookup SET ?', object, function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while creating the word lookup!'));

        else{
            object.word_lookup_id = result.insertId;
            res.send(new resultModel.result(true, object));
        }
    });
};

// update word-lookup
exports.update = function(req, res){

    // object to be modified
    var object = {
        word_lookup_id: req.body.word_lookup_id,
        word_lookup_word: req.body.word_lookup_word,
        word_lookup_quiz_taken: req.body.word_lookup_quiz_taken,
        word_lookup_quiz_result	 : req.body.word_lookup_quiz_result,
        book_name	 : req.body.book_name,
        user_id	 : req.body.user_id
    }

    db.execute('UPDATE word_lookup SET word_lookup_word = ?, word_lookup_quiz_taken = ?, word_lookup_quiz_result = ?, ' +
        'book_name = ?, user_id = ? WHERE word_lookup_id = ?',
        [object.word_lookup_word, object.word_lookup_quiz_taken, object.word_lookup_quiz_result, object.book_name, object.user_id, object.word_lookup_id], function(err, result){

            if(err)
                res.send(500, new resultModel.result(false, {}, 'Error while updating the activity!'));

            else
                res.send(new resultModel.result(true, object));

        });
};

// delete word-lookup
exports.delete = function(req, res){

    var word_lookup_id = req.params.id;

    db.execute('SELECT * FROM word_lookup WHERE word_lookup_id = ?', [word_lookup_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while getting word lookup data!'));

        else {

            if(result.length != 1){
                res.send(500, new resultModel.result(false, {}, 'Error while getting word lookup data!'));

            }

            // user can only delete his/her own data
            else if(result[0].user_id != req.user.result.user_id){
                res.send(401, new resultModel.result(false, {}, 'Permission denied!'));

            }

            else {

                var word = {
                    user_id: result[0].user_id,
                    word_lookup_word: result[0].word_lookup_word
                }

                // never delete, just set is_deleted to 1
                db.execute('UPDATE word_lookup SET word_lookup_is_deleted = 1 WHERE user_id = ? AND word_lookup_word = ?', [word.user_id, word.word_lookup_word], function(err, result){

                    if(err)
                        res.send(500, new resultModel.result(false, {}, 'Error while deleting the word-lookup!'));

                    else
                        res.send(new resultModel.result(true, {}));

                });
            }
        }
    });

};