// This script is intended to convert an agent from api.ai into a trainable dataset for the stanford core NLP

// input: intents in json (ie. your dataset)
// input: entities in json (to convert into gazettes, i.e. your vocabulary)
// output: traindataset in tsv
// output: gazzettes in .gaz

// an "annotation" of your corpus is equal to an "alias" in api.ai
// with the array "ignorefeatures" you can ignore an annotation from api.ai corpus
// with substitude and substitudewith you can replace the name of one annotation with another name
// Number of Feature (Entities) that the CRF will have eto recognize  = number of entites in api.ai dataset - number of ignored entites - number of entites converted into the same alias

// output: gazzettes (the .gaz.txt files inside the gazzettes folder)
// output: dataset (the .tsv file)

'use strict'
let fs = require('fs'),
    path = require('path')



var log_string = ''
var intentsdir = 'Agent/intents'
var entitesdir = 'Agent/entities'
var missingentitesdir = 'Agent/missingentities'
var logsfolders = getDirectories(intentsdir)
// console.log(logsfolders)

// 1) CREATING A TRAIN DATASET
// merging all intents files in one array
var sentencedataset = []
logsfolders.forEach(function(filename){
    // console.log(filename)
    var jsonFile = require('./' + intentsdir + '/' + filename)
    sentencedataset=sentencedataset.concat(jsonFile['userSays'])
})
let ignoresubstituion = require('./ignoresubstituion.json')
let tsvdataset=apiai2tsv(sentencedataset,ignoresubstituion.ignorefeatures,ignoresubstituion.substitude,ignoresubstituion.substitudewith)
fs.writeFileSync('trainingset' + '/flightsTrain.tsv', tsvdataset)


// 2) CREATING GAZZETTES
let Entity2Alias = require('./Entity2Alias.json') // getting the arrays: [gazzettename, entityname] number of gazzettes > number of entities (e.g. city becomes "fromcity" and "tocity")
Entity2Alias.usedEntAlias.forEach(function(entry,index){
    // console.log(entry[0])
    entity2gaz(entry[1],entry[0],entitesdir)
})
var MissingEntitiesDir=''
MissingEntitiesDir=getDirectories(missingentitesdir)
MissingEntitiesDir.forEach(function(filename){
    entity2gaz(filename.split('.')[0],filename.split('.')[0],entitesdir)
})



function apiai2tsv(sentencedataset,ignorefeatures,substitude,substitudewith) {
// creates stanford core NLP compliant dataset
    var output = ""
    var sentencecount = 0
    sentencedataset.forEach(function(dataElement, index){
            sentencecount=sentencecount+1
        dataElement['data'].forEach(function(object, index) {
            if (object.text === ' ' ){
            }
            else {
                // there is no annotation
                if (object.alias === undefined || ignorefeatures.indexOf(object.alias) > -1) {

                    var words=object.text.split(/\s+/)
                    // console.log(words)
                    words.forEach(function(word){
                        if (word != ''){
                            // console.log(word)
                            var messageRow = word.toLowerCase() + " " + "O" + " " + sentencecount + "\n"
                            output = output + messageRow
                        }

                    })

                }
                // the word is annotated
                else {
                    var words=object.text.split(/\s+/)
                    words.forEach(function(word){
                        if (substitude.indexOf(object.alias)>-1){object.alias=substitudewith[substitude.indexOf(object.alias)]}
                        if (word != ''){
                            var messageRow = word.toLowerCase() + " " + object.alias + "    " + sentencecount + "\n"
                            output = output + messageRow
                        }
                    })
                }


            }


        })
            var messageRow = '.' + "    " + 'O' + " " + sentencecount + "\n"
            output = output + messageRow

    })
    return output
}


function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file))
  })
}


function entity2gaz(entityname,alias,entitesdir) {
    var entity = require('./' + entitesdir + '/' + entityname + '.json')
    var gazette = ''
    // entity.name='tocity'
    entity.entries.forEach(function(entry){
        entry.synonyms.forEach(function(synonym){
            gazette = gazette +  alias + ' ' +synonym.replace(/"/g,'').trim().toLowerCase() + "\n"
        })
    })

    fs.writeFileSync('trainingset/gazettes/' + alias + '.gaz.txt', gazette);
}

