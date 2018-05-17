'use strict';

const request = require( 'request' );
const cheerio = require( 'cheerio' );
const URL = require( 'url' );

const base = 'https://en.wikipedia.org/';
const start = 'https://en.wikipedia.org/wiki/Special:Random';
const end = 'https://en.wikipedia.org/wiki/Philosophy';

const test1 = 'https://en.wikipedia.org/wiki/Lemur';
const test2 = 'https://en.wikipedia.org/wiki/United_States';
const test3 = 'https://en.wikipedia.org/wiki/Russian_language';
const test4 = 'https://en.wikipedia.org/wiki/Philosophy';

let steps = 0;
const maxSteps = 30;
let article = [];

function fire( url ){
    setTimeout( function() {
        request( url, function ( err, res, html ) {
            if( err ) {
                console.log( err );
            }
            else if( res.statusCode === 200 ){
                steps++;
                console.log( url );
                if( run( url ) ) {
                    article.push( url );
                    var $ = cheerio.load( html );
                    var link = getLink( $ );
                    link = URL.resolve( base, link);
                    try {
                        fire( link );
                    } catch( e ){
                        console.log( `Link Error for ${ link }:\n`, e );
                    }    
                }    
            }
        });
    }, 500 )   
}

function getLink( $ ){
    var flag = false;
    var link = $( '.mw-parser-output p' )
                    .children( 'a' )
                    .filter( function() {
                        var hasHref = $( this ).attr( 'href' );
                        var hasNoChildren = $( this ).children().length ?
                            false : true;
                        if( !flag && hasHref && hasNoChildren ){
                            flag = true;
                            return this;
                        }
                    })
                    .attr( 'href' );

    return link;
}

function run( url ){

    if( url === end ){
        console.log( 'Found Philosophy!' );
        return false;
    }

    if( steps > maxSteps ){
        console.log( 'Too much crawling!' );
        return false;
    }

    if( article.includes( url ) ){
        console.log( 'Stuck in a loop, exiting...' );
        return false;
    }

    return true;
}

fire( start )
