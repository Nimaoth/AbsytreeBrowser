console.log("lol")

// Open a git hub repository workspace
// This allows you to browse the files in this repository at the specified branch or commit (read only)
// You can set the GithubAccessToken in local storage to a github token (bearer format), this will then be used
// to authenticate any requests to the github api.
gEditor.openGithubWorkspace("Nimaoth", "Absytree", "main")

// Open a absytree server workspace.
// absytree_server.js must be running there, and it will serve the files in the directory it's running in (read-write access)
// gEditor.openAbsytreeServerWorkspace("http://localhost:3000")

window.handleGlobalAction = (action, args) => {
    console.log("handleGlobalAction ", action, args)
    if (handleLambdaAction(action, args))
        return true

    switch (action) {
    case "escape":
        gEditor.getActiveEditor2().clearSelections()
        return true
    case "command-line":
        gEditor.commandLine(args[0])
        gEditor.getActiveEditor2().setMode("insert")
        return true

    case "set-search-query":
        gEditor.getActiveEditor2().setSearchQuery(args[0])
        return true

    }
    return false
}

window.handleUnknownPopupAction = (popup, action, args) => {
    console.log("handleUnknownPopupAction ", popup, action, args)
    if (handleLambdaAction(action, args))
        return true
    return false
}

window.handleUnknownDocumentEditorAction = (editor, action, args) => {
    console.log("handleUnknownDocumentEditorAction ", editor, action, args)
    if (handleLambdaAction(action, args))
        return true
    // console.log("handleUnknownDocumentEditorAction ", editor, action, args)
    return false
}

addCommand("editor", "<S-SPACE><*-a>i", "toggle-flag", "ast.inline-blocks")
addCommand("editor", "<S-SPACE><*-a>d", "toggle-flag", "ast.vertical-division")
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

addCommandLambda("editor", "<S-SPACE>l<*-n>1", () => {
    gEditor.scriptSetOptionString("editor.text.line-numbers", "none")
    gEditor.requestRender(true)
})
addCommandLambda("editor", "<S-SPACE>l<*-n>2", () => {
    gEditor.scriptSetOptionString("editor.text.line-numbers", "absolute")
    gEditor.requestRender(true)
})
addCommandLambda("editor", "<S-SPACE>l<*-n>3", () => {
    gEditor.scriptSetOptionString("editor.text.line-numbers", "relative")
    gEditor.requestRender(true)
})

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
    gEditor.commandLine("set-search-query \\")
    gEditor.getActiveEditor2().moveLast("file", 0, true, 0)
    gEditor.getActiveEditor2().setMode("insert")
})

addTextCommand("", "<A-n>", "select-move", "next-find-result")
addTextCommand("", "<A-s>", "select-move", "prev-find-result")
addTextCommand("", "<C-e>", "addNextFindResultToSelection")
addTextCommand("", "<C-o>", "addPrevFindResultToSelection")
addTextCommand("", "<A-e>", "setAllFindResultToSelection")
addTextCommand("", "<S-SPACE>*", () => gEditor.getActiveEditor2().setSearchQueryFromMove("word"))

addTextCommand("completion", "<ESCAPE>", "hide-completions")
addTextCommand("completion", "<UP>", "select-prev-completion")
addTextCommand("completion", "<DOWN>", "select-next-completion")
addTextCommand("completion", "<TAB>", "apply-selected-completion")
addTextCommand("", "<S-SPACE>gd", "goto-definition")
addTextCommand("", "<C-SPACE>", "get-completions")
addTextCommand("", "<C-p>", "get-completions")

addCommand("popup.selector", "<ENTER>", "accept")
addCommand("popup.selector", "<TAB>", "accept")
addCommand("popup.selector", "<ESCAPE>", "cancel")
addCommand("popup.selector", "<UP>", "prev")
addCommand("popup.selector", "<DOWN>", "next")
addCommand("popup.selector", "<HOME>", "home")
addCommand("popup.selector", "<END>", "end")


