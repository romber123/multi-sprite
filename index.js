var spritesmith = require('spritesmith'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    async = require('async')

var getConfig = require('./lib/getConfig'),
    updateCss = require('./lib/updateCss');

module.exports = function (options) {
    "use strict";

    var imageReplaces = {rootFontSize: options.rootFontSize||750/16}
    function _spriteSmithWrapper(config, callback) {
        var sprite = config.dest;
        delete config.sprite;
        spritesmith(config, function (err, result) {
            if (err) { console.error(err); process.abort(); return callback(err); }
            fs.writeFile(sprite, result.image, { encoding: 'binary' })
            console.log('[Created] -->'+sprite)

            var tmpResult = result.coordinates
            for (var key in result.coordinates) {
                var newKey = path.relative(options.srcCss, key).replace(/\\/g, '/')
                imageReplaces[ newKey ] = tmpResult[ key ]
                imageReplaces[ newKey ].sprite = path.relative(path.join(process.cwd(), options.destCss), sprite).replace(/\\/g, '/')
                imageReplaces[ newKey ].spriteWidth = result.properties.width
            }
            callback(false)

        });

    }

    // main
    var successCB = options.successCB || function(){}
    var configs = getConfig(options)
    async.eachSeries(configs, _spriteSmithWrapper, function(err){
        for (var j = 0; j < csslist.length; j++) {
            updateCss(csslist[j], imageReplaces);
        }
        successCB();
    })

}