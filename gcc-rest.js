/*jshint globalstrict:true, node:true, es5:true*/
'use strict';

// Copyright (c) 2012 Blaise Kal
// gcc-rest is released under the MIT License.


var fs = require('fs');
var http = require('http');
var querystring = require('querystring');

/**
 * Wrapper for Google Closure Compiler
 * @url https://github.com/BlaiseKal/GccRest
 * @url https://developers.google.com/closure/compiler/docs/api-ref
 * @constructor
 */
function GccRest() {}

GccRest.prototype = {

    _reqParam: {
        js_code      : '',
        output_info  : ['compiled_code'],
        output_format: 'json'
    },

    _closureEndpoint: {
        hostname: 'closure-compiler.appspot.com',
        path    : '/compile',
        method  : 'POST',
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    },

    _supportedPostParams: [
        'compilation_level', 'debug', 'exclude_default_externs', 'externs_url',
        'formatting', 'js_code', 'js_externs', 'language', 'output_info',
        'use_closure_library', 'use_types_for_optimization', 'warning_level'
    ],

    /**
     * Set a Google Closure Compiler request parameter.
     * @param {string} setting
     * @param {string|Array} value
     * @return {GccRest}
     */
    param: function(setting, value) {
        if (-1 === this._supportedPostParams.indexOf(setting)) {
            console.error('Parameter unsupported, may cause error:', setting);
        }
        this._reqParam[setting] = value;
        return this;
    },

    /**
     * Set multiple Google Closure Compiler request parameters.
     * @param {Object} settings
     * @return {GccRest}
     */
    params: function(settings) {
        for (var k in settings) {
            if (settings.hasOwnProperty(k)) {
                this.param(k, settings[k]);
            }
        }
        return this;
    },

    /**
     * Set a file header that will not be affected or removed by the compiler.
     * @param {string} header
     * @return {GccRest}
     * @url https://developers.google.com/closure/compiler/docs/api-ref
     */
    header: function(header) {
        this._header = header;
        return this;
    },

    /**
     * Add a single file to the list of files to be compiled.
     * @param {string} file
     * @return {GccRest}
     */
    addFile: function(file) {
        var fileBuffer = fs.readFileSync(file);
        this.addCode(fileBuffer);
        return this;
    },

    /**
     * Add multiple files to the list of files to be compiled.
     * @param {...string} varArgs
     * @return {GccRest}
     */
    addFiles: function(varArgs) {
        for (var i = 0, m = arguments.length; i < m; i++) {
            this.addFile(arguments[i]);
        }
        return this;
    },

    /**
     * Add a piece of code manually.
     * @param {string} code
     * @return {GccRest}
     */
    addCode: function(code) {
        this._reqParam.js_code += code;
        return this;
    },

    /**
     * Global replace in all code added so far.
     * Behaves the same as String.replace().
     * @param {string|RegExp} searchValue
     * @param {string} replaceValue
     * @return {GccRest}
     */
    replace: function(searchValue, replaceValue) {
        this._reqParam.js_code = this._reqParam.js_code.replace(searchValue, replaceValue);
        return this;
    },

    /**
     * Compile source and write the output to a file.
     * @param {string} file
     */
    output: function(file) {
        this.file = file;
        this._compileRequest(this._reqParam);
    },

    /**
     * Compile source and pass the output to a callback function.
     * @param {Function} callback
     */
    compile: function(callback) {
        this.callback = callback;
        this._compileRequest(this._reqParam);
    },

    /**
     * Compile source and pass the Json output to a callback function.
     * @param {Function} callback
     */
    compilePassJson: function(callback) {
        this._passJson = true;
        this.compile(callback);
    },

    /**
     * Compile source HTTP request.
     * @param {Object} config
     * @private
     */
    _compileRequest: function(config) {
        var data, request;

        data = querystring.stringify(config);

        request = http.request(this._closureEndpoint, this._handleResponse.bind(this));
        request.on('error', function(e) {
            console.error('Request error', e);
        });
        request.end(data);

        // For ease of use, GccRest exports an instance. Node.js caches exports.
        // We flush the cache here to prevent GccRest from returning a polluted
        // instance, in case GccRest is called multiple times.
        try {
            delete require.cache[__filename];
        } catch(err){}
    },

    /**
     * Handle the response of the compile request.
     * @param {ServerResponse} response
     * @private
     */
    _handleResponse: function(response) {
        response.setEncoding('utf8');
        if (response.statusCode === 200) {
            this._responseSuccess(response);
        } else {
            this._responseFail(response);
        }
    },

    /**
     * Handle a succesful compile request response.
     * @param {ServerResponse} response
     * @private
     */
    _responseSuccess: function(response) {
        var chunks = [];

        response.on('data', function(chunk) {
            chunks.push(chunk);
        });

        response.on('end', function() {
            var json = JSON.parse(chunks.join(''));
            this._showOutputInfo(json);
            this._handleOutput(json);
        }.bind(this));
    },

    /**
     * Handle output JSON object
     * @param {Object} json
     * @private
     */
    _handleOutput: function(json) {
        if (!json.compiledCode) {
            console.error('No compiled code to output!');
        } else {

            if (this.file) {
                this._writeOutputTofile(json.compiledCode);
            }

            if (this.callback) {
                this.callback((this._passJson) ? json : json.compiledCode);
            }

            if (!this.file && !this.callback) {
                console.log('Code:', json.compiledCode);
            }
        }
    },

    /**
     * Handle a failed compile request response.
     * @param {ServerResponse} response
     * @private
     */
    _responseFail: function(response) {
        console.error('Response went wrong!');
        console.error('Status', response.statusCode);
        console.error('Headers', response.headers);
        response.on('data', function(chunk) {
            console.info('Body', chunk);
        });
    },

    /**
     * Show messages from Google Closure Compiler.
     * Messages can be tuned on/off by adjusting the `output_info` setting
     * @param {Object} json
     * @private
     */
    _showOutputInfo: function(json) {
        var stats, shaved, kb;

        if (json.warnings) {
            console.log('Warnings:', json.warnings);
        }

        if (json.errors) {
            console.error('Errors:', json.errors);
        }

        if (json.statistics) {

            stats = json.statistics;
            shaved = (100 - (stats.compressedSize / stats.originalSize * 100)).toPrecision(3);
            kb = function(bytes) {
                return Math.round(bytes / 10.24) / 100 + ' KB';
            };

            console.info();
            console.info('      Original', kb(stats.originalSize));
            console.info('    Compressed', kb(stats.compressedSize));
            console.info('     + GZipped', kb(stats.compressedGzipSize));
            console.info('       Reduced', shaved + '%');
            console.info();
        }
    },

    /**
     * Write compiled code to file.
     * @param {string} code
     * @private
     */
    _writeOutputTofile: function(code) {
        var output = this._header + code;
        fs.writeFile(this.file, output, this._writeFileResult.bind(this));
    },

    /**
     * Report result of writing compiled code to file.
     * @param {string} err
     * @private
     */
    _writeFileResult: function(err) {
        var file = fs.realpathSync(this.file);
        if (!err) {
            console.info('Compiled code saved to', file);
        } else {
            console.info('Saving code failed to', file);
        }
    }

};

module.exports = new GccRest();
