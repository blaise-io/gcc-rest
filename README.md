# GccRest
A node.js module that allows you to easily compile Javascript code using Google Closure Compiler's REST API.


## How to Install
`npm install gcc-rest`


## How to use

### Basic example

Compile file1.js and file2.js and write it to compiled.js

    var gcc = require('gcc-rest');
    gcc.addFiles('path/to/file1.js', 'path/to/file2.js');
    gcc.output('/path/to/compiled.js');

If you're into chaining; this does the same:

    require('gcc-rest')
       .addFiles('path/to/file1.js', 'path/to/file2.js')
       .output('/path/to/compiled.js');

Advanced example:

    var gcc = require('gcc-rest');
    
    gcc.params({
        output_info       : ['compiled_code', 'errors', 'warnings', 'statistics'],
        language          : 'ECMASCRIPT5_STRICT',
        compilation_level : 'ADVANCED_OPTIMIZATIONS',
        warning_level     : 'VERBOSE'
    });
    
    gcc.addFiles(
        'source/js/config.js',
        'source/js/utils.js',
        'source/js/main.js'
    );
    
    gcc.replace(/'use strict';/g, '');
    gcc.output('compiled/compiled.js');

*Closing methods that trigger compiling cannot be chained. These methods are `output`, `compile` and `compilePassJson`*

### Adding code that should be compiled

Add a single file:

    gcc.addFile('path/to/file.js');

Add multiple files:

    gcc.addFiles('path/to/file1.js', 'path/to/file2.js', ...);

Manually add a snippet of Javascript:

    gcc.addCode('alert("The crocodile must be green");');

Replace code before compiling:

    gcc.replace(/"console\.log\(.*\);"/g, ''); // Removes all console.log statements

### Compiler settings

 
[Documentation on Google Closure Compiler's request parameters can be found here](https://developers.google.com/closure/compiler/docs/api-ref).
  By default, GccRest does not overwrite the default settings of Google Closure Compiler.

Set a Google Closure COmpiuler request parameter:

    gcc.param('warning_level', 'VERBOSE');

Or set multiple request parameters at once:

    gcc.params({
        output_info      : ['compiled_code', 'errors', 'warnings', 'statistics'],
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        ...
    });

### Handling the compiled output

Output to a file:

    gcc.output('/path/to/compiled.js');

You may also pass the compiled source to a callback function. The compiled source is passed as the first parameter.

Use a callback function by supplying a function reference:

    gcc.compile(console.log);

Or use an anonymous function:

    gcc.compile(function(compiled) {
        require('fs').writeFile('path/to/myfile.js', compiled);
    });

Access the unmodified Json response from Google Closure Compiler:

    gcc.compilePassJson(function(json) {
        // json contains objects like compiledCode, errors, warnings, statistics
        // see output_format > json at https://developers.google.com/closure/compiler/docs/api-ref
    });

Prefix the compiled source with a header that will not be affected by Gooogle Closure Compiler's comment-eater:

    gcc.header('This file was compiled using Google Closure Compiler\n');

## License
GccRest is released under the MIT License.