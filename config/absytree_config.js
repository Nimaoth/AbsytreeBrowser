console.log("Loading absytree_config.js")

// Open a git hub repository workspace
// This allows you to browse the files in this repository at the specified branch or commit (read only)
// You can set the GithubAccessToken in local storage to a github token (bearer format), this will then be used
// to authenticate any requests to the github api.
gEditor.openGithubWorkspace("Nimaoth", "Absytree", "main")

// Open a absytree server workspace.
// absytree_server.js must be running there, and it will serve the files in the directory it's running in (read-write access)
// gEditor.openAbsytreeServerWorkspace("http://localhost:3000")

window.handleGlobalAction = (action, args) => {
    // console.log("js: handleGlobalAction ", action, args)
    if (handleLambdaAction(action, args))
        return true

    switch (action) {
    case "escape":
        gEditor.getActiveEditor2().clearSelections()
        return true
    case "command-line":
        const str = args.len > 0 ? args[0] : ""
        gEditor.commandLine(str)
        gEditor.getActiveEditor2().setMode("insert")
        return true

    case "set-search-query":
        gEditor.getActiveEditor2().setSearchQuery(args[0])
        return true

    }
    return false
}

window.handleUnknownPopupAction = (popup, action, args) => {
    // console.log("js: handleUnknownPopupAction ", popup, action, args)
    if (handleLambdaAction(action, args))
        return true
    return false
}

window.handleUnknownDocumentEditorAction = (editor, action, args) => {
    // console.log("js: handleUnknownDocumentEditorAction ", editor, action, args)
    if (handleLambdaAction(action, args))
        return true
    // console.log("handleUnknownDocumentEditorAction ", editor, action, args)
    return false
}

addCommand("editor", "<S-SPACE>kn", "kb-normal")
addCommand("editor", "<S-SPACE>kv", "kb-vim")
addCommand("editor", "<S-SPACE>kh", "kb-helix")

gEditor.setOption("editor.maxViews", 2)