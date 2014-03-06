# gcc-rest [![Build Status](https://travis-ci.org/blaise-io/gcc-rest.png?branch=master)](https://travis-ci.org/blaise-io/gcc-rest)
A node.js module for compiling JavaScript code using Google Closure Compiler's REST API.

[This library is also available as a Grunt plugin](https://github.com/blaise-io/grunt-gcc-rest).

## How to install
```shell
npm install gcc-rest
```

## How to use

### Basic example

Compile file1.js and file2.js and write it to compiled.js

```js
var gcc = require('gcc-rest');
gcc.addFiles('/path/to/file1.js', '/path/to/file2.js');
gcc.output('/path/to/compiled.js');
```

If you're into chaining; this does the same:

```js
require('gcc-rest')
   .addFiles('/path/to/file1.js', '/path/to/file2.js')
   .output('/path/to/compiled.js');
```

*Note:* Closing methods that perform compiling (`output`, `compile` and `compilePassJson`) cannot be chained.

An advanced example:

```js
// Load gcc-rest module
var gcc = require('gcc-rest');

// Set Closure Compiler parameters
gcc.params({
    output_info      : ['compiled_code', 'errors', 'warnings', 'statistics'],
    language         : 'ECMASCRIPT5_STRICT',
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    warning_level    : 'VERBOSE'
});

// Add files that should be compiled
gcc.addFiles(
    'js/config.js',
    'js/utils.js',
    'js/main.js'
);

// Replace code before compiling
gcc.replace(/'use strict';/g, '');

// Compile and write output to compiled.js,
// Handle errors when something goes wrong.
gcc.output('compiled/compiled.js', function(errorType, errorDetails) {
    console.error('Something went wrong:', errorType, errorDetails);
});
```

### Adding code that should be compiled

Add a single file:

```js
gcc.addFile('/path/to/file.js');
```

Add multiple files:

```js
gcc.addFiles('/path/to/file1.js', '/path/to/file2.js', ...);
```

Add a directory of Javascript files:

```js
// Use the optional second argument to pass an array of files
// that should be excluded when scanning the dir.
gcc.addDir('/path/to/dir', ['exclude1.js', 'exclude2.js']);
```

Manually add a snippet of Javascript:

```js
gcc.addCode('alert("The crocodile must be green");');
```

Replace code before compiling:

```js
gcc.replace(/"console\.log\(.*\);"/g, ''); // Removes all console.log statements
```

### Compiler request parameters

[Documentation on Google Closure Compiler's request parameters can be found here](https://developers.google.com/closure/compiler/docs/api-ref).
The [additional web service options](http://code.google.com/p/closure-compiler/wiki/AdditionalWebserviceOptions) are also supported.
Unsupported parameters will print a warning. gcc-rest does not overwrite Google Closure Compiler's default settings.

Set a Google Closure Compiler request parameter:

```js
gcc.param('warning_level', 'VERBOSE');
```

Or set multiple request parameters at once:

```js
gcc.params({
    language                  : 'ECMASCRIPT5_STRICT',
    warning_level             : 'VERBOSE',
    use_types_for_optimization: 'true'
});
```

### Handling the compiled output

Output to a file:

```js
gcc.output('/path/to/compiled.js');
```

You may also pass the compiled source to a callback function. The compiled source is passed as the first parameter.

Use a callback function by supplying a function reference:

```js
gcc.compile(console.log);
```

Or an anonymous function:

```js
gcc.compile(function(compiledStr) {
    require('fs').writeFile('path/to/myfile.js', compiledStr);
});
```

Access the unmodified Json response from Google Closure Compiler by calling `compilePassJson()`:

```js
gcc.compilePassJson(function(json) {
    console.log(json);
    // json contains objects like compiledCode, errors, warnings, statistics
    // see output_format > json at https://developers.google.com/closure/compiler/docs/api-ref
});
```

Prepend the compiled source with a header:

```js
gcc.header('// This file was compiled using Google Closure Compiler\n');
```

### Handling errors

Handle errors by supplying an error handling function to the second argument of `output`, `compile` or `compilePassJson`.
This function will be called when something goes wrong.
The error handling function accepts two parameters, `errorType` and `errorDetails`.

`errorType` provides on of these error types:

 - `service_error`: The Google Closure Compiler REST API could not process the request.
   [Check the compiler docs for details.](https://developers.google.com/closure/compiler/docs/api-ref#errors).
 - `request_error`: The HTTP request could not be sent to the API.
 - `server_error`: The HTTP response did not return a `200: Success` status.
    Please note that the API will return a `200: Success` when a `service_error` occurs.

`errorDetails` provides (unstructured) detailed information.

Example:

```js
gcc.output('/path/to/compiled.js', function(errorType, errorDetails) {
    // Error handling code
});

gcc.compile(function(compiledStr) {
    // Compiled string handling code
}, function(errorType, errorDetails) {
    // Error handling code
});

gcc.compilePassJson(function(json) {
    // Json handling code
}, function(errorType, errorDetails) {
    // Error handling code
};
```

## Custom logging

By default, gcc-rest uses the `console` object for logging. If you want, you can
overwrite `gcc.console.info`, `gcc.console.warn` and `gcc.console.error` with
your own functions. Example:

```js
gcc.console.error = function() {
    fs.appendFile('error.log', arguments.join(', '));
}
```

## Unit testing

1. Clone from GitHub
1. Run `npm install` to install the Mocha test framework
1. Run `npm test`

## Update history

 * 2014-03-06: v0.2.5 Provider better error handling functionality documentation
 * 2014-03-06: v0.2.4 Provider better error handling functionality
 * 2013-12-01: v0.2.3 Consistency in error/warning logging
 * 2013-08-08: v0.2.0 Add tests, travis, allow overwriting console
 * 2013-04-07: v0.1.6 Allow chaining after the `addDir` method
 * 2013-02-02: v0.1.5 Add `addDir` method
 * 2013-01-12: v0.1.4 Fix issue where no header prepends "undefined" to output
 * 2013-01-05: v0.1.3 Add support for debug parameter
 * 2012-12-30: v0.1.2 Add support for use_types_for_optimization parameter
 * 2012-10-02: v0.0.3 Prevent module cache
 * 2012-10-02: v0.0.1 Initial release

## License
gcc-rest is released under the MIT License.
