'use strict';

var assert = require('assert');
var fs = require('fs');

describe('gcc-rest', function() {
    var gcc, param;

    describe('Input', function() {

        beforeEach(function() {
            gcc = require('../gcc-rest.js');
            param = gcc._reqParam;
            param.js_code = '';
        });

        describe('gcc.addFile', function() {
            it('Add a single file', function() {
                gcc.addFile(__dirname + '/source/foo.js');
                assert(param.js_code.match('foo'));
            });
            it('Add another single file', function() {
                gcc.addFile(__dirname + '/source/foo.js');
                gcc.addFile(__dirname + '/source/bar.js');
                assert(param.js_code.match('foo'));
                assert(param.js_code.match('bar'));
            });
            it('Chains', function() {
                param.js_code = ''; // Reset
                gcc.addFile(__dirname + '/source/foo.js')
                   .addFile(__dirname + '/source/bar.js');
                assert(param.js_code.match('foo'));
                assert(param.js_code.match('bar'));
            });
        });

        describe('gcc.addFiles', function() {
            it('Add multiple files', function() {
                gcc.addFiles(__dirname + '/source/foo.js', __dirname + '/source/bar.js');
                assert(param.js_code.match('foo'));
                assert(param.js_code.match('bar'));
            });
            it('Chains', function() {
                param.js_code = ''; // Reset
                gcc.addFiles(__dirname + '/source/foo.js', __dirname + '/source/bar.js')
                   .addFiles(__dirname + '/source/baz.js');
                assert(param.js_code.match('foo'));
                assert(param.js_code.match('bar'));
                assert(param.js_code.match('baz'));
            });
        });

        describe('gcc.addDir', function() {
            it('Add directory of files', function() {
                gcc.addDir(__dirname + '/source/');
                assert(param.js_code.match('foo'));
                assert(param.js_code.match('bar'));
                assert(param.js_code.match('baz'));
            });
            it('Exclude files', function() {
                gcc.addDir(__dirname + '/source/', ['baz.js']);
                assert(param.js_code.match('foo'));
                assert(param.js_code.match('bar'));
                assert(!param.js_code.match('baz'));
            });
            it('Chains', function() {
                gcc.addDir(__dirname + '/source/')
                   .addDir(__dirname + '/source2/');
                assert(param.js_code.match('foo'));
                assert(param.js_code.match('bar'));
                assert(param.js_code.match('baz'));
                assert(param.js_code.match('qux'));
            });
        });

        describe('gcc.addCode', function() {
            it('Add code', function() {
                gcc.addCode('foo');
                assert(param.js_code === 'foo');
            });
            it('Add more code', function() {
                gcc.addCode('foo');
                gcc.addCode('bar');
                assert(param.js_code === 'foobar');
            });
            it('Chains', function() {
                gcc.addCode('foo')
                   .addCode('bar');
                assert(param.js_code === 'foobar');
            });
        });

        describe('gcc.replace', function() {
            it('Replace code', function() {
                gcc.addCode('foofoo');
                gcc.replace(/foo/g, 'bar');
                assert(param.js_code == 'barbar');
            });
            it('Chains', function() {
                gcc.addCode('foofoo');
                gcc.replace(/foo/, 'bar')
                   .replace(/foo/, 'baz');
                assert(param.js_code == 'barbaz');
            });
        });

        describe('gcc.param', function() {
            it('Set GCC parameter', function() {
                gcc.param('warning_level', 'VERBOSE');
                assert(param.warning_level === 'VERBOSE');
            });
            it('Chains', function() {
                gcc.param('warning_level', 'VERBOSE')
                   .param('compilation_level', 'WHITESPACE_ONLY');
                assert(param.warning_level === 'VERBOSE');
                assert(param.compilation_level === 'WHITESPACE_ONLY');
            });
        });

        describe('gcc.params', function() {
            it('Set GCC parameters', function() {
                gcc.params({
                    warning_level: 'VERBOSE',
                    language: 'ECMASCRIPT5_STRICT'
                });
                assert(param.warning_level === 'VERBOSE');
                assert(param.language === 'ECMASCRIPT5_STRICT');
            });
            it('Chains', function() {
                gcc.params({warning_level: 'DEFAULT'})
                   .params({language: 'ECMASCRIPT5'});
                assert(param.warning_level === 'DEFAULT');
                assert(param.language === 'ECMASCRIPT5');
            });
        });
    });

    describe('Compilation', function() {
        var output = '';
        var header = '/*HEADER*/';

        before(function(done) {
            this.timeout(10 * 1000); // rest service may respond slowly
            gcc = require('../gcc-rest.js');
            gcc._reqParam.js_code = '';
            gcc.addFile(__dirname + '/source/foo.js');
            gcc.header(header);
            gcc.compile(function(compiled) {
                output = compiled;
                done();
            });
        });

        describe('gcc.header', function() {
            it('Starts with header', function() {
                assert(output.indexOf(header) === 0);
            });
        });

        describe('gcc.compile', function() {
            it('Compiles', function() {
                assert(output.match('foo'));
            });
        });

        describe('gcc.output', function() {
            it('Writes output to file', function(done) {
                this.timeout(10 * 1000); // REST service may respond slowly
                var file = __dirname + '/output.js';
                gcc = require('../gcc-rest.js');
                gcc.console.info = function(){};
                gcc.addFile(__dirname + '/source/bar.js');
                gcc.header(header);
                gcc.callback = function() {
                    fs.readFile(file, 'utf8', function(err, content) {
                        fs.unlink(file);
                        assert(content.match('bar'));
                        done();
                    });
                };
                gcc.output(file);
            });
        });

    });

});
