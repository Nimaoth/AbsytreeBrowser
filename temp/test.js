const Parser = window.TreeSitter

let isEditorLoaded = false
function loadEditor() {
    if (isEditorLoaded)
        return
    isEditorLoaded = true
    let script = document.createElement("script")
    script.setAttribute("src", "ast.js")
    document.body.appendChild(script)
}

function loadFileSync(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function loadTreesitterLanguage(path) {
    return new Promise((resolve, reject) => {
        Parser.Language.load(path).then(resolve, () => resolve(null))
    })
}

var treeSitterInitialized = false
function doInitTreesitter() {
    try {
        return Parser.init().then(() => {
            treeSitterInitialized = true
            console.log("treesitter is ready")
            loadEditor()
        }, () => {
            alert("Couldn't initialize treesitter")
            console.error("Couldn't initialize treesitter")
            loadEditor()
        })
    } catch {
        alert("Couldn't initialize treesitter")
        console.error("Couldn't initialize treesitter")
        loadEditor()
    }
}
doInitTreesitter()
