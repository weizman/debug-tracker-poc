const babelParser = require('@babel/parser');
const babelCore = require ('@babel/core');

const util = require('./util');

function getFunctionName(path) {
    try {
        return path.node.id.name;
    } catch (err) {

    }

    try {
        return path.container.id.name;
    } catch (err) {
        
    }

    try {
        return `${path.parentPath.node.left.object.name}[${path.parentPath.node.left.property.value}]`;
    } catch (err) {
        
    }

    return 'anonymous';
}

function handleFunctionPath(path, variables) {
    path.node.body.body.unshift(babelParser.parse(`const ${variables.scopeVarName} = ${variables.onFunctionCalled}('${getFunctionName(path)}', arguments);`));
}

function convertArrowToNormal(func) {
    funcStr = '(' + func.toString() + ')';
    funcStr = babelCore.transformSync(funcStr, {presets: ["@babel/preset-env"]}).code;
    const astree = babelParser.parse(funcStr);
    const res = util.removeUseStrict(babelCore.transformFromAstSync (astree, funcStr).code);
    return res.substr(0, res.length - 1);
}

module.exports = {
    getFunctionName,
    handleFunctionPath,
    convertArrowToNormal
};