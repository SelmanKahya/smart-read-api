// Making calls to wordnik dictionary api
// See Wordnik API for more information:
// http://developer.wordnik.com/

var wordnik_api_key = require('../config/auth_credentials.js').credentials.wordnik_api_key;

var request = require('request');

exports.getDefinition = function(word, limit, callback){

    var url = 'http://api.wordnik.com:80/v4/word.json/' + word + '/definitions?limit=' + limit + '&includeRelated=false&sourceDictionaries=all&useCanonical=true&includeTags=false&api_key=' + wordnik_api_key

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200)
            callback(true, body);

        else
            callback(false);
    })
}

exports.getSynonym = function(word, limit, callback){

    var url = 'http://api.wordnik.com:80/v4/word.json/' + word + '/relatedWords?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=' + limit + '&api_key=' + wordnik_api_key;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200){

            var res = JSON.parse(body);

            if(res && res[0] && res[0].words)
                callback(true, res[0].words);
            else
                callback(false);
        }

        else
            callback(false);
    })
}


exports.getRandomWords = function(limit, callback){

    var url = 'http://api.wordnik.com:80/v4/words.json/randomWords?hasDictionaryDef=true&excludePartOfSpeech=proper-noun&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=10&maxDictionaryCount=-1&minLength=4&maxLength=-1&limit=' + limit + '&api_key=' + wordnik_api_key;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200)
            callback(true, JSON.parse(body));

        else
            callback(false);
    })
}

