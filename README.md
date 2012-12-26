# gcc-rest
A node.js module that allows you to easily compile Javascript code using Google Closure Compiler's REST API.

## How to Install
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

*Closing methods that trigger compiling cannot be chained. These methods are `output`, `compile` and `compilePassJson`*

An advanced example:

```js
// Load GccRest module
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

// Compile and write output to compiled.js
gcc.output('compiled/compiled.js');
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
Unsupported parameters will print a warning. 
By default, GccRest uses Google Closure Compiler's default settings.

Set a Google Closure Compiler request parameter:

```js
gcc.param('warning_level', 'VERBOSE');
```

Or set multiple request parameters at once:

```js
gcc.params({
    language     : 'ECMASCRIPT5_STRICT',
    warning_level: 'VERBOSE'
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
gcc.compile(function(compiled) {
    require('fs').writeFile('path/to/myfile.js', compiled);
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

Prefix the compiled source with a header that will not be affected by Gooogle Closure Compiler's comment-eater:

```js
gcc.header('This file was compiled using Google Closure Compiler\n');
```

## License
gcc-rest is released under the MIT License.
