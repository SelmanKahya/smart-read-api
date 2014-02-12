var request = require('request');
var resultModel = require('../lib/models/result.js');

// return word defitinion
exports.lookup = function(req, res){
    var word = req.params.word;
    var url = 'http://www.google.com/dictionary/json?callback=process&sl=en&tl=en&restrict=pr,de&client=te&q=' + word;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            handleResponse(body, function(definition){
                res.json(new resultModel.result(true, definition));
            })
        }

        else
            res.json(500, new resultModel.result(false, {}, 'Error while getting word definition!'));
    })
}

// Handles AJAX response (google dictionary API request)
var handleResponse = function(response, callback){
    var massaged = response.replace(/^[^(]+\(|[^}]+$/g, ''), res;
    try {
        res = JSON.parse( massaged );
    } catch( e ) {
        res = new Function( 'return ' + massaged )();
    }

    var result = process(res);
    callback(result);
}

// process the json response, creates result object
var process = function(json_obj){

    // this is the word that user has just double clicked
    // we are not using it, since the actual word might be different
    // for example: after double clicking on "reached", dictionary will
    // show the meaning of "reach", and
    // "reach" is the thing that we care about here
    var double_clicked_word = json_obj.query;

    var result = {
        word : null,
        type : null,
        sound : null,
        pronunciation : null,
        primary_means : null
    };

    for (var prop in json_obj){
        if(prop=="primaries"){
            var stuff = json_obj["primaries"][0];

            // get pronunciation and sound
            var isa = "";
            var sound = '';
            var wordType = '';
            var pro = stuff["terms"];
            for(var i=0;i<pro.length;i++){
                if(pro[i]["type"]=="phonetic"){
                    isa+=pro[i]["text"];
                    isa+=" ";
                }
                else if(pro[i]["type"]=="sound"){
                    sound = pro[i]["text"];
                }
                else if(pro[i]["type"]=="text"){
                    var actual_word = pro[i]["text"];

                    // here we have to remove all the · symbols in the word
                    // by default, google dictionary api separates syllables in the word with "·" character
                    actual_word = actual_word.replace(/·/g,'');
                    result.word = actual_word;

                    if(pro[i]["labels"]){
                        wordType += pro[i]["labels"][0]['text'];
                        wordType += " ";
                    }
                }
            }

            result.sound = sound;
            result.type = wordType;
            result.pronunciation = isa;

            // get meaning array
            var primary_mean = stuff["entries"];
            var primary_mean_list = [];
            var k=0;
            for(var i=0;i<primary_mean.length;i++){
                if(primary_mean[i]["type"]=="meaning"){
                    primary_mean_list[k]=primary_mean[i]["terms"][0]["text"];
                    k++;
                }
            }
            result.primary_means = primary_mean_list;
        }
    }

    return result;
}
