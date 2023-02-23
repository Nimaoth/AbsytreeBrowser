console.log("scripting_runtime.js")

var lambdaActions = {}

function addCommand(context, keys, action, ...args) {
    let argsString = args.map(a => JSON.stringify(a)).join(" ")
    // console.log("addCommand", context, "    ", keys, "    ", action)
    gEditor.addCommandScript(context, keys, action, argsString)
}

function addCommandLambda(context, keys, lambda) {
    let key = context + keys
    lambdaActions[key] = lambda
    gEditor.addCommandScript(context, keys, "lambda-action", key)
}

function addTextCommand(mode, keys, action, ...args) {
    let context = "editor.text" + (mode.length == 0 ? "" : "." + mode)
    if (typeof(action) == "function") {
        addCommandLambda(context, keys, action)
    } else {
        addCommand(context, keys, action, ...args)
    }
}