addCommand("editor.ast", "<A-LEFT>", "move-cursor", "-1")
addCommand("editor.ast", "<A-RIGHT>", "move-cursor", 1)
addCommand("editor.ast", "<A-UP>", "move-cursor-up")
addCommand("editor.ast", "<A-DOWN>", "move-cursor-down")
addCommand("editor.ast", "<HOME>", "cursor.home")
addCommand("editor.ast", "<END>", "cursor.end")
addCommand("editor.ast", "<UP>", "move-cursor-prev-line")
addCommand("editor.ast", "<DOWN>", "move-cursor-next-line")
addCommand("editor.ast", "<LEFT>", "move-cursor-prev")
addCommand("editor.ast", "<RIGHT>", "move-cursor-next")
addCommand("editor.ast", "n", "move-cursor-prev")
addCommand("editor.ast", "t", "move-cursor-next")
addCommand("editor.ast", "<S-LEFT>", "cursor.left", "last")
addCommand("editor.ast", "<S-RIGHT>", "cursor.right", "last")
addCommand("editor.ast", "<S-UP>", "cursor.up", "last")
addCommand("editor.ast", "<S-DOWN>", "cursor.down", "last")
addCommand("editor.ast", "<S-HOME>", "cursor.home", "last")
addCommand("editor.ast", "<S-END>", "cursor.end", "last")
addCommand("editor.ast", "<BACKSPACE>", "backspace")
addCommand("editor.ast", "<DELETE>", "delete")
addCommand("editor.ast", "<TAB>", "edit-next-empty")
addCommand("editor.ast", "<S-TAB>", "edit-prev-empty")
addCommand("editor.ast", "<A-f>", "select-containing", "function")
addCommand("editor.ast", "<A-c>", "select-containing", "const-decl")
addCommand("editor.ast", "<A-n>", "select-containing", "node-list")
addCommand("editor.ast", "<A-i>", "select-containing", "if")
addCommand("editor.ast", "<A-l>", "select-containing", "line")
addCommand("editor.ast", "e", "rename")
addCommand("editor.ast", "AE", "insert-after", "empty")
addCommand("editor.ast", "AP", "insert-after", "deleted")
addCommand("editor.ast", "ae", "insert-after-smart", "empty")
addCommand("editor.ast", "ap", "insert-after-smart", "deleted")
addCommand("editor.ast", "IE", "insert-before", "empty")
addCommand("editor.ast", "IP", "insert-before", "deleted")
addCommand("editor.ast", "ie", "insert-before-smart", "empty")
addCommand("editor.ast", "ip", "insert-before-smart", "deleted")
addCommand("editor.ast", "ke", "insert-child", "empty")
addCommand("editor.ast", "kp", "insert-child", "deleted")
addCommand("editor.ast", "s", "replace", "empty")
addCommand("editor.ast", "re", "replace", "empty")
addCommand("editor.ast", "rn", "replace", "number-literal")
addCommand("editor.ast", "rf", "replace", "call-func")
addCommand("editor.ast", "rp", "replace", "deleted")
addCommand("editor.ast", "rr", "replace-parent")
addCommand("editor.ast", "gd", "goto", "definition")
addCommand("editor.ast", "gp", "goto", "prev-usage")
addCommand("editor.ast", "gn", "goto", "next-usage")
addCommand("editor.ast", "GE", "goto", "prev-error")
addCommand("editor.ast", "ge", "goto", "next-error")
addCommand("editor.ast", "gs", "goto", "symbol")
addCommand("editor.ast", "<F12>", "goto", "next-error-diagnostic")
addCommand("editor.ast", "<S-F12>", "goto", "prev-error-diagnostic")
addCommand("editor.ast", "R", "run-selected-function")
addCommand("editor.ast", "\"", "replace-empty", "\"")
addCommand("editor.ast", "'", "replace-empty", "\"")
addCommand("editor.ast", "+", "wrap", "+")
addCommand("editor.ast", "-", "wrap", "-")
addCommand("editor.ast", "*", "wrap", "*")
addCommand("editor.ast", "/", "wrap", "/")
addCommand("editor.ast", "%", "wrap", "%")
addCommand("editor.ast", "(", "wrap", "call-func")
addCommand("editor.ast", ")", "wrap", "call-arg")
addCommand("editor.ast", "{", "wrap", "{")
addCommand("editor.ast", "=<ENTER>", "wrap", "=")
addCommand("editor.ast", "==", "wrap", "==")
addCommand("editor.ast", "!=", "wrap", "!=")
addCommand("editor.ast", "\\<\\>", "wrap", "<>")
addCommand("editor.ast", "\\<=", "wrap", "<=")
addCommand("editor.ast", "\\>=", "wrap", ">=")
addCommand("editor.ast", "\\<<ENTER>", "wrap", "<")
addCommand("editor.ast", "\\><ENTER>", "wrap", ">")
addCommand("editor.ast", "<SPACE>and", "wrap", "and")
addCommand("editor.ast", "<SPACE>or", "wrap", "or")
addCommand("editor.ast", "vc", "wrap", "const-decl")
addCommand("editor.ast", "vl", "wrap", "let-decl")
addCommand("editor.ast", "vv", "wrap", "var-decl")
addCommand("editor.ast", "d", "delete-selected")
addCommand("editor.ast", "y", "copy-selected")
addCommand("editor.ast", "u", "undo")
addCommand("editor.ast", "U", "redo")
addCommand("editor.ast", "<C-d>", "scroll", -150)
addCommand("editor.ast", "<C-u>", "scroll", 150)
addCommand("editor.ast", "<PAGE_DOWN>", "scroll", -450)
addCommand("editor.ast", "<PAGE_UP>", "scroll", 450)
addCommand("editor.ast", "<C-f>", "select-center-node")
addCommand("editor.ast", "<C-r>", "select-prev")
addCommand("editor.ast", "<C-t>", "select-next")
addCommand("editor.ast", "<C-LEFT>", "select-prev")
addCommand("editor.ast", "<C-RIGHT>", "select-next")
addCommand("editor.ast", "<SPACE>dc", "dump-context")
addCommand("editor.ast", "<CA-DOWN>", "scroll-output", "-5")
addCommand("editor.ast", "<CA-UP>", "scroll-output", "5")
addCommand("editor.ast", "<CA-HOME>", "scroll-output", "home")
addCommand("editor.ast", "<CA-END>", "scroll-output", "end")
addCommand("editor.ast", ".", "run-last-command", "edit")
addCommand("editor.ast", ",", "run-last-command", "move")
addCommand("editor.ast", ";", "run-last-command")
addCommand("editor.ast", "<A-t>", "move-node-to-next-space")
addCommand("editor.ast", "<A-n>", "move-node-to-prev-space")
addCommand("editor.ast", "<C-a>", "set-mode", "uiae")

