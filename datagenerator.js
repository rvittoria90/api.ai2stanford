'use strict'


/*
	#hash - Optional
	!hash - Required
	$word - Optional
	%word - Required
*/

function generate(tokens,hash){
	var arr = []

	var keys = Object.keys(hash)
	for( var i = 0 ; i < keys.length ; i++ ){
		var key = keys[i]
		if( !(hash[key] instanceof Array) ){
			var t = hash[key].tokens;
			hash[key] = []
			hash[key] = generate(t,hash)
		}
	}

	tokens.forEach(function(token){
		var toAdd = []

		switch(token.charAt(0)){
			case '!': 
				toAdd = (hash[token.substr(1)].slice())
				break
			case '#':
				toAdd = (hash[token.substr(1)].slice())
				toAdd.push('')
				break
			case '$': 
				toAdd = [token.substr(1),'']
				break
			case '%': 
				toAdd = [token.substr(1)]
				break
		}

		var rebuilt = []

		if(arr.length === 0){

			toAdd.forEach(function(item){
				if( typeof item === 'string' ){
					rebuilt.push({
						output: (item).trim(),
						label: (item ? token : '').trim()
					})
				}
				else{
					rebuilt.push({
						output: (item.output).trim(),
						label: (item.output ? item.label : '').trim()
					})
				}
			})
		
		}
		else{

			for( var i = 0 ; i < arr.length ; i++ ){
				toAdd.forEach(function(item){
					if( typeof item === 'string' ){
						rebuilt.push({
							output: (arr[i].output + ' ' + item).trim(),
							label: (item ? (arr[i].label + ' ' + token) : arr[i].label).trim()
						})
					}
					else{
						rebuilt.push({
							output: (arr[i].output + ' ' + item.output).trim(),
							label: (item.output ? (arr[i].label + ' ' + item.label) : arr[i].label).trim()
						})
					}
					
				})
			}
		}

		arr = rebuilt
	})
	return arr
}

var hash = {
	departurearrival : [ 'departs','arrives' ],
	beforeafter : [ 'before','after' ],
	item3 : [ '4','5','6' ],
	item4 : [ 'x','y','z' ],
	comp1 : {
		tokens: [ '!departurearrival','!beforeafter' ]
	}
}
// ,'!item3','#item4','%and', '#comp1'
//  # is optional
// ! is placed there 
// comp take composite entities and uses the same logic ! or #

var tokens = ['#departurearrival','!beforeafter', '%5pm']

var result = generate(tokens,hash)

require('fs').writeFile('perm.output.json',JSON.stringify(result,null,2))

