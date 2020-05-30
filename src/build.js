const babelParser = require('@babel/parser');
const babelCore = require ('@babel/core');
const babelTraverse = require ('@babel/traverse').default;

const util = require('./util');
const babel = require('./babel');

function walk(astree, variables) {
    babelTraverse(astree, {
        FunctionDeclaration (path) {
            babel.handleFunctionPath(path, variables);
        },
        FunctionExpression (path) {
            babel.handleFunctionPath(path, variables);
        }
    });
}

function build(code, onFunctionDebugged, options = {strictMode: false}) {
    code = babelCore.transformSync(code, {presets: ["@babel/preset-env"]}).code;
    const variables = {
        onFunctionCalled: util.generateUniqueVarName(code, 'ofc_'),
        onFunctionDebugged: util.generateUniqueVarName(code, 'ofd_'),
        scopeVarName: util.generateUniqueVarName(code, 'svn_')
    };
    
    const astree = babelParser.parse(code);
    walk(astree, variables);
    const res = babelCore.transformFromAstSync (astree, code);
    
    return (`
    const ${variables.onFunctionDebugged} = ` + babel.convertArrowToNormal(onFunctionDebugged) + `; 
    const ${variables.onFunctionCalled} = (` + (function() {
        let callstack = [], callargs = [];
        setTimeout(() => { callstack = [], callargs = []; });
        return (function(name, args = []) {
            const dummyFunc = function () {};
            const firstDebugTime = new Date();
            args = Array.prototype.slice.call(args);
            dummyFunc.toString = function () {
                if (callstack[callstack.length - 1] === name) {
                    let same = true;
                    for (let i = 0; i < args.length; i++) {
                        if (args[i] !== callargs[callargs.length - 1][i]) {
                            same = false;
                            break;
                        }
                    }
                    if (same) return;
                }
                callargs.push(args);
                callstack.push(name);
                __on_function_debugged__temp_name({
                    function_name: name,
                    function_arguments: args,
                    first_timestamp: firstDebugTime,
                    last_timestamp: new Date()
                });
            };
            return dummyFunc;
        });
    }) + `());`).replace('__on_function_debugged__temp_name', variables.onFunctionDebugged) + (!options.strictMode ? util.removeUseStrict(res.code) : res.code);
};

module.exports = build;