addCommand("editor.ast.completion", "<ENTER>", "finish-edit", true)
addCommand("editor.ast.completion", "<ESCAPE>", "finish-edit", false)
addCommand("editor.ast.completion", "<UP>", "select-prev-completion")
addCommand("editor.ast.completion", "<DOWN>", "select-next-completion")
addCommand("editor.ast.completion", "<TAB>", "apply-selected-completion")
addCommand("editor.ast.completion", "<C-TAB>", "cancel-and-next-completion")
addCommand("editor.ast.completion", "<CS-TAB>", "cancel-and-prev-completion")
addCommand("editor.ast.completion", "<A-d>", "cancel-and-delete")
addCommand("editor.ast.completion", "<A-t>", "move-empty-to-next-space")
addCommand("editor.ast.completion", "<A-n>", "move-empty-to-prev-space")

addCommand("editor.ast.goto", "<ENTER>", "accept")
addCommand("editor.ast.goto", "<TAB>", "accept")
addCommand("editor.ast.goto", "<ESCAPE>", "cancel")
addCommand("editor.ast.goto", "<UP>", "prev")
addCommand("editor.ast.goto", "<DOWN>", "next")
addCommand("editor.ast.goto", "<HOME>", "home")
addCommand("editor.ast.goto", "<END>", "end")