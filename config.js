console.log("lol")

// Open a git hub repository workspace
// This allows you to browse the files in this repository at the specified branch or commit (read only)
// You can set the GithubAccessToken in local storage to a github token (bearer format), this will then be used
// to authenticate any requests to the github api.
gEditor.openGithubWorkspace("Nimaoth", "AbsytreeBrowser", "main")

// Open a absytree server workspace.
// absytree_server.js must be running there, and it will serve the files in the directory it's running in (read-write access)
// gEditor.openAbsytreeServerWorkspace("http://localhost:3000")

window.handleGlobalAction = (action, args) => {
    if (handleLambdaAction(action, args))
        return true

    // console.log("handleGlobalAction ", action, args)

    switch (action) {
    case "escape":
        gEditor.getActiveEditor2().clearSelections()
        return true
    case "command-line":
        gEditor.commandLine(args)
        gEditor.getActiveEditor2().setMode("insert")
        return true

    case "set-search-query":
        gEditor.getActiveEditor2().setSearchQuery(args)
        return true

    }
    return false
}

window.handleUnknownPopupAction = (popup, action, args) => {
    if (handleLambdaAction(action, args))
        return true
    // console.log("handleUnknownPopupAction ", popup, action, args)
    return false
}

window.handleUnknownDocumentEditorAction = (editor, action, args) => {
    if (handleLambdaAction(action, args))
        return true
    // console.log("handleUnknownDocumentEditorAction ", editor, action, args)
    return false
}

addCommand("editor", "<S-SPACE>ff", "log-options")
addCommand("editor", "<ESCAPE>", "escape")
addCommand("editor", "<S-SPACE><*-l>-", "change-font-size", -1)
addCommand("editor", "<S-SPACE><*-l>+", "change-font-size", 1)
addCommand("editor", "<S-SPACE>l1", "set-layout", "horizontal")
addCommand("editor", "<S-SPACE>l2", "set-layout", "vertical")
addCommand("editor", "<S-SPACE>l3", "set-layout", "fibonacci")
addCommand("editor", "<CA-h>", "change-layout-prop", "main-split", -0.05)
addCommand("editor", "<CA-f>", "change-layout-prop", "main-split", 0.05)
addCommand("editor", "<CA-v>", "create-view")
addCommand("editor", "<CA-a>", "create-keybind-autocomplete-view")
addCommand("editor", "<CA-x>", "close-current-view")
addCommand("editor", "<CA-n>", "prev-view")
addCommand("editor", "<CA-t>", "next-view")
addCommand("editor", "<CA-s>", "move-current-view-prev")
addCommand("editor", "<CA-d>", "move-current-view-next")
addCommand("editor", "<CA-r>", "move-current-view-to-top")
addCommand("editor", "<S-SPACE><S-SPACE>", "command-line")
addCommand("editor", "<S-SPACE>t", "choose-theme")
addCommand("editor", "<S-SPACE>f", "choose-file", "new")
addCommand("editor", "<S-SPACE>lf", "load-file")
addCommand("editor", "<S-SPACE>wf", "write-file")
addCommand("editor", "<S-SPACE>SS", "write-file", "", true)
addCommand("editor", "<S-SPACE>SA", "save-app-state")
addCommand("editor", "<S-SPACE>SC", "remove-from-local-storage")
addCommand("editor", "<S-SPACE>CC", "clear-workspace-caches")

// addCommand("editor", "<S-SPACE>kn", () => loadNormalBindings())
// addCommand("editor", "<S-SPACE>kv", () => loadVimBindings())
// addCommand("editor", "<S-SPACE>kh", () => loadHelixBindings())

addCommand("commandLine", "<ESCAPE>", "exit-command-line")
addCommand("commandLine", "<ENTER>", "execute-command-line")

addTextCommand("", "<LEFT>", "move-cursor-column -1")
addTextCommand("", "<RIGHT>", "move-cursor-column 1")
addTextCommand("", "<C-d>", "delete-move \"line-next\"")
addTextCommand("", "<C-LEFT>", "move-last \"word-line-back\"")
addTextCommand("", "<C-RIGHT>", "move-last \"word-line\"")
addTextCommand("", "<HOME>", "move-first \"line\"")
addTextCommand("", "<END>", "move-last \"line\"")
addTextCommand("", "<C-UP>", "scroll-text 20")
addTextCommand("", "<C-DOWN>", "scroll-text -20")
addTextCommand("", "<CS-LEFT>", "move-last \"word-line-back\" \"last\"")
addTextCommand("", "<CS-RIGHT>", "move-last \"word-line\" \"last\"")
addTextCommand("", "<UP>", "move-cursor-line -1")
addTextCommand("", "<DOWN>", "move-cursor-line 1")
addTextCommand("", "<C-HOME>", "move-first \"file\"")
addTextCommand("", "<C-END>", "move-last \"file\"")
addTextCommand("", "<CS-HOME>", "move-first \"file\" \"last\"")
addTextCommand("", "<CS-END>", "move-last \"file\" \"last\"")
addTextCommand("", "<S-LEFT>", "move-cursor-column -1 \"last\"")
addTextCommand("", "<S-RIGHT>", "move-cursor-column 1 \"last\"")
addTextCommand("", "<S-UP>", "move-cursor-line -1 \"last\"")
addTextCommand("", "<S-DOWN>", "move-cursor-line 1 \"last\"")
addTextCommand("", "<S-HOME>", "move-first \"line\" \"last\"")
addTextCommand("", "<S-END>", "move-last \"line\" \"last\"")
addTextCommand("", "<A-d>", "duplicate-last-selection")
addTextCommand("", "<CA-UP>", "add-cursor-above")
addTextCommand("", "<CA-DOWN>", "add-cursor-below")
addTextCommand("", "<BACKSPACE>", "delete-left")
addTextCommand("", "<DELETE>", "delete-right")
addTextCommand("", "<ENTER>", "insert-text \"\n\"")
addTextCommand("", "<SPACE>", "insert-text \" \"")
addTextCommand("", "<C-l>", "select-line-current")
addTextCommand("", "<A-UP>", "select-parent-current-ts")
addTextCommand("", "<C-r>", "select-prev")
addTextCommand("", "<C-t>", "select-next")
addTextCommand("", "<C-n>", "invert-selection")
addTextCommand("", "<C-z>", "undo")
addTextCommand("", "<C-y>", "redo")

addTextCommand("", "<C-f>", () => {
    console.log("set-search-query")
    gEditor.commandLine("set-search-query ")
    gEditor.getActiveEditor2().moveLast("file", 0, true, 0)
    gEditor.getActiveEditor2().setMode("insert")
})

addTextCommand("", "<A-n>", "select-move", "next-find-result")
addTextCommand("", "<A-s>", "select-move", "prev-find-result")
addTextCommand("", "<C-e>", "addNextFindResultToSelection")
addTextCommand("", "<C-o>", "addPrevFindResultToSelection")
addTextCommand("", "<A-e>", "setAllFindResultToSelection")
addTextCommand("", "*", () => gEditor.getActiveEditor2().setSearchQueryFromMove("word"))

addCommand("popup.selector", "<ENTER>", "accept")
addCommand("popup.selector", "<TAB>", "accept")
addCommand("popup.selector", "<ESCAPE>", "cancel")
addCommand("popup.selector", "<UP>", "prev")
addCommand("popup.selector", "<DOWN>", "next")
addCommand("popup.selector", "<HOME>", "home")
addCommand("popup.selector", "<END>", "end")