function removeUseStrict(js = '') {
    return js.replace('"use strict";\n\n', '').replace('"use strict";\n', '');
}

function generateUniqueVarName(code = '', prefix = '_', suffix = '') {
    let variable;
    while (code.includes((variable = prefix + Math.random().toString(36).substring(7) + suffix))) {}
    return variable;
}

module.exports = {
    removeUseStrict,
    generateUniqueVarName
};