var db = require('../db.js');
var async = require('async');
var wordnik = require('../wordnik.js');

// the limit to decide whether to use user's existing word-lookup data to generate words
// if there is not so many look-ups, than consider using other users' look-up data
var WORD_LIMIT = 10;

// how many choices for each question
var CHOICE_COUNT = 4;

// generates word for the game based on user's word lookup data
exports.generate = function(user, level, count, words, callback){

    // if it is greater than the limit, than use word lookup
    // data to generate questions
    if(words.length > WORD_LIMIT){

        createPoolWithWordLookup(words, function(result, pool){

            if(!result)
                callback(false);

            generateQuestionsFromPool(pool, level, count, function(result, questions){

                if(result)
                    callback(true, questions);

                else
                    callback(false);

            })
        })
    }

    // otherwise, use other peoples word look-ups
    else {
        createPoolWithoutWordLookup(function(result, pool){

            if(!result)
                callback(false);

            generateQuestionsFromPool(pool, level, count, function(result, questions){

                if(result)
                    callback(true, questions);

                else
                    callback(false);

            })
        })
    }
}

// pull other users lookup data
var createPoolWithoutWordLookup = function(callback){

    var pool = [];

    db.execute('SELECT word_lookup_word FROM word_lookup WHERE word_lookup_is_deleted != 1 ORDER BY RAND() LIMIT 0 , 75', function(err, result){

        if(err)
            callback(false);

        else {

            // add user's word look-ups to the pool
            // pull word_lookup_word field from each object into array
            for(var i = 0; i < result.length; i++){
                pool.push(result[i].word_lookup_word);
            }

        }

        callback(true, pool);
    });
}

// generates word pool using word lookup data
var createPoolWithWordLookup = function(user_lookups, callback){
    var pool = [];

    // add user's word look-ups to the pool
    // pull word_lookup_word field from each object into array
    for(var i = 0; i < user_lookups.length; i++){
        pool.push(user_lookups[i].word_lookup_word);
    }

    // add synonyms of word look-ups to the pool - that will
    // help to focus more on user's word look-ups by asking
    // related words
    findSynonyms(user_lookups, function(result, synonyms){
        if(result)
            pool = pool.concat(synonyms);

        callback(true, pool.shuffle());
    });
}

// finds synonym for each word in array
var findSynonyms = function(words, callback){

    var i = 0;

    var synonyms = [];

    async.whilst(

        function () { return i < words.length; },

        function (callback) {

            var word = words[i];

            wordnik.getSynonym(word.word_lookup_word, 1, function(result, synonym){

                if(synonym && synonym.length == 1){
                    synonyms.push(synonym[0]);
                }

                callback();

            });

            i++;
        },

        function (err) {

            if(err)
                callback(false);
            else
                callback(true, synonyms);
        }
    );
}

var generateQuestionsFromPool = function(pool, level, count, callback){

    // remove duplicate words from the array
    pool = pool.removeDuplicates();

    // first generate some random words
    // those will be added into the question choices as the correct answer
    // (purpose is finding the irrelevant word)
    wordnik.getRandomWords(200, function(result, randomWords){

        if(!result) {
            callback(false);
            return;
        }

        randomWords = randomWords.shuffle();

        var nextRandom = 0;

        var questions = [];

        var i = 0;

        async.whilst(

            function () { return questions.length < count; },

            function (callback) {

                var word = pool[i];

                if(word == null){
                    word = randomWords[nextRandom++].word;

                    // make sure that random word isn't already in the array
                    while(pool.indexOf(word) > -1)
                        word = randomWords[nextRandom++].word;

                }

                wordnik.getSynonym(word, CHOICE_COUNT-1, function(result, synonym){

                    if(synonym && synonym.length == CHOICE_COUNT-1){

                        var randomWord = randomWords[nextRandom++].word;

                        var question = {
                            word: word,
                            answer: randomWord,
                            choices: synonym.concat([randomWord]).shuffle()
                        }

                        questions.push(question);
                    }

                    callback();

                });

                i++;
            },

            function (err) {

                console.log("Left random words: " + (randomWords.length - nextRandom) + "/" + randomWords.length)

                if(err)
                    callback(false);
                else
                    callback(true, questions);

            }
        );
    });
}
