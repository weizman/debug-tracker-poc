# debug-tracker-poc

### this package is a POC demonstrating the ability described in this [blog post](https://weizman.github.io/?javascript-anti-debugging-some-next-level-shit-part-2)

## install

`npm install debug-tracker-poc`/`yarn add debug-tracker-poc`

## usage

```javascript
const track = require('debug-tracker-poc');
const code = track(js, cb);
```

## example

```javascript
const track = require('debug-tracker-poc');

const js = `
function y(b) {
    return b + 5;
}

var x = (a) => {
    return y(a + 1);
};

x(3);
`;

const cb = function (info) {
    alert(`
            Function ${info.function_name} is being debugged!
            It was called with the following arguments: ${JSON.stringify(info.function_arguments)}
            First time it happened: ${info.first_timestamp}
            Last time it happened: ${info.last_timestamp}
    `);
}

const code = track(js, cb);
```

## result

```javascript
    // callback to be called when function is debugged
    const onFunctionDebugged = (function (info) {
        alert(`
                Function ${info.function_name} is being debugged!
                It was called with the following arguments: ${JSON.stringify(info.function_arguments)}
                First time it happened: ${info.first_timestamp}
                Last time it happened: ${info.last_timestamp}
        `);
    }); 
    const initTracker = (function() {
        let callstack = [], callargs = [];
        setTimeout(() => { 
            // reset callstack when synchronized debugging is over
            callstack = []; 
            callargs = []; 
            });
        return (function(name, args = []) {
            const dummy = /./;
            const firstDebugTime = new Date();
            args = Array.prototype.slice.call(args);
            // register the callback to be called when the function is being debugged 
            dummy.toString = function () {
                // avoid being double called for the same debugged function
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
                // fire "function is being debugged" event
                callargs.push(args);
                callstack.push(name);
                onFunctionDebugged({
                    function_name: name,
                    function_arguments: args,
                    first_timestamp: firstDebugTime,
                    last_timestamp: new Date()
                });
            };
            return dummy;
        });
    }());
```

## in order to truly understand this package's purpose and the concept of this POC, please read the related [blog post](https://weizman.github.io/?javascript-anti-debugging-some-next-level-shit-part-2)
