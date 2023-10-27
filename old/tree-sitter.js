var Module = void 0 !== Module ? Module : {},
  TreeSitter = (function () {
    var initPromise,
      document =
        "object" == typeof window
          ? { currentScript: window.document.currentScript }
          : null;
    class Parser {
      constructor() {
        this.initialize();
      }
      initialize() {
        throw new Error("cannot construct a Parser before calling `init()`");
      }
      static init(moduleOptions) {
        return (
          initPromise ||
          ((Module = Object.assign({}, Module, moduleOptions)),
          (initPromise = new Promise((resolveInitPromise) => {
            var moduleOverrides = Object.assign({}, Module),
              arguments_ = [],
              thisProgram = "./this.program",
              quit_ = (e, t) => {
                throw t;
              },
              ENVIRONMENT_IS_WEB = "object" == typeof window,
              ENVIRONMENT_IS_WORKER = "function" == typeof importScripts,
              ENVIRONMENT_IS_NODE =
                "object" == typeof process &&
                "object" == typeof process.versions &&
                "string" == typeof process.versions.node,
              scriptDirectory = "",
              read_,
              readAsync,
              readBinary,
              setWindowTitle;
            function locateFile(e) {
              return Module.locateFile
                ? Module.locateFile(e, scriptDirectory)
                : scriptDirectory + e;
            }
            function logExceptionOnExit(e) {
              if (e instanceof ExitStatus) return;
              let t = e;
              e && "object" == typeof e && e.stack && (t = [e, e.stack]),
                err("exiting due to exception: " + t);
            }
            if (ENVIRONMENT_IS_NODE) {
              var fs = require("fs"),
                nodePath = require("path");
              (scriptDirectory = ENVIRONMENT_IS_WORKER
                ? nodePath.dirname(scriptDirectory) + "/"
                : __dirname + "/"),
                (read_ = (e, t) => (
                  (e = isFileURI(e) ? new URL(e) : nodePath.normalize(e)),
                  fs.readFileSync(e, t ? void 0 : "utf8")
                )),
                (readBinary = (e) => {
                  var t = read_(e, !0);
                  return t.buffer || (t = new Uint8Array(t)), t;
                }),
                (readAsync = (e, t, r) => {
                  (e = isFileURI(e) ? new URL(e) : nodePath.normalize(e)),
                    fs.readFile(e, function (e, n) {
                      e ? r(e) : t(n.buffer);
                    });
                }),
                process.argv.length > 1 &&
                  (thisProgram = process.argv[1].replace(/\\/g, "/")),
                (arguments_ = process.argv.slice(2)),
                "undefined" != typeof module && (module.exports = Module),
                (quit_ = (e, t) => {
                  if (keepRuntimeAlive()) throw ((process.exitCode = e), t);
                  logExceptionOnExit(t), process.exit(e);
                }),
                (Module.inspect = function () {
                  return "[Emscripten Module object]";
                });
            } else
              (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
                (ENVIRONMENT_IS_WORKER
                  ? (scriptDirectory = self.location.href)
                  : void 0 !== document &&
                    document.currentScript &&
                    (scriptDirectory = document.currentScript.src),
                (scriptDirectory =
                  0 !== scriptDirectory.indexOf("blob:")
                    ? scriptDirectory.substr(
                        0,
                        scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") +
                          1
                      )
                    : ""),
                (read_ = (e) => {
                  var t = new XMLHttpRequest();
                  return t.open("GET", e, !1), t.send(null), t.responseText;
                }),
                ENVIRONMENT_IS_WORKER &&
                  (readBinary = (e) => {
                    var t = new XMLHttpRequest();
                    return (
                      t.open("GET", e, !1),
                      (t.responseType = "arraybuffer"),
                      t.send(null),
                      new Uint8Array(t.response)
                    );
                  }),
                (readAsync = (e, t, r) => {
                  var n = new XMLHttpRequest();
                  n.open("GET", e, !0),
                    (n.responseType = "arraybuffer"),
                    (n.onload = () => {
                      200 == n.status || (0 == n.status && n.response)
                        ? t(n.response)
                        : r();
                    }),
                    (n.onerror = r),
                    n.send(null);
                }),
                (setWindowTitle = (e) => (document.title = e)));
            var out = Module.print || console.log.bind(console),
              err = Module.printErr || console.warn.bind(console);
            Object.assign(Module, moduleOverrides),
              (moduleOverrides = null),
              Module.arguments && (arguments_ = Module.arguments),
              Module.thisProgram && (thisProgram = Module.thisProgram),
              Module.quit && (quit_ = Module.quit);
            var dynamicLibraries = Module.dynamicLibraries || [],
              wasmBinary;
            Module.wasmBinary && (wasmBinary = Module.wasmBinary);
            var noExitRuntime = Module.noExitRuntime || !0,
              wasmMemory;
            "object" != typeof WebAssembly &&
              abort("no native wasm support detected");
            var ABORT = !1,
              EXITSTATUS;
            function assert(e, t) {
              e || abort(t);
            }
            var UTF8Decoder =
                "undefined" != typeof TextDecoder
                  ? new TextDecoder("utf8")
                  : void 0,
              HEAP8,
              HEAPU8,
              HEAP16,
              HEAPU16,
              HEAP32,
              HEAPU32,
              HEAPF32,
              HEAPF64;
            function UTF8ArrayToString(e, t, r) {
              for (var n = t + r, o = t; e[o] && !(o >= n); ) ++o;
              if (o - t > 16 && e.buffer && UTF8Decoder)
                return UTF8Decoder.decode(e.subarray(t, o));
              for (var s = ""; t < o; ) {
                var a = e[t++];
                if (128 & a) {
                  var _ = 63 & e[t++];
                  if (192 != (224 & a)) {
                    var i = 63 & e[t++];
                    if (
                      (a =
                        224 == (240 & a)
                          ? ((15 & a) << 12) | (_ << 6) | i
                          : ((7 & a) << 18) |
                            (_ << 12) |
                            (i << 6) |
                            (63 & e[t++])) < 65536
                    )
                      s += String.fromCharCode(a);
                    else {
                      var l = a - 65536;
                      s += String.fromCharCode(
                        55296 | (l >> 10),
                        56320 | (1023 & l)
                      );
                    }
                  } else s += String.fromCharCode(((31 & a) << 6) | _);
                } else s += String.fromCharCode(a);
              }
              return s;
            }
            function UTF8ToString(e, t) {
              return e ? UTF8ArrayToString(HEAPU8, e, t) : "";
            }
            function stringToUTF8Array(e, t, r, n) {
              if (!(n > 0)) return 0;
              for (var o = r, s = r + n - 1, a = 0; a < e.length; ++a) {
                var _ = e.charCodeAt(a);
                if (_ >= 55296 && _ <= 57343)
                  _ = (65536 + ((1023 & _) << 10)) | (1023 & e.charCodeAt(++a));
                if (_ <= 127) {
                  if (r >= s) break;
                  t[r++] = _;
                } else if (_ <= 2047) {
                  if (r + 1 >= s) break;
                  (t[r++] = 192 | (_ >> 6)), (t[r++] = 128 | (63 & _));
                } else if (_ <= 65535) {
                  if (r + 2 >= s) break;
                  (t[r++] = 224 | (_ >> 12)),
                    (t[r++] = 128 | ((_ >> 6) & 63)),
                    (t[r++] = 128 | (63 & _));
                } else {
                  if (r + 3 >= s) break;
                  (t[r++] = 240 | (_ >> 18)),
                    (t[r++] = 128 | ((_ >> 12) & 63)),
                    (t[r++] = 128 | ((_ >> 6) & 63)),
                    (t[r++] = 128 | (63 & _));
                }
              }
              return (t[r] = 0), r - o;
            }
            function stringToUTF8(e, t, r) {
              return stringToUTF8Array(e, HEAPU8, t, r);
            }
            function lengthBytesUTF8(e) {
              for (var t = 0, r = 0; r < e.length; ++r) {
                var n = e.charCodeAt(r);
                n <= 127
                  ? t++
                  : n <= 2047
                  ? (t += 2)
                  : n >= 55296 && n <= 57343
                  ? ((t += 4), ++r)
                  : (t += 3);
              }
              return t;
            }
            function updateMemoryViews() {
              var e = wasmMemory.buffer;
              (Module.HEAP8 = HEAP8 = new Int8Array(e)),
                (Module.HEAP16 = HEAP16 = new Int16Array(e)),
                (Module.HEAP32 = HEAP32 = new Int32Array(e)),
                (Module.HEAPU8 = HEAPU8 = new Uint8Array(e)),
                (Module.HEAPU16 = HEAPU16 = new Uint16Array(e)),
                (Module.HEAPU32 = HEAPU32 = new Uint32Array(e)),
                (Module.HEAPF32 = HEAPF32 = new Float32Array(e)),
                (Module.HEAPF64 = HEAPF64 = new Float64Array(e));
            }
            var INITIAL_MEMORY = Module.INITIAL_MEMORY || 33554432;
            assert(
              INITIAL_MEMORY >= 65536,
              "INITIAL_MEMORY should be larger than STACK_SIZE, was " +
                INITIAL_MEMORY +
                "! (STACK_SIZE=65536)"
            ),
              (wasmMemory = Module.wasmMemory
                ? Module.wasmMemory
                : new WebAssembly.Memory({
                    initial: INITIAL_MEMORY / 65536,
                    maximum: 32768,
                  })),
              updateMemoryViews(),
              (INITIAL_MEMORY = wasmMemory.buffer.byteLength);
            var wasmTable = new WebAssembly.Table({
                initial: 22,
                element: "anyfunc",
              }),
              __ATPRERUN__ = [],
              __ATINIT__ = [],
              __ATMAIN__ = [],
              __ATPOSTRUN__ = [],
              __RELOC_FUNCS__ = [],
              runtimeInitialized = !1;
            function keepRuntimeAlive() {
              return noExitRuntime;
            }
            function preRun() {
              if (Module.preRun)
                for (
                  "function" == typeof Module.preRun &&
                  (Module.preRun = [Module.preRun]);
                  Module.preRun.length;

                )
                  addOnPreRun(Module.preRun.shift());
              callRuntimeCallbacks(__ATPRERUN__);
            }
            function initRuntime() {
              (runtimeInitialized = !0),
                callRuntimeCallbacks(__RELOC_FUNCS__),
                Module.noFSInit || FS.init.initialized || FS.init(),
                (FS.ignorePermissions = !1),
                TTY.init(),
                callRuntimeCallbacks(__ATINIT__);
            }
            function preMain() {
              callRuntimeCallbacks(__ATMAIN__);
            }
            function postRun() {
              if (Module.postRun)
                for (
                  "function" == typeof Module.postRun &&
                  (Module.postRun = [Module.postRun]);
                  Module.postRun.length;

                )
                  addOnPostRun(Module.postRun.shift());
              callRuntimeCallbacks(__ATPOSTRUN__);
            }
            function addOnPreRun(e) {
              __ATPRERUN__.unshift(e);
            }
            function addOnInit(e) {
              __ATINIT__.unshift(e);
            }
            function addOnPostRun(e) {
              __ATPOSTRUN__.unshift(e);
            }
            var runDependencies = 0,
              runDependencyWatcher = null,
              dependenciesFulfilled = null;
            function getUniqueRunDependency(e) {
              return e;
            }
            function addRunDependency(e) {
              runDependencies++,
                Module.monitorRunDependencies &&
                  Module.monitorRunDependencies(runDependencies);
            }
            function removeRunDependency(e) {
              if (
                (runDependencies--,
                Module.monitorRunDependencies &&
                  Module.monitorRunDependencies(runDependencies),
                0 == runDependencies &&
                  (null !== runDependencyWatcher &&
                    (clearInterval(runDependencyWatcher),
                    (runDependencyWatcher = null)),
                  dependenciesFulfilled))
              ) {
                var t = dependenciesFulfilled;
                (dependenciesFulfilled = null), t();
              }
            }
            function abort(e) {
              throw (
                (Module.onAbort && Module.onAbort(e),
                err((e = "Aborted(" + e + ")")),
                (ABORT = !0),
                (EXITSTATUS = 1),
                (e += ". Build with -sASSERTIONS for more info."),
                new WebAssembly.RuntimeError(e))
              );
            }
            var dataURIPrefix = "data:application/octet-stream;base64,",
              wasmBinaryFile,
              tempDouble,
              tempI64;
            function isDataURI(e) {
              return e.startsWith(dataURIPrefix);
            }
            function isFileURI(e) {
              return e.startsWith("file://");
            }
            function getBinary(e) {
              try {
                if (e == wasmBinaryFile && wasmBinary)
                  return new Uint8Array(wasmBinary);
                if (readBinary) return readBinary(e);
                throw "both async and sync fetching of the wasm failed";
              } catch (e) {
                abort(e);
              }
            }
            function getBinaryPromise(e) {
              if (
                !wasmBinary &&
                (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)
              ) {
                if ("function" == typeof fetch && !isFileURI(e))
                  return fetch(e, { credentials: "same-origin" })
                    .then(function (t) {
                      if (!t.ok)
                        throw "failed to load wasm binary file at '" + e + "'";
                      return t.arrayBuffer();
                    })
                    .catch(function () {
                      return getBinary(e);
                    });
                if (readAsync)
                  return new Promise(function (t, r) {
                    readAsync(
                      e,
                      function (e) {
                        t(new Uint8Array(e));
                      },
                      r
                    );
                  });
              }
              return Promise.resolve().then(function () {
                return getBinary(e);
              });
            }
            function instantiateArrayBuffer(e, t, r) {
              return getBinaryPromise(e)
                .then(function (e) {
                  return WebAssembly.instantiate(e, t);
                })
                .then(function (e) {
                  return e;
                })
                .then(r, function (e) {
                  err("failed to asynchronously prepare wasm: " + e), abort(e);
                });
            }
            function instantiateAsync(e, t, r, n) {
              return e ||
                "function" != typeof WebAssembly.instantiateStreaming ||
                isDataURI(t) ||
                isFileURI(t) ||
                ENVIRONMENT_IS_NODE ||
                "function" != typeof fetch
                ? instantiateArrayBuffer(t, r, n)
                : fetch(t, { credentials: "same-origin" }).then(function (e) {
                    return WebAssembly.instantiateStreaming(e, r).then(
                      n,
                      function (e) {
                        return (
                          err("wasm streaming compile failed: " + e),
                          err("falling back to ArrayBuffer instantiation"),
                          instantiateArrayBuffer(t, r, n)
                        );
                      }
                    );
                  });
            }
            function createWasm() {
              var e = {
                env: wasmImports,
                wasi_snapshot_preview1: wasmImports,
                "GOT.mem": new Proxy(wasmImports, GOTHandler),
                "GOT.func": new Proxy(wasmImports, GOTHandler),
              };
              function t(e, t) {
                var r = e.exports;
                r = relocateExports(r, 1024);
                var n = getDylinkMetadata(t);
                return (
                  n.neededDynlibs &&
                    (dynamicLibraries =
                      n.neededDynlibs.concat(dynamicLibraries)),
                  mergeLibSymbols(r, "main"),
                  (Module.asm = r),
                  addOnInit(Module.asm.__wasm_call_ctors),
                  __RELOC_FUNCS__.push(Module.asm.__wasm_apply_data_relocs),
                  removeRunDependency("wasm-instantiate"),
                  r
                );
              }
              if (
                (addRunDependency("wasm-instantiate"), Module.instantiateWasm)
              )
                try {
                  return Module.instantiateWasm(e, t);
                } catch (e) {
                  return (
                    err(
                      "Module.instantiateWasm callback failed with error: " + e
                    ),
                    !1
                  );
                }
              return (
                instantiateAsync(wasmBinary, wasmBinaryFile, e, function (e) {
                  t(e.instance, e.module);
                }),
                {}
              );
            }
            (wasmBinaryFile = "tree-sitter.wasm"),
              isDataURI(wasmBinaryFile) ||
                (wasmBinaryFile = locateFile(wasmBinaryFile));
            var ASM_CONSTS = {};
            function ExitStatus(e) {
              (this.name = "ExitStatus"),
                (this.message = "Program terminated with exit(" + e + ")"),
                (this.status = e);
            }
            var GOT = {},
              CurrentModuleWeakSymbols = new Set([]),
              GOTHandler = {
                get: function (e, t) {
                  var r = GOT[t];
                  return (
                    r ||
                      (r = GOT[t] =
                        new WebAssembly.Global({ value: "i32", mutable: !0 })),
                    CurrentModuleWeakSymbols.has(t) || (r.required = !0),
                    r
                  );
                },
              };
            function callRuntimeCallbacks(e) {
              for (; e.length > 0; ) e.shift()(Module);
            }
            function getDylinkMetadata(e) {
              var t = 0,
                r = 0;
              function n() {
                for (var r = 0, n = 1; ; ) {
                  var o = e[t++];
                  if (((r += (127 & o) * n), (n *= 128), !(128 & o))) break;
                }
                return r;
              }
              function o() {
                var r = n();
                return UTF8ArrayToString(e, (t += r) - r, r);
              }
              function s(e, t) {
                if (e) throw new Error(t);
              }
              var a = "dylink.0";
              if (e instanceof WebAssembly.Module) {
                var _ = WebAssembly.Module.customSections(e, a);
                0 === _.length &&
                  ((a = "dylink"),
                  (_ = WebAssembly.Module.customSections(e, a))),
                  s(0 === _.length, "need dylink section"),
                  (r = (e = new Uint8Array(_[0])).length);
              } else {
                s(
                  !(
                    1836278016 ==
                    new Uint32Array(new Uint8Array(e.subarray(0, 24)).buffer)[0]
                  ),
                  "need to see wasm magic number"
                ),
                  s(0 !== e[8], "need the dylink section to be first"),
                  (t = 9);
                var i = n();
                (r = t + i), (a = o());
              }
              var l = {
                neededDynlibs: [],
                tlsExports: new Set(),
                weakImports: new Set(),
              };
              if ("dylink" == a) {
                (l.memorySize = n()),
                  (l.memoryAlign = n()),
                  (l.tableSize = n()),
                  (l.tableAlign = n());
                for (var u = n(), d = 0; d < u; ++d) {
                  var c = o();
                  l.neededDynlibs.push(c);
                }
              } else {
                s("dylink.0" !== a);
                for (; t < r; ) {
                  var m = e[t++],
                    p = n();
                  if (1 === m)
                    (l.memorySize = n()),
                      (l.memoryAlign = n()),
                      (l.tableSize = n()),
                      (l.tableAlign = n());
                  else if (2 === m)
                    for (u = n(), d = 0; d < u; ++d)
                      (c = o()), l.neededDynlibs.push(c);
                  else if (3 === m)
                    for (var f = n(); f--; ) {
                      var h = o();
                      256 & n() && l.tlsExports.add(h);
                    }
                  else if (4 === m)
                    for (f = n(); f--; ) {
                      o(), (h = o());
                      1 == (3 & n()) && l.weakImports.add(h);
                    }
                  else t += p;
                }
              }
              return l;
            }
            function getValue(e, t = "i8") {
              switch ((t.endsWith("*") && (t = "*"), t)) {
                case "i1":
                case "i8":
                  return HEAP8[e >> 0];
                case "i16":
                  return HEAP16[e >> 1];
                case "i32":
                case "i64":
                  return HEAP32[e >> 2];
                case "float":
                  return HEAPF32[e >> 2];
                case "double":
                  return HEAPF64[e >> 3];
                case "*":
                  return HEAPU32[e >> 2];
                default:
                  abort("invalid type for getValue: " + t);
              }
            }
            function isSymbolDefined(e) {
              var t = wasmImports[e];
              return !(!t || t.stub);
            }
            function mergeLibSymbols(e, t) {
              for (var r in e) {
                if (!e.hasOwnProperty(r)) continue;
                const t = (t) => {
                  isSymbolDefined(t) || (wasmImports[t] = e[r]);
                };
                t(r);
                const n = "__main_argc_argv";
                "main" == r && t(n),
                  r == n && t("main"),
                  r.startsWith("dynCall_") &&
                    !Module.hasOwnProperty(r) &&
                    (Module[r] = e[r]);
              }
            }
            function newDSO(e, t, r) {
              var n = { refcount: 1 / 0, name: e, module: r, global: !0 };
              return (
                (LDSO.loadedLibsByName[e] = n),
                null != t && (LDSO.loadedLibsByHandle[t] = n),
                n
              );
            }
            var LDSO = {
                loadedLibsByName: {},
                loadedLibsByHandle: {},
                init: () => newDSO("__main__", 0, wasmImports),
              },
              ___heap_base = 79328;
            function zeroMemory(e, t) {
              return HEAPU8.fill(0, e, e + t), e;
            }
            function getMemory(e) {
              if (runtimeInitialized) return zeroMemory(_malloc(e), e);
              var t = ___heap_base,
                r = (t + e + 15) & -16;
              return (___heap_base = r), (GOT.__heap_base.value = r), t;
            }
            function isInternalSym(e) {
              return [
                "__cpp_exception",
                "__c_longjmp",
                "__wasm_apply_data_relocs",
                "__dso_handle",
                "__tls_size",
                "__tls_align",
                "__set_stack_limits",
                "_emscripten_tls_init",
                "__wasm_init_tls",
                "__wasm_call_ctors",
                "__start_em_asm",
                "__stop_em_asm",
              ].includes(e);
            }
            function uleb128Encode(e, t) {
              e < 128 ? t.push(e) : t.push(e % 128 | 128, e >> 7);
            }
            function sigToWasmTypes(e) {
              for (
                var t = { i: "i32", j: "i32", f: "f32", d: "f64", p: "i32" },
                  r = { parameters: [], results: "v" == e[0] ? [] : [t[e[0]]] },
                  n = 1;
                n < e.length;
                ++n
              )
                r.parameters.push(t[e[n]]),
                  "j" === e[n] && r.parameters.push("i32");
              return r;
            }
            function generateFuncType(e, t) {
              var r = e.slice(0, 1),
                n = e.slice(1),
                o = { i: 127, p: 127, j: 126, f: 125, d: 124 };
              t.push(96), uleb128Encode(n.length, t);
              for (var s = 0; s < n.length; ++s) t.push(o[n[s]]);
              "v" == r ? t.push(0) : t.push(1, o[r]);
            }
            function convertJsFunctionToWasm(e, t) {
              if ("function" == typeof WebAssembly.Function)
                return new WebAssembly.Function(sigToWasmTypes(t), e);
              var r = [1];
              generateFuncType(t, r);
              var n = [0, 97, 115, 109, 1, 0, 0, 0, 1];
              uleb128Encode(r.length, n),
                n.push.apply(n, r),
                n.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
              var o = new WebAssembly.Module(new Uint8Array(n));
              return new WebAssembly.Instance(o, { e: { f: e } }).exports.f;
            }
            var wasmTableMirror = [];
            function getWasmTableEntry(e) {
              var t = wasmTableMirror[e];
              return (
                t ||
                  (e >= wasmTableMirror.length &&
                    (wasmTableMirror.length = e + 1),
                  (wasmTableMirror[e] = t = wasmTable.get(e))),
                t
              );
            }
            function updateTableMap(e, t) {
              if (functionsInTableMap)
                for (var r = e; r < e + t; r++) {
                  var n = getWasmTableEntry(r);
                  n && functionsInTableMap.set(n, r);
                }
            }
            var functionsInTableMap = void 0;
            function getFunctionAddress(e) {
              return (
                functionsInTableMap ||
                  ((functionsInTableMap = new WeakMap()),
                  updateTableMap(0, wasmTable.length)),
                functionsInTableMap.get(e) || 0
              );
            }
            var freeTableIndexes = [];
            function getEmptyTableSlot() {
              if (freeTableIndexes.length) return freeTableIndexes.pop();
              try {
                wasmTable.grow(1);
              } catch (e) {
                if (!(e instanceof RangeError)) throw e;
                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
              }
              return wasmTable.length - 1;
            }
            function setWasmTableEntry(e, t) {
              wasmTable.set(e, t), (wasmTableMirror[e] = wasmTable.get(e));
            }
            function addFunction(e, t) {
              var r = getFunctionAddress(e);
              if (r) return r;
              var n = getEmptyTableSlot();
              try {
                setWasmTableEntry(n, e);
              } catch (r) {
                if (!(r instanceof TypeError)) throw r;
                setWasmTableEntry(n, convertJsFunctionToWasm(e, t));
              }
              return functionsInTableMap.set(e, n), n;
            }
            function updateGOT(e, t) {
              for (var r in e)
                if (!isInternalSym(r)) {
                  var n = e[r];
                  r.startsWith("orig$") && ((r = r.split("$")[1]), (t = !0)),
                    GOT[r] ||
                      (GOT[r] = new WebAssembly.Global({
                        value: "i32",
                        mutable: !0,
                      })),
                    (t || 0 == GOT[r].value) &&
                      ("function" == typeof n
                        ? (GOT[r].value = addFunction(n))
                        : "number" == typeof n
                        ? (GOT[r].value = n)
                        : err(
                            "unhandled export type for `" + r + "`: " + typeof n
                          ));
                }
            }
            function relocateExports(e, t, r) {
              var n = {};
              for (var o in e) {
                var s = e[o];
                "object" == typeof s && (s = s.value),
                  "number" == typeof s && (s += t),
                  (n[o] = s);
              }
              return updateGOT(n, r), n;
            }
            function resolveGlobalSymbol(e, t = !1) {
              var r;
              return (
                t && "orig$" + e in wasmImports && (e = "orig$" + e),
                isSymbolDefined(e)
                  ? (r = wasmImports[e])
                  : e.startsWith("invoke_") &&
                    (r = wasmImports[e] =
                      createInvokeFunction(e.split("_")[1])),
                { sym: r, name: e }
              );
            }
            function alignMemory(e, t) {
              return Math.ceil(e / t) * t;
            }
            function dynCallLegacy(e, t, r) {
              var n = Module["dynCall_" + e];
              return r && r.length
                ? n.apply(null, [t].concat(r))
                : n.call(null, t);
            }
            function dynCall(e, t, r) {
              return e.includes("j")
                ? dynCallLegacy(e, t, r)
                : getWasmTableEntry(t).apply(null, r);
            }
            function createInvokeFunction(e) {
              return function () {
                var t = stackSave();
                try {
                  return dynCall(
                    e,
                    arguments[0],
                    Array.prototype.slice.call(arguments, 1)
                  );
                } catch (e) {
                  if ((stackRestore(t), e !== e + 0)) throw e;
                  _setThrew(1, 0);
                }
              };
            }
            function loadWebAssemblyModule(binary, flags, handle) {
              var metadata = getDylinkMetadata(binary);
              function loadModule() {
                var firstLoad = !handle || !HEAP8[(handle + 8) >> 0];
                if (firstLoad) {
                  var memAlign = Math.pow(2, metadata.memoryAlign);
                  memAlign = Math.max(memAlign, 16);
                  var memoryBase = metadata.memorySize
                      ? alignMemory(
                          getMemory(metadata.memorySize + memAlign),
                          memAlign
                        )
                      : 0,
                    tableBase = metadata.tableSize ? wasmTable.length : 0;
                  handle &&
                    ((HEAP8[(handle + 8) >> 0] = 1),
                    (HEAPU32[(handle + 12) >> 2] = memoryBase),
                    (HEAP32[(handle + 16) >> 2] = metadata.memorySize),
                    (HEAPU32[(handle + 20) >> 2] = tableBase),
                    (HEAP32[(handle + 24) >> 2] = metadata.tableSize));
                } else
                  (memoryBase = HEAPU32[(handle + 12) >> 2]),
                    (tableBase = HEAPU32[(handle + 20) >> 2]);
                var tableGrowthNeeded =
                    tableBase + metadata.tableSize - wasmTable.length,
                  moduleExports;
                function resolveSymbol(e) {
                  var t = resolveGlobalSymbol(e).sym;
                  return t || (t = moduleExports[e]), t;
                }
                tableGrowthNeeded > 0 && wasmTable.grow(tableGrowthNeeded);
                var proxyHandler = {
                    get: function (e, t) {
                      switch (t) {
                        case "__memory_base":
                          return memoryBase;
                        case "__table_base":
                          return tableBase;
                      }
                      if (t in wasmImports && !wasmImports[t].stub)
                        return wasmImports[t];
                      var r;
                      t in e ||
                        (e[t] = function () {
                          return (
                            r || (r = resolveSymbol(t)),
                            r.apply(null, arguments)
                          );
                        });
                      return e[t];
                    },
                  },
                  proxy = new Proxy({}, proxyHandler),
                  info = {
                    "GOT.mem": new Proxy({}, GOTHandler),
                    "GOT.func": new Proxy({}, GOTHandler),
                    env: proxy,
                    wasi_snapshot_preview1: proxy,
                  };
                function postInstantiation(instance) {
                  function addEmAsm(addr, body) {
                    for (
                      var args = [], arity = 0;
                      arity < 16 && -1 != body.indexOf("$" + arity);
                      arity++
                    )
                      args.push("$" + arity);
                    args = args.join(",");
                    var func = "(" + args + " ) => { " + body + "};";
                    ASM_CONSTS[start] = eval(func);
                  }
                  if (
                    (updateTableMap(tableBase, metadata.tableSize),
                    (moduleExports = relocateExports(
                      instance.exports,
                      memoryBase
                    )),
                    flags.allowUndefined || reportUndefinedSymbols(),
                    "__start_em_asm" in moduleExports)
                  )
                    for (
                      var start = moduleExports.__start_em_asm,
                        stop = moduleExports.__stop_em_asm;
                      start < stop;

                    ) {
                      var jsString = UTF8ToString(start);
                      addEmAsm(start, jsString),
                        (start = HEAPU8.indexOf(0, start) + 1);
                    }
                  var applyRelocs = moduleExports.__wasm_apply_data_relocs;
                  applyRelocs &&
                    (runtimeInitialized
                      ? applyRelocs()
                      : __RELOC_FUNCS__.push(applyRelocs));
                  var init = moduleExports.__wasm_call_ctors;
                  return (
                    init &&
                      (runtimeInitialized ? init() : __ATINIT__.push(init)),
                    moduleExports
                  );
                }
                if (flags.loadAsync) {
                  if (binary instanceof WebAssembly.Module) {
                    var instance = new WebAssembly.Instance(binary, info);
                    return Promise.resolve(postInstantiation(instance));
                  }
                  return WebAssembly.instantiate(binary, info).then(function (
                    e
                  ) {
                    return postInstantiation(e.instance);
                  });
                }
                var module =
                    binary instanceof WebAssembly.Module
                      ? binary
                      : new WebAssembly.Module(binary),
                  instance = new WebAssembly.Instance(module, info);
                return postInstantiation(instance);
              }
              return (
                (CurrentModuleWeakSymbols = metadata.weakImports),
                flags.loadAsync
                  ? metadata.neededDynlibs
                      .reduce(function (e, t) {
                        return e.then(function () {
                          return loadDynamicLibrary(t, flags);
                        });
                      }, Promise.resolve())
                      .then(function () {
                        return loadModule();
                      })
                  : (metadata.neededDynlibs.forEach(function (e) {
                      loadDynamicLibrary(e, flags);
                    }),
                    loadModule())
              );
            }
            function loadDynamicLibrary(
              e,
              t = { global: !0, nodelete: !0 },
              r
            ) {
              var n = LDSO.loadedLibsByName[e];
              if (n)
                return (
                  t.global &&
                    !n.global &&
                    ((n.global = !0),
                    "loading" !== n.module && mergeLibSymbols(n.module, e)),
                  t.nodelete && n.refcount !== 1 / 0 && (n.refcount = 1 / 0),
                  n.refcount++,
                  r && (LDSO.loadedLibsByHandle[r] = n),
                  !t.loadAsync || Promise.resolve(!0)
                );
              function o(e) {
                if (t.fs && t.fs.findObject(e)) {
                  var r = t.fs.readFile(e, { encoding: "binary" });
                  return (
                    r instanceof Uint8Array || (r = new Uint8Array(r)),
                    t.loadAsync ? Promise.resolve(r) : r
                  );
                }
                if (((e = locateFile(e)), t.loadAsync))
                  return new Promise(function (t, r) {
                    readAsync(e, (e) => t(new Uint8Array(e)), r);
                  });
                if (!readBinary)
                  throw new Error(
                    e +
                      ": file not found, and synchronous loading of external files is not available"
                  );
                return readBinary(e);
              }
              function s() {
                if ("undefined" != typeof preloadedWasm && preloadedWasm[e]) {
                  var n = preloadedWasm[e];
                  return t.loadAsync ? Promise.resolve(n) : n;
                }
                return t.loadAsync
                  ? o(e).then(function (e) {
                      return loadWebAssemblyModule(e, t, r);
                    })
                  : loadWebAssemblyModule(o(e), t, r);
              }
              function a(t) {
                n.global && mergeLibSymbols(t, e), (n.module = t);
              }
              return (
                ((n = newDSO(e, r, "loading")).refcount = t.nodelete
                  ? 1 / 0
                  : 1),
                (n.global = t.global),
                t.loadAsync
                  ? s().then(function (e) {
                      return a(e), !0;
                    })
                  : (a(s()), !0)
              );
            }
            function reportUndefinedSymbols() {
              for (var e in GOT)
                if (0 == GOT[e].value) {
                  var t = resolveGlobalSymbol(e, !0).sym;
                  if (!t && !GOT[e].required) continue;
                  if ("function" == typeof t)
                    GOT[e].value = addFunction(t, t.sig);
                  else {
                    if ("number" != typeof t)
                      throw new Error(
                        "bad export type for `" + e + "`: " + typeof t
                      );
                    GOT[e].value = t;
                  }
                }
            }
            function preloadDylibs() {
              dynamicLibraries.length
                ? (addRunDependency("preloadDylibs"),
                  dynamicLibraries
                    .reduce(function (e, t) {
                      return e.then(function () {
                        return loadDynamicLibrary(t, {
                          loadAsync: !0,
                          global: !0,
                          nodelete: !0,
                          allowUndefined: !0,
                        });
                      });
                    }, Promise.resolve())
                    .then(function () {
                      reportUndefinedSymbols(),
                        removeRunDependency("preloadDylibs");
                    }))
                : reportUndefinedSymbols();
            }
            function setValue(e, t, r = "i8") {
              switch ((r.endsWith("*") && (r = "*"), r)) {
                case "i1":
                case "i8":
                  HEAP8[e >> 0] = t;
                  break;
                case "i16":
                  HEAP16[e >> 1] = t;
                  break;
                case "i32":
                  HEAP32[e >> 2] = t;
                  break;
                case "i64":
                  (tempI64 = [
                    t >>> 0,
                    ((tempDouble = t),
                    +Math.abs(tempDouble) >= 1
                      ? tempDouble > 0
                        ? (0 |
                            Math.min(
                              +Math.floor(tempDouble / 4294967296),
                              4294967295
                            )) >>>
                          0
                        : ~~+Math.ceil(
                            (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                          ) >>> 0
                      : 0),
                  ]),
                    (HEAP32[e >> 2] = tempI64[0]),
                    (HEAP32[(e + 4) >> 2] = tempI64[1]);
                  break;
                case "float":
                  HEAPF32[e >> 2] = t;
                  break;
                case "double":
                  HEAPF64[e >> 3] = t;
                  break;
                case "*":
                  HEAPU32[e >> 2] = t;
                  break;
                default:
                  abort("invalid type for setValue: " + r);
              }
            }
            var ___memory_base = new WebAssembly.Global(
                { value: "i32", mutable: !1 },
                1024
              ),
              ___stack_pointer = new WebAssembly.Global(
                { value: "i32", mutable: !0 },
                79328
              ),
              ___table_base = new WebAssembly.Global(
                { value: "i32", mutable: !1 },
                1
              ),
              nowIsMonotonic = !0,
              _emscripten_get_now;
            function __emscripten_get_now_is_monotonic() {
              return nowIsMonotonic;
            }
            function _abort() {
              abort("");
            }
            function _emscripten_date_now() {
              return Date.now();
            }
            function _emscripten_memcpy_big(e, t, r) {
              HEAPU8.copyWithin(e, t, t + r);
            }
            function getHeapMax() {
              return 2147483648;
            }
            function emscripten_realloc_buffer(e) {
              var t = wasmMemory.buffer;
              try {
                return (
                  wasmMemory.grow((e - t.byteLength + 65535) >>> 16),
                  updateMemoryViews(),
                  1
                );
              } catch (e) {}
            }
            function _emscripten_resize_heap(e) {
              var t = HEAPU8.length;
              e >>>= 0;
              var r = getHeapMax();
              if (e > r) return !1;
              let n = (e, t) => e + ((t - (e % t)) % t);
              for (var o = 1; o <= 4; o *= 2) {
                var s = t * (1 + 0.2 / o);
                if (
                  ((s = Math.min(s, e + 100663296)),
                  emscripten_realloc_buffer(
                    Math.min(r, n(Math.max(e, s), 65536))
                  ))
                )
                  return !0;
              }
              return !1;
            }
            (__emscripten_get_now_is_monotonic.sig = "i"),
              (Module._abort = _abort),
              (_abort.sig = "v"),
              (_emscripten_date_now.sig = "d"),
              (_emscripten_get_now = ENVIRONMENT_IS_NODE
                ? () => {
                    var e = process.hrtime();
                    return 1e3 * e[0] + e[1] / 1e6;
                  }
                : () => performance.now()),
              (_emscripten_get_now.sig = "d"),
              (_emscripten_memcpy_big.sig = "vppp"),
              (_emscripten_resize_heap.sig = "ip");
            var PATH = {
              isAbs: (e) => "/" === e.charAt(0),
              splitPath: (e) => {
                return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
                  .exec(e)
                  .slice(1);
              },
              normalizeArray: (e, t) => {
                for (var r = 0, n = e.length - 1; n >= 0; n--) {
                  var o = e[n];
                  "." === o
                    ? e.splice(n, 1)
                    : ".." === o
                    ? (e.splice(n, 1), r++)
                    : r && (e.splice(n, 1), r--);
                }
                if (t) for (; r; r--) e.unshift("..");
                return e;
              },
              normalize: (e) => {
                var t = PATH.isAbs(e),
                  r = "/" === e.substr(-1);
                return (
                  (e = PATH.normalizeArray(
                    e.split("/").filter((e) => !!e),
                    !t
                  ).join("/")) ||
                    t ||
                    (e = "."),
                  e && r && (e += "/"),
                  (t ? "/" : "") + e
                );
              },
              dirname: (e) => {
                var t = PATH.splitPath(e),
                  r = t[0],
                  n = t[1];
                return r || n
                  ? (n && (n = n.substr(0, n.length - 1)), r + n)
                  : ".";
              },
              basename: (e) => {
                if ("/" === e) return "/";
                var t = (e = (e = PATH.normalize(e)).replace(
                  /\/$/,
                  ""
                )).lastIndexOf("/");
                return -1 === t ? e : e.substr(t + 1);
              },
              join: function () {
                var e = Array.prototype.slice.call(arguments);
                return PATH.normalize(e.join("/"));
              },
              join2: (e, t) => PATH.normalize(e + "/" + t),
            };
            function getRandomDevice() {
              if (
                "object" == typeof crypto &&
                "function" == typeof crypto.getRandomValues
              ) {
                var e = new Uint8Array(1);
                return () => (crypto.getRandomValues(e), e[0]);
              }
              if (ENVIRONMENT_IS_NODE)
                try {
                  var t = require("crypto");
                  return () => t.randomBytes(1)[0];
                } catch (e) {}
              return () => abort("randomDevice");
            }
            var PATH_FS = {
              resolve: function () {
                for (
                  var e = "", t = !1, r = arguments.length - 1;
                  r >= -1 && !t;
                  r--
                ) {
                  var n = r >= 0 ? arguments[r] : FS.cwd();
                  if ("string" != typeof n)
                    throw new TypeError(
                      "Arguments to path.resolve must be strings"
                    );
                  if (!n) return "";
                  (e = n + "/" + e), (t = PATH.isAbs(n));
                }
                return (
                  (t ? "/" : "") +
                    (e = PATH.normalizeArray(
                      e.split("/").filter((e) => !!e),
                      !t
                    ).join("/")) || "."
                );
              },
              relative: (e, t) => {
                function r(e) {
                  for (var t = 0; t < e.length && "" === e[t]; t++);
                  for (var r = e.length - 1; r >= 0 && "" === e[r]; r--);
                  return t > r ? [] : e.slice(t, r - t + 1);
                }
                (e = PATH_FS.resolve(e).substr(1)),
                  (t = PATH_FS.resolve(t).substr(1));
                for (
                  var n = r(e.split("/")),
                    o = r(t.split("/")),
                    s = Math.min(n.length, o.length),
                    a = s,
                    _ = 0;
                  _ < s;
                  _++
                )
                  if (n[_] !== o[_]) {
                    a = _;
                    break;
                  }
                var i = [];
                for (_ = a; _ < n.length; _++) i.push("..");
                return (i = i.concat(o.slice(a))).join("/");
              },
            };
            function intArrayFromString(e, t, r) {
              var n = r > 0 ? r : lengthBytesUTF8(e) + 1,
                o = new Array(n),
                s = stringToUTF8Array(e, o, 0, o.length);
              return t && (o.length = s), o;
            }
            var TTY = {
              ttys: [],
              init: function () {},
              shutdown: function () {},
              register: function (e, t) {
                (TTY.ttys[e] = { input: [], output: [], ops: t }),
                  FS.registerDevice(e, TTY.stream_ops);
              },
              stream_ops: {
                open: function (e) {
                  var t = TTY.ttys[e.node.rdev];
                  if (!t) throw new FS.ErrnoError(43);
                  (e.tty = t), (e.seekable = !1);
                },
                close: function (e) {
                  e.tty.ops.fsync(e.tty);
                },
                fsync: function (e) {
                  e.tty.ops.fsync(e.tty);
                },
                read: function (e, t, r, n, o) {
                  if (!e.tty || !e.tty.ops.get_char)
                    throw new FS.ErrnoError(60);
                  for (var s = 0, a = 0; a < n; a++) {
                    var _;
                    try {
                      _ = e.tty.ops.get_char(e.tty);
                    } catch (e) {
                      throw new FS.ErrnoError(29);
                    }
                    if (void 0 === _ && 0 === s) throw new FS.ErrnoError(6);
                    if (null == _) break;
                    s++, (t[r + a] = _);
                  }
                  return s && (e.node.timestamp = Date.now()), s;
                },
                write: function (e, t, r, n, o) {
                  if (!e.tty || !e.tty.ops.put_char)
                    throw new FS.ErrnoError(60);
                  try {
                    for (var s = 0; s < n; s++)
                      e.tty.ops.put_char(e.tty, t[r + s]);
                  } catch (e) {
                    throw new FS.ErrnoError(29);
                  }
                  return n && (e.node.timestamp = Date.now()), s;
                },
              },
              default_tty_ops: {
                get_char: function (e) {
                  if (!e.input.length) {
                    var t = null;
                    if (ENVIRONMENT_IS_NODE) {
                      var r = Buffer.alloc(256),
                        n = 0;
                      try {
                        n = fs.readSync(process.stdin.fd, r, 0, 256, -1);
                      } catch (e) {
                        if (!e.toString().includes("EOF")) throw e;
                        n = 0;
                      }
                      t = n > 0 ? r.slice(0, n).toString("utf-8") : null;
                    } else
                      "undefined" != typeof window &&
                      "function" == typeof window.prompt
                        ? null !== (t = window.prompt("Input: ")) && (t += "\n")
                        : "function" == typeof readline &&
                          null !== (t = readline()) &&
                          (t += "\n");
                    if (!t) return null;
                    e.input = intArrayFromString(t, !0);
                  }
                  return e.input.shift();
                },
                put_char: function (e, t) {
                  null === t || 10 === t
                    ? (out(UTF8ArrayToString(e.output, 0)), (e.output = []))
                    : 0 != t && e.output.push(t);
                },
                fsync: function (e) {
                  e.output &&
                    e.output.length > 0 &&
                    (out(UTF8ArrayToString(e.output, 0)), (e.output = []));
                },
              },
              default_tty1_ops: {
                put_char: function (e, t) {
                  null === t || 10 === t
                    ? (err(UTF8ArrayToString(e.output, 0)), (e.output = []))
                    : 0 != t && e.output.push(t);
                },
                fsync: function (e) {
                  e.output &&
                    e.output.length > 0 &&
                    (err(UTF8ArrayToString(e.output, 0)), (e.output = []));
                },
              },
            };
            function mmapAlloc(e) {
              abort();
            }
            var MEMFS = {
              ops_table: null,
              mount: function (e) {
                return MEMFS.createNode(null, "/", 16895, 0);
              },
              createNode: function (e, t, r, n) {
                if (FS.isBlkdev(r) || FS.isFIFO(r)) throw new FS.ErrnoError(63);
                MEMFS.ops_table ||
                  (MEMFS.ops_table = {
                    dir: {
                      node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink,
                      },
                      stream: { llseek: MEMFS.stream_ops.llseek },
                    },
                    file: {
                      node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                      },
                      stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync,
                      },
                    },
                    link: {
                      node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink,
                      },
                      stream: {},
                    },
                    chrdev: {
                      node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                      },
                      stream: FS.chrdev_stream_ops,
                    },
                  });
                var o = FS.createNode(e, t, r, n);
                return (
                  FS.isDir(o.mode)
                    ? ((o.node_ops = MEMFS.ops_table.dir.node),
                      (o.stream_ops = MEMFS.ops_table.dir.stream),
                      (o.contents = {}))
                    : FS.isFile(o.mode)
                    ? ((o.node_ops = MEMFS.ops_table.file.node),
                      (o.stream_ops = MEMFS.ops_table.file.stream),
                      (o.usedBytes = 0),
                      (o.contents = null))
                    : FS.isLink(o.mode)
                    ? ((o.node_ops = MEMFS.ops_table.link.node),
                      (o.stream_ops = MEMFS.ops_table.link.stream))
                    : FS.isChrdev(o.mode) &&
                      ((o.node_ops = MEMFS.ops_table.chrdev.node),
                      (o.stream_ops = MEMFS.ops_table.chrdev.stream)),
                  (o.timestamp = Date.now()),
                  e && ((e.contents[t] = o), (e.timestamp = o.timestamp)),
                  o
                );
              },
              getFileDataAsTypedArray: function (e) {
                return e.contents
                  ? e.contents.subarray
                    ? e.contents.subarray(0, e.usedBytes)
                    : new Uint8Array(e.contents)
                  : new Uint8Array(0);
              },
              expandFileStorage: function (e, t) {
                var r = e.contents ? e.contents.length : 0;
                if (!(r >= t)) {
                  (t = Math.max(t, (r * (r < 1048576 ? 2 : 1.125)) >>> 0)),
                    0 != r && (t = Math.max(t, 256));
                  var n = e.contents;
                  (e.contents = new Uint8Array(t)),
                    e.usedBytes > 0 &&
                      e.contents.set(n.subarray(0, e.usedBytes), 0);
                }
              },
              resizeFileStorage: function (e, t) {
                if (e.usedBytes != t)
                  if (0 == t) (e.contents = null), (e.usedBytes = 0);
                  else {
                    var r = e.contents;
                    (e.contents = new Uint8Array(t)),
                      r &&
                        e.contents.set(r.subarray(0, Math.min(t, e.usedBytes))),
                      (e.usedBytes = t);
                  }
              },
              node_ops: {
                getattr: function (e) {
                  var t = {};
                  return (
                    (t.dev = FS.isChrdev(e.mode) ? e.id : 1),
                    (t.ino = e.id),
                    (t.mode = e.mode),
                    (t.nlink = 1),
                    (t.uid = 0),
                    (t.gid = 0),
                    (t.rdev = e.rdev),
                    FS.isDir(e.mode)
                      ? (t.size = 4096)
                      : FS.isFile(e.mode)
                      ? (t.size = e.usedBytes)
                      : FS.isLink(e.mode)
                      ? (t.size = e.link.length)
                      : (t.size = 0),
                    (t.atime = new Date(e.timestamp)),
                    (t.mtime = new Date(e.timestamp)),
                    (t.ctime = new Date(e.timestamp)),
                    (t.blksize = 4096),
                    (t.blocks = Math.ceil(t.size / t.blksize)),
                    t
                  );
                },
                setattr: function (e, t) {
                  void 0 !== t.mode && (e.mode = t.mode),
                    void 0 !== t.timestamp && (e.timestamp = t.timestamp),
                    void 0 !== t.size && MEMFS.resizeFileStorage(e, t.size);
                },
                lookup: function (e, t) {
                  throw FS.genericErrors[44];
                },
                mknod: function (e, t, r, n) {
                  return MEMFS.createNode(e, t, r, n);
                },
                rename: function (e, t, r) {
                  if (FS.isDir(e.mode)) {
                    var n;
                    try {
                      n = FS.lookupNode(t, r);
                    } catch (e) {}
                    if (n)
                      for (var o in n.contents) throw new FS.ErrnoError(55);
                  }
                  delete e.parent.contents[e.name],
                    (e.parent.timestamp = Date.now()),
                    (e.name = r),
                    (t.contents[r] = e),
                    (t.timestamp = e.parent.timestamp),
                    (e.parent = t);
                },
                unlink: function (e, t) {
                  delete e.contents[t], (e.timestamp = Date.now());
                },
                rmdir: function (e, t) {
                  var r = FS.lookupNode(e, t);
                  for (var n in r.contents) throw new FS.ErrnoError(55);
                  delete e.contents[t], (e.timestamp = Date.now());
                },
                readdir: function (e) {
                  var t = [".", ".."];
                  for (var r in e.contents)
                    e.contents.hasOwnProperty(r) && t.push(r);
                  return t;
                },
                symlink: function (e, t, r) {
                  var n = MEMFS.createNode(e, t, 41471, 0);
                  return (n.link = r), n;
                },
                readlink: function (e) {
                  if (!FS.isLink(e.mode)) throw new FS.ErrnoError(28);
                  return e.link;
                },
              },
              stream_ops: {
                read: function (e, t, r, n, o) {
                  var s = e.node.contents;
                  if (o >= e.node.usedBytes) return 0;
                  var a = Math.min(e.node.usedBytes - o, n);
                  if (a > 8 && s.subarray) t.set(s.subarray(o, o + a), r);
                  else for (var _ = 0; _ < a; _++) t[r + _] = s[o + _];
                  return a;
                },
                write: function (e, t, r, n, o, s) {
                  if ((t.buffer === HEAP8.buffer && (s = !1), !n)) return 0;
                  var a = e.node;
                  if (
                    ((a.timestamp = Date.now()),
                    t.subarray && (!a.contents || a.contents.subarray))
                  ) {
                    if (s)
                      return (
                        (a.contents = t.subarray(r, r + n)),
                        (a.usedBytes = n),
                        n
                      );
                    if (0 === a.usedBytes && 0 === o)
                      return (
                        (a.contents = t.slice(r, r + n)), (a.usedBytes = n), n
                      );
                    if (o + n <= a.usedBytes)
                      return a.contents.set(t.subarray(r, r + n), o), n;
                  }
                  if (
                    (MEMFS.expandFileStorage(a, o + n),
                    a.contents.subarray && t.subarray)
                  )
                    a.contents.set(t.subarray(r, r + n), o);
                  else for (var _ = 0; _ < n; _++) a.contents[o + _] = t[r + _];
                  return (a.usedBytes = Math.max(a.usedBytes, o + n)), n;
                },
                llseek: function (e, t, r) {
                  var n = t;
                  if (
                    (1 === r
                      ? (n += e.position)
                      : 2 === r &&
                        FS.isFile(e.node.mode) &&
                        (n += e.node.usedBytes),
                    n < 0)
                  )
                    throw new FS.ErrnoError(28);
                  return n;
                },
                allocate: function (e, t, r) {
                  MEMFS.expandFileStorage(e.node, t + r),
                    (e.node.usedBytes = Math.max(e.node.usedBytes, t + r));
                },
                mmap: function (e, t, r, n, o) {
                  if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(43);
                  var s,
                    a,
                    _ = e.node.contents;
                  if (2 & o || _.buffer !== HEAP8.buffer) {
                    if (
                      ((r > 0 || r + t < _.length) &&
                        (_ = _.subarray
                          ? _.subarray(r, r + t)
                          : Array.prototype.slice.call(_, r, r + t)),
                      (a = !0),
                      !(s = mmapAlloc(t)))
                    )
                      throw new FS.ErrnoError(48);
                    HEAP8.set(_, s);
                  } else (a = !1), (s = _.byteOffset);
                  return { ptr: s, allocated: a };
                },
                msync: function (e, t, r, n, o) {
                  return MEMFS.stream_ops.write(e, t, 0, n, r, !1), 0;
                },
              },
            };
            function asyncLoad(e, t, r, n) {
              var o = n ? "" : getUniqueRunDependency("al " + e);
              readAsync(
                e,
                (r) => {
                  assert(
                    r,
                    'Loading data file "' + e + '" failed (no arrayBuffer).'
                  ),
                    t(new Uint8Array(r)),
                    o && removeRunDependency(o);
                },
                (t) => {
                  if (!r) throw 'Loading data file "' + e + '" failed.';
                  r();
                }
              ),
                o && addRunDependency(o);
            }
            var FS = {
                root: null,
                mounts: [],
                devices: {},
                streams: [],
                nextInode: 1,
                nameTable: null,
                currentPath: "/",
                initialized: !1,
                ignorePermissions: !0,
                ErrnoError: null,
                genericErrors: {},
                filesystems: null,
                syncFSRequests: 0,
                lookupPath: (e, t = {}) => {
                  if (!(e = PATH_FS.resolve(e)))
                    return { path: "", node: null };
                  if (
                    (t = Object.assign(
                      { follow_mount: !0, recurse_count: 0 },
                      t
                    )).recurse_count > 8
                  )
                    throw new FS.ErrnoError(32);
                  for (
                    var r = e.split("/").filter((e) => !!e),
                      n = FS.root,
                      o = "/",
                      s = 0;
                    s < r.length;
                    s++
                  ) {
                    var a = s === r.length - 1;
                    if (a && t.parent) break;
                    if (
                      ((n = FS.lookupNode(n, r[s])),
                      (o = PATH.join2(o, r[s])),
                      FS.isMountpoint(n) &&
                        (!a || (a && t.follow_mount)) &&
                        (n = n.mounted.root),
                      !a || t.follow)
                    )
                      for (var _ = 0; FS.isLink(n.mode); ) {
                        var i = FS.readlink(o);
                        if (
                          ((o = PATH_FS.resolve(PATH.dirname(o), i)),
                          (n = FS.lookupPath(o, {
                            recurse_count: t.recurse_count + 1,
                          }).node),
                          _++ > 40)
                        )
                          throw new FS.ErrnoError(32);
                      }
                  }
                  return { path: o, node: n };
                },
                getPath: (e) => {
                  for (var t; ; ) {
                    if (FS.isRoot(e)) {
                      var r = e.mount.mountpoint;
                      return t
                        ? "/" !== r[r.length - 1]
                          ? r + "/" + t
                          : r + t
                        : r;
                    }
                    (t = t ? e.name + "/" + t : e.name), (e = e.parent);
                  }
                },
                hashName: (e, t) => {
                  for (var r = 0, n = 0; n < t.length; n++)
                    r = ((r << 5) - r + t.charCodeAt(n)) | 0;
                  return ((e + r) >>> 0) % FS.nameTable.length;
                },
                hashAddNode: (e) => {
                  var t = FS.hashName(e.parent.id, e.name);
                  (e.name_next = FS.nameTable[t]), (FS.nameTable[t] = e);
                },
                hashRemoveNode: (e) => {
                  var t = FS.hashName(e.parent.id, e.name);
                  if (FS.nameTable[t] === e) FS.nameTable[t] = e.name_next;
                  else
                    for (var r = FS.nameTable[t]; r; ) {
                      if (r.name_next === e) {
                        r.name_next = e.name_next;
                        break;
                      }
                      r = r.name_next;
                    }
                },
                lookupNode: (e, t) => {
                  var r = FS.mayLookup(e);
                  if (r) throw new FS.ErrnoError(r, e);
                  for (
                    var n = FS.hashName(e.id, t), o = FS.nameTable[n];
                    o;
                    o = o.name_next
                  ) {
                    var s = o.name;
                    if (o.parent.id === e.id && s === t) return o;
                  }
                  return FS.lookup(e, t);
                },
                createNode: (e, t, r, n) => {
                  var o = new FS.FSNode(e, t, r, n);
                  return FS.hashAddNode(o), o;
                },
                destroyNode: (e) => {
                  FS.hashRemoveNode(e);
                },
                isRoot: (e) => e === e.parent,
                isMountpoint: (e) => !!e.mounted,
                isFile: (e) => 32768 == (61440 & e),
                isDir: (e) => 16384 == (61440 & e),
                isLink: (e) => 40960 == (61440 & e),
                isChrdev: (e) => 8192 == (61440 & e),
                isBlkdev: (e) => 24576 == (61440 & e),
                isFIFO: (e) => 4096 == (61440 & e),
                isSocket: (e) => 49152 == (49152 & e),
                flagModes: {
                  r: 0,
                  "r+": 2,
                  w: 577,
                  "w+": 578,
                  a: 1089,
                  "a+": 1090,
                },
                modeStringToFlags: (e) => {
                  var t = FS.flagModes[e];
                  if (void 0 === t)
                    throw new Error("Unknown file open mode: " + e);
                  return t;
                },
                flagsToPermissionString: (e) => {
                  var t = ["r", "w", "rw"][3 & e];
                  return 512 & e && (t += "w"), t;
                },
                nodePermissions: (e, t) =>
                  FS.ignorePermissions
                    ? 0
                    : (!t.includes("r") || 292 & e.mode) &&
                      (!t.includes("w") || 146 & e.mode) &&
                      (!t.includes("x") || 73 & e.mode)
                    ? 0
                    : 2,
                mayLookup: (e) => {
                  var t = FS.nodePermissions(e, "x");
                  return t || (e.node_ops.lookup ? 0 : 2);
                },
                mayCreate: (e, t) => {
                  try {
                    FS.lookupNode(e, t);
                    return 20;
                  } catch (e) {}
                  return FS.nodePermissions(e, "wx");
                },
                mayDelete: (e, t, r) => {
                  var n;
                  try {
                    n = FS.lookupNode(e, t);
                  } catch (e) {
                    return e.errno;
                  }
                  var o = FS.nodePermissions(e, "wx");
                  if (o) return o;
                  if (r) {
                    if (!FS.isDir(n.mode)) return 54;
                    if (FS.isRoot(n) || FS.getPath(n) === FS.cwd()) return 10;
                  } else if (FS.isDir(n.mode)) return 31;
                  return 0;
                },
                mayOpen: (e, t) =>
                  e
                    ? FS.isLink(e.mode)
                      ? 32
                      : FS.isDir(e.mode) &&
                        ("r" !== FS.flagsToPermissionString(t) || 512 & t)
                      ? 31
                      : FS.nodePermissions(e, FS.flagsToPermissionString(t))
                    : 44,
                MAX_OPEN_FDS: 4096,
                nextfd: (e = 0, t = FS.MAX_OPEN_FDS) => {
                  for (var r = e; r <= t; r++) if (!FS.streams[r]) return r;
                  throw new FS.ErrnoError(33);
                },
                getStream: (e) => FS.streams[e],
                createStream: (e, t, r) => {
                  FS.FSStream ||
                    ((FS.FSStream = function () {
                      this.shared = {};
                    }),
                    (FS.FSStream.prototype = {}),
                    Object.defineProperties(FS.FSStream.prototype, {
                      object: {
                        get: function () {
                          return this.node;
                        },
                        set: function (e) {
                          this.node = e;
                        },
                      },
                      isRead: {
                        get: function () {
                          return 1 != (2097155 & this.flags);
                        },
                      },
                      isWrite: {
                        get: function () {
                          return 0 != (2097155 & this.flags);
                        },
                      },
                      isAppend: {
                        get: function () {
                          return 1024 & this.flags;
                        },
                      },
                      flags: {
                        get: function () {
                          return this.shared.flags;
                        },
                        set: function (e) {
                          this.shared.flags = e;
                        },
                      },
                      position: {
                        get: function () {
                          return this.shared.position;
                        },
                        set: function (e) {
                          this.shared.position = e;
                        },
                      },
                    })),
                    (e = Object.assign(new FS.FSStream(), e));
                  var n = FS.nextfd(t, r);
                  return (e.fd = n), (FS.streams[n] = e), e;
                },
                closeStream: (e) => {
                  FS.streams[e] = null;
                },
                chrdev_stream_ops: {
                  open: (e) => {
                    var t = FS.getDevice(e.node.rdev);
                    (e.stream_ops = t.stream_ops),
                      e.stream_ops.open && e.stream_ops.open(e);
                  },
                  llseek: () => {
                    throw new FS.ErrnoError(70);
                  },
                },
                major: (e) => e >> 8,
                minor: (e) => 255 & e,
                makedev: (e, t) => (e << 8) | t,
                registerDevice: (e, t) => {
                  FS.devices[e] = { stream_ops: t };
                },
                getDevice: (e) => FS.devices[e],
                getMounts: (e) => {
                  for (var t = [], r = [e]; r.length; ) {
                    var n = r.pop();
                    t.push(n), r.push.apply(r, n.mounts);
                  }
                  return t;
                },
                syncfs: (e, t) => {
                  "function" == typeof e && ((t = e), (e = !1)),
                    FS.syncFSRequests++,
                    FS.syncFSRequests > 1 &&
                      err(
                        "warning: " +
                          FS.syncFSRequests +
                          " FS.syncfs operations in flight at once, probably just doing extra work"
                      );
                  var r = FS.getMounts(FS.root.mount),
                    n = 0;
                  function o(e) {
                    return FS.syncFSRequests--, t(e);
                  }
                  function s(e) {
                    if (e) return s.errored ? void 0 : ((s.errored = !0), o(e));
                    ++n >= r.length && o(null);
                  }
                  r.forEach((t) => {
                    if (!t.type.syncfs) return s(null);
                    t.type.syncfs(t, e, s);
                  });
                },
                mount: (e, t, r) => {
                  var n,
                    o = "/" === r,
                    s = !r;
                  if (o && FS.root) throw new FS.ErrnoError(10);
                  if (!o && !s) {
                    var a = FS.lookupPath(r, { follow_mount: !1 });
                    if (((r = a.path), (n = a.node), FS.isMountpoint(n)))
                      throw new FS.ErrnoError(10);
                    if (!FS.isDir(n.mode)) throw new FS.ErrnoError(54);
                  }
                  var _ = { type: e, opts: t, mountpoint: r, mounts: [] },
                    i = e.mount(_);
                  return (
                    (i.mount = _),
                    (_.root = i),
                    o
                      ? (FS.root = i)
                      : n &&
                        ((n.mounted = _), n.mount && n.mount.mounts.push(_)),
                    i
                  );
                },
                unmount: (e) => {
                  var t = FS.lookupPath(e, { follow_mount: !1 });
                  if (!FS.isMountpoint(t.node)) throw new FS.ErrnoError(28);
                  var r = t.node,
                    n = r.mounted,
                    o = FS.getMounts(n);
                  Object.keys(FS.nameTable).forEach((e) => {
                    for (var t = FS.nameTable[e]; t; ) {
                      var r = t.name_next;
                      o.includes(t.mount) && FS.destroyNode(t), (t = r);
                    }
                  }),
                    (r.mounted = null);
                  var s = r.mount.mounts.indexOf(n);
                  r.mount.mounts.splice(s, 1);
                },
                lookup: (e, t) => e.node_ops.lookup(e, t),
                mknod: (e, t, r) => {
                  var n = FS.lookupPath(e, { parent: !0 }).node,
                    o = PATH.basename(e);
                  if (!o || "." === o || ".." === o)
                    throw new FS.ErrnoError(28);
                  var s = FS.mayCreate(n, o);
                  if (s) throw new FS.ErrnoError(s);
                  if (!n.node_ops.mknod) throw new FS.ErrnoError(63);
                  return n.node_ops.mknod(n, o, t, r);
                },
                create: (e, t) => (
                  (t = void 0 !== t ? t : 438),
                  (t &= 4095),
                  (t |= 32768),
                  FS.mknod(e, t, 0)
                ),
                mkdir: (e, t) => (
                  (t = void 0 !== t ? t : 511),
                  (t &= 1023),
                  (t |= 16384),
                  FS.mknod(e, t, 0)
                ),
                mkdirTree: (e, t) => {
                  for (var r = e.split("/"), n = "", o = 0; o < r.length; ++o)
                    if (r[o]) {
                      n += "/" + r[o];
                      try {
                        FS.mkdir(n, t);
                      } catch (e) {
                        if (20 != e.errno) throw e;
                      }
                    }
                },
                mkdev: (e, t, r) => (
                  void 0 === r && ((r = t), (t = 438)),
                  (t |= 8192),
                  FS.mknod(e, t, r)
                ),
                symlink: (e, t) => {
                  if (!PATH_FS.resolve(e)) throw new FS.ErrnoError(44);
                  var r = FS.lookupPath(t, { parent: !0 }).node;
                  if (!r) throw new FS.ErrnoError(44);
                  var n = PATH.basename(t),
                    o = FS.mayCreate(r, n);
                  if (o) throw new FS.ErrnoError(o);
                  if (!r.node_ops.symlink) throw new FS.ErrnoError(63);
                  return r.node_ops.symlink(r, n, e);
                },
                rename: (e, t) => {
                  var r,
                    n,
                    o = PATH.dirname(e),
                    s = PATH.dirname(t),
                    a = PATH.basename(e),
                    _ = PATH.basename(t);
                  if (
                    ((r = FS.lookupPath(e, { parent: !0 }).node),
                    (n = FS.lookupPath(t, { parent: !0 }).node),
                    !r || !n)
                  )
                    throw new FS.ErrnoError(44);
                  if (r.mount !== n.mount) throw new FS.ErrnoError(75);
                  var i,
                    l = FS.lookupNode(r, a),
                    u = PATH_FS.relative(e, s);
                  if ("." !== u.charAt(0)) throw new FS.ErrnoError(28);
                  if ("." !== (u = PATH_FS.relative(t, o)).charAt(0))
                    throw new FS.ErrnoError(55);
                  try {
                    i = FS.lookupNode(n, _);
                  } catch (e) {}
                  if (l !== i) {
                    var d = FS.isDir(l.mode),
                      c = FS.mayDelete(r, a, d);
                    if (c) throw new FS.ErrnoError(c);
                    if ((c = i ? FS.mayDelete(n, _, d) : FS.mayCreate(n, _)))
                      throw new FS.ErrnoError(c);
                    if (!r.node_ops.rename) throw new FS.ErrnoError(63);
                    if (FS.isMountpoint(l) || (i && FS.isMountpoint(i)))
                      throw new FS.ErrnoError(10);
                    if (n !== r && (c = FS.nodePermissions(r, "w")))
                      throw new FS.ErrnoError(c);
                    FS.hashRemoveNode(l);
                    try {
                      r.node_ops.rename(l, n, _);
                    } catch (e) {
                      throw e;
                    } finally {
                      FS.hashAddNode(l);
                    }
                  }
                },
                rmdir: (e) => {
                  var t = FS.lookupPath(e, { parent: !0 }).node,
                    r = PATH.basename(e),
                    n = FS.lookupNode(t, r),
                    o = FS.mayDelete(t, r, !0);
                  if (o) throw new FS.ErrnoError(o);
                  if (!t.node_ops.rmdir) throw new FS.ErrnoError(63);
                  if (FS.isMountpoint(n)) throw new FS.ErrnoError(10);
                  t.node_ops.rmdir(t, r), FS.destroyNode(n);
                },
                readdir: (e) => {
                  var t = FS.lookupPath(e, { follow: !0 }).node;
                  if (!t.node_ops.readdir) throw new FS.ErrnoError(54);
                  return t.node_ops.readdir(t);
                },
                unlink: (e) => {
                  var t = FS.lookupPath(e, { parent: !0 }).node;
                  if (!t) throw new FS.ErrnoError(44);
                  var r = PATH.basename(e),
                    n = FS.lookupNode(t, r),
                    o = FS.mayDelete(t, r, !1);
                  if (o) throw new FS.ErrnoError(o);
                  if (!t.node_ops.unlink) throw new FS.ErrnoError(63);
                  if (FS.isMountpoint(n)) throw new FS.ErrnoError(10);
                  t.node_ops.unlink(t, r), FS.destroyNode(n);
                },
                readlink: (e) => {
                  var t = FS.lookupPath(e).node;
                  if (!t) throw new FS.ErrnoError(44);
                  if (!t.node_ops.readlink) throw new FS.ErrnoError(28);
                  return PATH_FS.resolve(
                    FS.getPath(t.parent),
                    t.node_ops.readlink(t)
                  );
                },
                stat: (e, t) => {
                  var r = FS.lookupPath(e, { follow: !t }).node;
                  if (!r) throw new FS.ErrnoError(44);
                  if (!r.node_ops.getattr) throw new FS.ErrnoError(63);
                  return r.node_ops.getattr(r);
                },
                lstat: (e) => FS.stat(e, !0),
                chmod: (e, t, r) => {
                  var n;
                  "string" == typeof e
                    ? (n = FS.lookupPath(e, { follow: !r }).node)
                    : (n = e);
                  if (!n.node_ops.setattr) throw new FS.ErrnoError(63);
                  n.node_ops.setattr(n, {
                    mode: (4095 & t) | (-4096 & n.mode),
                    timestamp: Date.now(),
                  });
                },
                lchmod: (e, t) => {
                  FS.chmod(e, t, !0);
                },
                fchmod: (e, t) => {
                  var r = FS.getStream(e);
                  if (!r) throw new FS.ErrnoError(8);
                  FS.chmod(r.node, t);
                },
                chown: (e, t, r, n) => {
                  var o;
                  "string" == typeof e
                    ? (o = FS.lookupPath(e, { follow: !n }).node)
                    : (o = e);
                  if (!o.node_ops.setattr) throw new FS.ErrnoError(63);
                  o.node_ops.setattr(o, { timestamp: Date.now() });
                },
                lchown: (e, t, r) => {
                  FS.chown(e, t, r, !0);
                },
                fchown: (e, t, r) => {
                  var n = FS.getStream(e);
                  if (!n) throw new FS.ErrnoError(8);
                  FS.chown(n.node, t, r);
                },
                truncate: (e, t) => {
                  if (t < 0) throw new FS.ErrnoError(28);
                  var r;
                  "string" == typeof e
                    ? (r = FS.lookupPath(e, { follow: !0 }).node)
                    : (r = e);
                  if (!r.node_ops.setattr) throw new FS.ErrnoError(63);
                  if (FS.isDir(r.mode)) throw new FS.ErrnoError(31);
                  if (!FS.isFile(r.mode)) throw new FS.ErrnoError(28);
                  var n = FS.nodePermissions(r, "w");
                  if (n) throw new FS.ErrnoError(n);
                  r.node_ops.setattr(r, { size: t, timestamp: Date.now() });
                },
                ftruncate: (e, t) => {
                  var r = FS.getStream(e);
                  if (!r) throw new FS.ErrnoError(8);
                  if (0 == (2097155 & r.flags)) throw new FS.ErrnoError(28);
                  FS.truncate(r.node, t);
                },
                utime: (e, t, r) => {
                  var n = FS.lookupPath(e, { follow: !0 }).node;
                  n.node_ops.setattr(n, { timestamp: Math.max(t, r) });
                },
                open: (e, t, r) => {
                  if ("" === e) throw new FS.ErrnoError(44);
                  var n;
                  if (
                    ((r = void 0 === r ? 438 : r),
                    (r =
                      64 &
                      (t = "string" == typeof t ? FS.modeStringToFlags(t) : t)
                        ? (4095 & r) | 32768
                        : 0),
                    "object" == typeof e)
                  )
                    n = e;
                  else {
                    e = PATH.normalize(e);
                    try {
                      n = FS.lookupPath(e, { follow: !(131072 & t) }).node;
                    } catch (e) {}
                  }
                  var o = !1;
                  if (64 & t)
                    if (n) {
                      if (128 & t) throw new FS.ErrnoError(20);
                    } else (n = FS.mknod(e, r, 0)), (o = !0);
                  if (!n) throw new FS.ErrnoError(44);
                  if (
                    (FS.isChrdev(n.mode) && (t &= -513),
                    65536 & t && !FS.isDir(n.mode))
                  )
                    throw new FS.ErrnoError(54);
                  if (!o) {
                    var s = FS.mayOpen(n, t);
                    if (s) throw new FS.ErrnoError(s);
                  }
                  512 & t && !o && FS.truncate(n, 0), (t &= -131713);
                  var a = FS.createStream({
                    node: n,
                    path: FS.getPath(n),
                    flags: t,
                    seekable: !0,
                    position: 0,
                    stream_ops: n.stream_ops,
                    ungotten: [],
                    error: !1,
                  });
                  return (
                    a.stream_ops.open && a.stream_ops.open(a),
                    !Module.logReadFiles ||
                      1 & t ||
                      (FS.readFiles || (FS.readFiles = {}),
                      e in FS.readFiles || (FS.readFiles[e] = 1)),
                    a
                  );
                },
                close: (e) => {
                  if (FS.isClosed(e)) throw new FS.ErrnoError(8);
                  e.getdents && (e.getdents = null);
                  try {
                    e.stream_ops.close && e.stream_ops.close(e);
                  } catch (e) {
                    throw e;
                  } finally {
                    FS.closeStream(e.fd);
                  }
                  e.fd = null;
                },
                isClosed: (e) => null === e.fd,
                llseek: (e, t, r) => {
                  if (FS.isClosed(e)) throw new FS.ErrnoError(8);
                  if (!e.seekable || !e.stream_ops.llseek)
                    throw new FS.ErrnoError(70);
                  if (0 != r && 1 != r && 2 != r) throw new FS.ErrnoError(28);
                  return (
                    (e.position = e.stream_ops.llseek(e, t, r)),
                    (e.ungotten = []),
                    e.position
                  );
                },
                read: (e, t, r, n, o) => {
                  if (n < 0 || o < 0) throw new FS.ErrnoError(28);
                  if (FS.isClosed(e)) throw new FS.ErrnoError(8);
                  if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(8);
                  if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(31);
                  if (!e.stream_ops.read) throw new FS.ErrnoError(28);
                  var s = void 0 !== o;
                  if (s) {
                    if (!e.seekable) throw new FS.ErrnoError(70);
                  } else o = e.position;
                  var a = e.stream_ops.read(e, t, r, n, o);
                  return s || (e.position += a), a;
                },
                write: (e, t, r, n, o, s) => {
                  if (n < 0 || o < 0) throw new FS.ErrnoError(28);
                  if (FS.isClosed(e)) throw new FS.ErrnoError(8);
                  if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(8);
                  if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(31);
                  if (!e.stream_ops.write) throw new FS.ErrnoError(28);
                  e.seekable && 1024 & e.flags && FS.llseek(e, 0, 2);
                  var a = void 0 !== o;
                  if (a) {
                    if (!e.seekable) throw new FS.ErrnoError(70);
                  } else o = e.position;
                  var _ = e.stream_ops.write(e, t, r, n, o, s);
                  return a || (e.position += _), _;
                },
                allocate: (e, t, r) => {
                  if (FS.isClosed(e)) throw new FS.ErrnoError(8);
                  if (t < 0 || r <= 0) throw new FS.ErrnoError(28);
                  if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(8);
                  if (!FS.isFile(e.node.mode) && !FS.isDir(e.node.mode))
                    throw new FS.ErrnoError(43);
                  if (!e.stream_ops.allocate) throw new FS.ErrnoError(138);
                  e.stream_ops.allocate(e, t, r);
                },
                mmap: (e, t, r, n, o) => {
                  if (0 != (2 & n) && 0 == (2 & o) && 2 != (2097155 & e.flags))
                    throw new FS.ErrnoError(2);
                  if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(2);
                  if (!e.stream_ops.mmap) throw new FS.ErrnoError(43);
                  return e.stream_ops.mmap(e, t, r, n, o);
                },
                msync: (e, t, r, n, o) =>
                  e.stream_ops.msync ? e.stream_ops.msync(e, t, r, n, o) : 0,
                munmap: (e) => 0,
                ioctl: (e, t, r) => {
                  if (!e.stream_ops.ioctl) throw new FS.ErrnoError(59);
                  return e.stream_ops.ioctl(e, t, r);
                },
                readFile: (e, t = {}) => {
                  if (
                    ((t.flags = t.flags || 0),
                    (t.encoding = t.encoding || "binary"),
                    "utf8" !== t.encoding && "binary" !== t.encoding)
                  )
                    throw new Error(
                      'Invalid encoding type "' + t.encoding + '"'
                    );
                  var r,
                    n = FS.open(e, t.flags),
                    o = FS.stat(e).size,
                    s = new Uint8Array(o);
                  return (
                    FS.read(n, s, 0, o, 0),
                    "utf8" === t.encoding
                      ? (r = UTF8ArrayToString(s, 0))
                      : "binary" === t.encoding && (r = s),
                    FS.close(n),
                    r
                  );
                },
                writeFile: (e, t, r = {}) => {
                  r.flags = r.flags || 577;
                  var n = FS.open(e, r.flags, r.mode);
                  if ("string" == typeof t) {
                    var o = new Uint8Array(lengthBytesUTF8(t) + 1),
                      s = stringToUTF8Array(t, o, 0, o.length);
                    FS.write(n, o, 0, s, void 0, r.canOwn);
                  } else {
                    if (!ArrayBuffer.isView(t))
                      throw new Error("Unsupported data type");
                    FS.write(n, t, 0, t.byteLength, void 0, r.canOwn);
                  }
                  FS.close(n);
                },
                cwd: () => FS.currentPath,
                chdir: (e) => {
                  var t = FS.lookupPath(e, { follow: !0 });
                  if (null === t.node) throw new FS.ErrnoError(44);
                  if (!FS.isDir(t.node.mode)) throw new FS.ErrnoError(54);
                  var r = FS.nodePermissions(t.node, "x");
                  if (r) throw new FS.ErrnoError(r);
                  FS.currentPath = t.path;
                },
                createDefaultDirectories: () => {
                  FS.mkdir("/tmp"),
                    FS.mkdir("/home"),
                    FS.mkdir("/home/web_user");
                },
                createDefaultDevices: () => {
                  FS.mkdir("/dev"),
                    FS.registerDevice(FS.makedev(1, 3), {
                      read: () => 0,
                      write: (e, t, r, n, o) => n,
                    }),
                    FS.mkdev("/dev/null", FS.makedev(1, 3)),
                    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops),
                    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops),
                    FS.mkdev("/dev/tty", FS.makedev(5, 0)),
                    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                  var e = getRandomDevice();
                  FS.createDevice("/dev", "random", e),
                    FS.createDevice("/dev", "urandom", e),
                    FS.mkdir("/dev/shm"),
                    FS.mkdir("/dev/shm/tmp");
                },
                createSpecialDirectories: () => {
                  FS.mkdir("/proc");
                  var e = FS.mkdir("/proc/self");
                  FS.mkdir("/proc/self/fd"),
                    FS.mount(
                      {
                        mount: () => {
                          var t = FS.createNode(e, "fd", 16895, 73);
                          return (
                            (t.node_ops = {
                              lookup: (e, t) => {
                                var r = +t,
                                  n = FS.getStream(r);
                                if (!n) throw new FS.ErrnoError(8);
                                var o = {
                                  parent: null,
                                  mount: { mountpoint: "fake" },
                                  node_ops: { readlink: () => n.path },
                                };
                                return (o.parent = o), o;
                              },
                            }),
                            t
                          );
                        },
                      },
                      {},
                      "/proc/self/fd"
                    );
                },
                createStandardStreams: () => {
                  Module.stdin
                    ? FS.createDevice("/dev", "stdin", Module.stdin)
                    : FS.symlink("/dev/tty", "/dev/stdin"),
                    Module.stdout
                      ? FS.createDevice("/dev", "stdout", null, Module.stdout)
                      : FS.symlink("/dev/tty", "/dev/stdout"),
                    Module.stderr
                      ? FS.createDevice("/dev", "stderr", null, Module.stderr)
                      : FS.symlink("/dev/tty1", "/dev/stderr");
                  FS.open("/dev/stdin", 0),
                    FS.open("/dev/stdout", 1),
                    FS.open("/dev/stderr", 1);
                },
                ensureErrnoError: () => {
                  FS.ErrnoError ||
                    ((FS.ErrnoError = function (e, t) {
                      (this.name = "ErrnoError"),
                        (this.node = t),
                        (this.setErrno = function (e) {
                          this.errno = e;
                        }),
                        this.setErrno(e),
                        (this.message = "FS error");
                    }),
                    (FS.ErrnoError.prototype = new Error()),
                    (FS.ErrnoError.prototype.constructor = FS.ErrnoError),
                    [44].forEach((e) => {
                      (FS.genericErrors[e] = new FS.ErrnoError(e)),
                        (FS.genericErrors[e].stack =
                          "<generic error, no stack>");
                    }));
                },
                staticInit: () => {
                  FS.ensureErrnoError(),
                    (FS.nameTable = new Array(4096)),
                    FS.mount(MEMFS, {}, "/"),
                    FS.createDefaultDirectories(),
                    FS.createDefaultDevices(),
                    FS.createSpecialDirectories(),
                    (FS.filesystems = { MEMFS: MEMFS });
                },
                init: (e, t, r) => {
                  (FS.init.initialized = !0),
                    FS.ensureErrnoError(),
                    (Module.stdin = e || Module.stdin),
                    (Module.stdout = t || Module.stdout),
                    (Module.stderr = r || Module.stderr),
                    FS.createStandardStreams();
                },
                quit: () => {
                  FS.init.initialized = !1;
                  for (var e = 0; e < FS.streams.length; e++) {
                    var t = FS.streams[e];
                    t && FS.close(t);
                  }
                },
                getMode: (e, t) => {
                  var r = 0;
                  return e && (r |= 365), t && (r |= 146), r;
                },
                findObject: (e, t) => {
                  var r = FS.analyzePath(e, t);
                  return r.exists ? r.object : null;
                },
                analyzePath: (e, t) => {
                  try {
                    e = (n = FS.lookupPath(e, { follow: !t })).path;
                  } catch (e) {}
                  var r = {
                    isRoot: !1,
                    exists: !1,
                    error: 0,
                    name: null,
                    path: null,
                    object: null,
                    parentExists: !1,
                    parentPath: null,
                    parentObject: null,
                  };
                  try {
                    var n = FS.lookupPath(e, { parent: !0 });
                    (r.parentExists = !0),
                      (r.parentPath = n.path),
                      (r.parentObject = n.node),
                      (r.name = PATH.basename(e)),
                      (n = FS.lookupPath(e, { follow: !t })),
                      (r.exists = !0),
                      (r.path = n.path),
                      (r.object = n.node),
                      (r.name = n.node.name),
                      (r.isRoot = "/" === n.path);
                  } catch (e) {
                    r.error = e.errno;
                  }
                  return r;
                },
                createPath: (e, t, r, n) => {
                  e = "string" == typeof e ? e : FS.getPath(e);
                  for (var o = t.split("/").reverse(); o.length; ) {
                    var s = o.pop();
                    if (s) {
                      var a = PATH.join2(e, s);
                      try {
                        FS.mkdir(a);
                      } catch (e) {}
                      e = a;
                    }
                  }
                  return a;
                },
                createFile: (e, t, r, n, o) => {
                  var s = PATH.join2(
                      "string" == typeof e ? e : FS.getPath(e),
                      t
                    ),
                    a = FS.getMode(n, o);
                  return FS.create(s, a);
                },
                createDataFile: (e, t, r, n, o, s) => {
                  var a = t;
                  e &&
                    ((e = "string" == typeof e ? e : FS.getPath(e)),
                    (a = t ? PATH.join2(e, t) : e));
                  var _ = FS.getMode(n, o),
                    i = FS.create(a, _);
                  if (r) {
                    if ("string" == typeof r) {
                      for (
                        var l = new Array(r.length), u = 0, d = r.length;
                        u < d;
                        ++u
                      )
                        l[u] = r.charCodeAt(u);
                      r = l;
                    }
                    FS.chmod(i, 146 | _);
                    var c = FS.open(i, 577);
                    FS.write(c, r, 0, r.length, 0, s),
                      FS.close(c),
                      FS.chmod(i, _);
                  }
                  return i;
                },
                createDevice: (e, t, r, n) => {
                  var o = PATH.join2(
                      "string" == typeof e ? e : FS.getPath(e),
                      t
                    ),
                    s = FS.getMode(!!r, !!n);
                  FS.createDevice.major || (FS.createDevice.major = 64);
                  var a = FS.makedev(FS.createDevice.major++, 0);
                  return (
                    FS.registerDevice(a, {
                      open: (e) => {
                        e.seekable = !1;
                      },
                      close: (e) => {
                        n && n.buffer && n.buffer.length && n(10);
                      },
                      read: (e, t, n, o, s) => {
                        for (var a = 0, _ = 0; _ < o; _++) {
                          var i;
                          try {
                            i = r();
                          } catch (e) {
                            throw new FS.ErrnoError(29);
                          }
                          if (void 0 === i && 0 === a)
                            throw new FS.ErrnoError(6);
                          if (null == i) break;
                          a++, (t[n + _] = i);
                        }
                        return a && (e.node.timestamp = Date.now()), a;
                      },
                      write: (e, t, r, o, s) => {
                        for (var a = 0; a < o; a++)
                          try {
                            n(t[r + a]);
                          } catch (e) {
                            throw new FS.ErrnoError(29);
                          }
                        return o && (e.node.timestamp = Date.now()), a;
                      },
                    }),
                    FS.mkdev(o, s, a)
                  );
                },
                forceLoadFile: (e) => {
                  if (e.isDevice || e.isFolder || e.link || e.contents)
                    return !0;
                  if ("undefined" != typeof XMLHttpRequest)
                    throw new Error(
                      "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
                    );
                  if (!read_)
                    throw new Error(
                      "Cannot load without read() or XMLHttpRequest."
                    );
                  try {
                    (e.contents = intArrayFromString(read_(e.url), !0)),
                      (e.usedBytes = e.contents.length);
                  } catch (e) {
                    throw new FS.ErrnoError(29);
                  }
                },
                createLazyFile: (e, t, r, n, o) => {
                  function s() {
                    (this.lengthKnown = !1), (this.chunks = []);
                  }
                  if (
                    ((s.prototype.get = function (e) {
                      if (!(e > this.length - 1 || e < 0)) {
                        var t = e % this.chunkSize,
                          r = (e / this.chunkSize) | 0;
                        return this.getter(r)[t];
                      }
                    }),
                    (s.prototype.setDataGetter = function (e) {
                      this.getter = e;
                    }),
                    (s.prototype.cacheLength = function () {
                      var e = new XMLHttpRequest();
                      if (
                        (e.open("HEAD", r, !1),
                        e.send(null),
                        !(
                          (e.status >= 200 && e.status < 300) ||
                          304 === e.status
                        ))
                      )
                        throw new Error(
                          "Couldn't load " + r + ". Status: " + e.status
                        );
                      var t,
                        n = Number(e.getResponseHeader("Content-length")),
                        o =
                          (t = e.getResponseHeader("Accept-Ranges")) &&
                          "bytes" === t,
                        s =
                          (t = e.getResponseHeader("Content-Encoding")) &&
                          "gzip" === t,
                        a = 1048576;
                      o || (a = n);
                      var _ = this;
                      _.setDataGetter((e) => {
                        var t = e * a,
                          o = (e + 1) * a - 1;
                        if (
                          ((o = Math.min(o, n - 1)),
                          void 0 === _.chunks[e] &&
                            (_.chunks[e] = ((e, t) => {
                              if (e > t)
                                throw new Error(
                                  "invalid range (" +
                                    e +
                                    ", " +
                                    t +
                                    ") or no bytes requested!"
                                );
                              if (t > n - 1)
                                throw new Error(
                                  "only " +
                                    n +
                                    " bytes available! programmer error!"
                                );
                              var o = new XMLHttpRequest();
                              if (
                                (o.open("GET", r, !1),
                                n !== a &&
                                  o.setRequestHeader(
                                    "Range",
                                    "bytes=" + e + "-" + t
                                  ),
                                (o.responseType = "arraybuffer"),
                                o.overrideMimeType &&
                                  o.overrideMimeType(
                                    "text/plain; charset=x-user-defined"
                                  ),
                                o.send(null),
                                !(
                                  (o.status >= 200 && o.status < 300) ||
                                  304 === o.status
                                ))
                              )
                                throw new Error(
                                  "Couldn't load " + r + ". Status: " + o.status
                                );
                              return void 0 !== o.response
                                ? new Uint8Array(o.response || [])
                                : intArrayFromString(o.responseText || "", !0);
                            })(t, o)),
                          void 0 === _.chunks[e])
                        )
                          throw new Error("doXHR failed!");
                        return _.chunks[e];
                      }),
                        (!s && n) ||
                          ((a = n = 1),
                          (n = this.getter(0).length),
                          (a = n),
                          out(
                            "LazyFiles on gzip forces download of the whole file when length is accessed"
                          )),
                        (this._length = n),
                        (this._chunkSize = a),
                        (this.lengthKnown = !0);
                    }),
                    "undefined" != typeof XMLHttpRequest)
                  ) {
                    if (!ENVIRONMENT_IS_WORKER)
                      throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                    var a = new s();
                    Object.defineProperties(a, {
                      length: {
                        get: function () {
                          return (
                            this.lengthKnown || this.cacheLength(), this._length
                          );
                        },
                      },
                      chunkSize: {
                        get: function () {
                          return (
                            this.lengthKnown || this.cacheLength(),
                            this._chunkSize
                          );
                        },
                      },
                    });
                    var _ = { isDevice: !1, contents: a };
                  } else _ = { isDevice: !1, url: r };
                  var i = FS.createFile(e, t, _, n, o);
                  _.contents
                    ? (i.contents = _.contents)
                    : _.url && ((i.contents = null), (i.url = _.url)),
                    Object.defineProperties(i, {
                      usedBytes: {
                        get: function () {
                          return this.contents.length;
                        },
                      },
                    });
                  var l = {};
                  function u(e, t, r, n, o) {
                    var s = e.node.contents;
                    if (o >= s.length) return 0;
                    var a = Math.min(s.length - o, n);
                    if (s.slice)
                      for (var _ = 0; _ < a; _++) t[r + _] = s[o + _];
                    else for (_ = 0; _ < a; _++) t[r + _] = s.get(o + _);
                    return a;
                  }
                  return (
                    Object.keys(i.stream_ops).forEach((e) => {
                      var t = i.stream_ops[e];
                      l[e] = function () {
                        return FS.forceLoadFile(i), t.apply(null, arguments);
                      };
                    }),
                    (l.read = (e, t, r, n, o) => (
                      FS.forceLoadFile(i), u(e, t, r, n, o)
                    )),
                    (l.mmap = (e, t, r, n, o) => {
                      FS.forceLoadFile(i);
                      var s = mmapAlloc(t);
                      if (!s) throw new FS.ErrnoError(48);
                      return u(e, HEAP8, s, t, r), { ptr: s, allocated: !0 };
                    }),
                    (i.stream_ops = l),
                    i
                  );
                },
                createPreloadedFile: (e, t, r, n, o, s, a, _, i, l) => {
                  var u = t ? PATH_FS.resolve(PATH.join2(e, t)) : e,
                    d = getUniqueRunDependency("cp " + u);
                  function c(r) {
                    function c(r) {
                      l && l(),
                        _ || FS.createDataFile(e, t, r, n, o, i),
                        s && s(),
                        removeRunDependency(d);
                    }
                    Browser.handledByPreloadPlugin(r, u, c, () => {
                      a && a(), removeRunDependency(d);
                    }) || c(r);
                  }
                  addRunDependency(d),
                    "string" == typeof r ? asyncLoad(r, (e) => c(e), a) : c(r);
                },
                indexedDB: () =>
                  window.indexedDB ||
                  window.mozIndexedDB ||
                  window.webkitIndexedDB ||
                  window.msIndexedDB,
                DB_NAME: () => "EM_FS_" + window.location.pathname,
                DB_VERSION: 20,
                DB_STORE_NAME: "FILE_DATA",
                saveFilesToDB: (e, t = () => {}, r = () => {}) => {
                  var n = FS.indexedDB();
                  try {
                    var o = n.open(FS.DB_NAME(), FS.DB_VERSION);
                  } catch (e) {
                    return r(e);
                  }
                  (o.onupgradeneeded = () => {
                    out("creating db"),
                      o.result.createObjectStore(FS.DB_STORE_NAME);
                  }),
                    (o.onsuccess = () => {
                      var n = o.result.transaction(
                          [FS.DB_STORE_NAME],
                          "readwrite"
                        ),
                        s = n.objectStore(FS.DB_STORE_NAME),
                        a = 0,
                        _ = 0,
                        i = e.length;
                      function l() {
                        0 == _ ? t() : r();
                      }
                      e.forEach((e) => {
                        var t = s.put(FS.analyzePath(e).object.contents, e);
                        (t.onsuccess = () => {
                          ++a + _ == i && l();
                        }),
                          (t.onerror = () => {
                            a + ++_ == i && l();
                          });
                      }),
                        (n.onerror = r);
                    }),
                    (o.onerror = r);
                },
                loadFilesFromDB: (e, t = () => {}, r = () => {}) => {
                  var n = FS.indexedDB();
                  try {
                    var o = n.open(FS.DB_NAME(), FS.DB_VERSION);
                  } catch (e) {
                    return r(e);
                  }
                  (o.onupgradeneeded = r),
                    (o.onsuccess = () => {
                      var n = o.result;
                      try {
                        var s = n.transaction([FS.DB_STORE_NAME], "readonly");
                      } catch (e) {
                        return void r(e);
                      }
                      var a = s.objectStore(FS.DB_STORE_NAME),
                        _ = 0,
                        i = 0,
                        l = e.length;
                      function u() {
                        0 == i ? t() : r();
                      }
                      e.forEach((e) => {
                        var t = a.get(e);
                        (t.onsuccess = () => {
                          FS.analyzePath(e).exists && FS.unlink(e),
                            FS.createDataFile(
                              PATH.dirname(e),
                              PATH.basename(e),
                              t.result,
                              !0,
                              !0,
                              !0
                            ),
                            ++_ + i == l && u();
                        }),
                          (t.onerror = () => {
                            _ + ++i == l && u();
                          });
                      }),
                        (s.onerror = r);
                    }),
                    (o.onerror = r);
                },
              },
              SYSCALLS = {
                DEFAULT_POLLMASK: 5,
                calculateAt: function (e, t, r) {
                  if (PATH.isAbs(t)) return t;
                  var n;
                  -100 === e
                    ? (n = FS.cwd())
                    : (n = SYSCALLS.getStreamFromFD(e).path);
                  if (0 == t.length) {
                    if (!r) throw new FS.ErrnoError(44);
                    return n;
                  }
                  return PATH.join2(n, t);
                },
                doStat: function (e, t, r) {
                  try {
                    var n = e(t);
                  } catch (e) {
                    if (
                      e &&
                      e.node &&
                      PATH.normalize(t) !== PATH.normalize(FS.getPath(e.node))
                    )
                      return -54;
                    throw e;
                  }
                  (HEAP32[r >> 2] = n.dev),
                    (HEAP32[(r + 8) >> 2] = n.ino),
                    (HEAP32[(r + 12) >> 2] = n.mode),
                    (HEAPU32[(r + 16) >> 2] = n.nlink),
                    (HEAP32[(r + 20) >> 2] = n.uid),
                    (HEAP32[(r + 24) >> 2] = n.gid),
                    (HEAP32[(r + 28) >> 2] = n.rdev),
                    (tempI64 = [
                      n.size >>> 0,
                      ((tempDouble = n.size),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 |
                              Math.min(
                                +Math.floor(tempDouble / 4294967296),
                                4294967295
                              )) >>>
                            0
                          : ~~+Math.ceil(
                              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                            ) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(r + 40) >> 2] = tempI64[0]),
                    (HEAP32[(r + 44) >> 2] = tempI64[1]),
                    (HEAP32[(r + 48) >> 2] = 4096),
                    (HEAP32[(r + 52) >> 2] = n.blocks);
                  var o = n.atime.getTime(),
                    s = n.mtime.getTime(),
                    a = n.ctime.getTime();
                  return (
                    (tempI64 = [
                      Math.floor(o / 1e3) >>> 0,
                      ((tempDouble = Math.floor(o / 1e3)),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 |
                              Math.min(
                                +Math.floor(tempDouble / 4294967296),
                                4294967295
                              )) >>>
                            0
                          : ~~+Math.ceil(
                              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                            ) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(r + 56) >> 2] = tempI64[0]),
                    (HEAP32[(r + 60) >> 2] = tempI64[1]),
                    (HEAPU32[(r + 64) >> 2] = (o % 1e3) * 1e3),
                    (tempI64 = [
                      Math.floor(s / 1e3) >>> 0,
                      ((tempDouble = Math.floor(s / 1e3)),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 |
                              Math.min(
                                +Math.floor(tempDouble / 4294967296),
                                4294967295
                              )) >>>
                            0
                          : ~~+Math.ceil(
                              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                            ) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(r + 72) >> 2] = tempI64[0]),
                    (HEAP32[(r + 76) >> 2] = tempI64[1]),
                    (HEAPU32[(r + 80) >> 2] = (s % 1e3) * 1e3),
                    (tempI64 = [
                      Math.floor(a / 1e3) >>> 0,
                      ((tempDouble = Math.floor(a / 1e3)),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 |
                              Math.min(
                                +Math.floor(tempDouble / 4294967296),
                                4294967295
                              )) >>>
                            0
                          : ~~+Math.ceil(
                              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                            ) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(r + 88) >> 2] = tempI64[0]),
                    (HEAP32[(r + 92) >> 2] = tempI64[1]),
                    (HEAPU32[(r + 96) >> 2] = (a % 1e3) * 1e3),
                    (tempI64 = [
                      n.ino >>> 0,
                      ((tempDouble = n.ino),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 |
                              Math.min(
                                +Math.floor(tempDouble / 4294967296),
                                4294967295
                              )) >>>
                            0
                          : ~~+Math.ceil(
                              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                            ) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(r + 104) >> 2] = tempI64[0]),
                    (HEAP32[(r + 108) >> 2] = tempI64[1]),
                    0
                  );
                },
                doMsync: function (e, t, r, n, o) {
                  if (!FS.isFile(t.node.mode)) throw new FS.ErrnoError(43);
                  if (2 & n) return 0;
                  var s = HEAPU8.slice(e, e + r);
                  FS.msync(t, s, o, r, n);
                },
                varargs: void 0,
                get: function () {
                  return (
                    (SYSCALLS.varargs += 4), HEAP32[(SYSCALLS.varargs - 4) >> 2]
                  );
                },
                getStr: function (e) {
                  return UTF8ToString(e);
                },
                getStreamFromFD: function (e) {
                  var t = FS.getStream(e);
                  if (!t) throw new FS.ErrnoError(8);
                  return t;
                },
              };
            function _proc_exit(e) {
              (EXITSTATUS = e),
                keepRuntimeAlive() ||
                  (Module.onExit && Module.onExit(e), (ABORT = !0)),
                quit_(e, new ExitStatus(e));
            }
            function exitJS(e, t) {
              (EXITSTATUS = e), _proc_exit(e);
            }
            _proc_exit.sig = "vi";
            var _exit = exitJS;
            function _fd_close(e) {
              try {
                var t = SYSCALLS.getStreamFromFD(e);
                return FS.close(t), 0;
              } catch (e) {
                if (void 0 === FS || "ErrnoError" !== e.name) throw e;
                return e.errno;
              }
            }
            function convertI32PairToI53Checked(e, t) {
              return (t + 2097152) >>> 0 < 4194305 - !!e
                ? (e >>> 0) + 4294967296 * t
                : NaN;
            }
            function _fd_seek(e, t, r, n, o) {
              try {
                var s = convertI32PairToI53Checked(t, r);
                if (isNaN(s)) return 61;
                var a = SYSCALLS.getStreamFromFD(e);
                return (
                  FS.llseek(a, s, n),
                  (tempI64 = [
                    a.position >>> 0,
                    ((tempDouble = a.position),
                    +Math.abs(tempDouble) >= 1
                      ? tempDouble > 0
                        ? (0 |
                            Math.min(
                              +Math.floor(tempDouble / 4294967296),
                              4294967295
                            )) >>>
                          0
                        : ~~+Math.ceil(
                            (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                          ) >>> 0
                      : 0),
                  ]),
                  (HEAP32[o >> 2] = tempI64[0]),
                  (HEAP32[(o + 4) >> 2] = tempI64[1]),
                  a.getdents && 0 === s && 0 === n && (a.getdents = null),
                  0
                );
              } catch (e) {
                if (void 0 === FS || "ErrnoError" !== e.name) throw e;
                return e.errno;
              }
            }
            function doWritev(e, t, r, n) {
              for (var o = 0, s = 0; s < r; s++) {
                var a = HEAPU32[t >> 2],
                  _ = HEAPU32[(t + 4) >> 2];
                t += 8;
                var i = FS.write(e, HEAP8, a, _, n);
                if (i < 0) return -1;
                (o += i), void 0 !== n && (n += i);
              }
              return o;
            }
            function _fd_write(e, t, r, n) {
              try {
                var o = doWritev(SYSCALLS.getStreamFromFD(e), t, r);
                return (HEAPU32[n >> 2] = o), 0;
              } catch (e) {
                if (void 0 === FS || "ErrnoError" !== e.name) throw e;
                return e.errno;
              }
            }
            function _tree_sitter_log_callback(e, t) {
              if (currentLogCallback) {
                const r = UTF8ToString(t);
                currentLogCallback(r, 0 !== e);
              }
            }
            function _tree_sitter_parse_callback(e, t, r, n, o) {
              var s = currentParseCallback(t, { row: r, column: n });
              if ("string" == typeof s)
                setValue(o, s.length, "i32"), stringToUTF16(s, e, 10240);
              else if ("object" == typeof s && s.constructor === Array) {
                setValue(o, s.length, "i32");
                let t = Int8Array.from(s).subarray(
                  0,
                  Math.min(s.length, 10240)
                );
                HEAP8.set(t, e);
              } else setValue(o, 0, "i32");
            }
            function handleException(e) {
              if (e instanceof ExitStatus || "unwind" == e) return EXITSTATUS;
              quit_(1, e);
            }
            function allocateUTF8OnStack(e) {
              var t = lengthBytesUTF8(e) + 1,
                r = stackAlloc(t);
              return stringToUTF8Array(e, HEAP8, r, t), r;
            }
            function stringToUTF16(e, t, r) {
              if ((void 0 === r && (r = 2147483647), r < 2)) return 0;
              for (
                var n = t,
                  o = (r -= 2) < 2 * e.length ? r / 2 : e.length,
                  s = 0;
                s < o;
                ++s
              ) {
                var a = e.charCodeAt(s);
                (HEAP16[t >> 1] = a), (t += 2);
              }
              return (HEAP16[t >> 1] = 0), t - n;
            }
            function AsciiToString(e) {
              for (var t = ""; ; ) {
                var r = HEAPU8[e++ >> 0];
                if (!r) return t;
                t += String.fromCharCode(r);
              }
            }
            (_exit.sig = "vi"),
              (_fd_close.sig = "ii"),
              (_fd_seek.sig = "iijip"),
              (_fd_write.sig = "iippp");
            var FSNode = function (e, t, r, n) {
                e || (e = this),
                  (this.parent = e),
                  (this.mount = e.mount),
                  (this.mounted = null),
                  (this.id = FS.nextInode++),
                  (this.name = t),
                  (this.mode = r),
                  (this.node_ops = {}),
                  (this.stream_ops = {}),
                  (this.rdev = n);
              },
              readMode = 365,
              writeMode = 146;
            Object.defineProperties(FSNode.prototype, {
              read: {
                get: function () {
                  return (this.mode & readMode) === readMode;
                },
                set: function (e) {
                  e ? (this.mode |= readMode) : (this.mode &= ~readMode);
                },
              },
              write: {
                get: function () {
                  return (this.mode & writeMode) === writeMode;
                },
                set: function (e) {
                  e ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
                },
              },
              isFolder: {
                get: function () {
                  return FS.isDir(this.mode);
                },
              },
              isDevice: {
                get: function () {
                  return FS.isChrdev(this.mode);
                },
              },
            }),
              (FS.FSNode = FSNode),
              FS.staticInit();
            var wasmImports = {
                __heap_base: ___heap_base,
                __indirect_function_table: wasmTable,
                __memory_base: ___memory_base,
                __stack_pointer: ___stack_pointer,
                __table_base: ___table_base,
                _emscripten_get_now_is_monotonic:
                  __emscripten_get_now_is_monotonic,
                abort: _abort,
                emscripten_get_now: _emscripten_get_now,
                emscripten_memcpy_big: _emscripten_memcpy_big,
                emscripten_resize_heap: _emscripten_resize_heap,
                exit: _exit,
                fd_close: _fd_close,
                fd_seek: _fd_seek,
                fd_write: _fd_write,
                memory: wasmMemory,
                tree_sitter_log_callback: _tree_sitter_log_callback,
                tree_sitter_parse_callback: _tree_sitter_parse_callback,
              },
              asm = createWasm(),
              ___wasm_call_ctors = function () {
                return (___wasm_call_ctors =
                  Module.asm.__wasm_call_ctors).apply(null, arguments);
              },
              ___wasm_apply_data_relocs = (Module.___wasm_apply_data_relocs =
                function () {
                  return (___wasm_apply_data_relocs =
                    Module.___wasm_apply_data_relocs =
                      Module.asm.__wasm_apply_data_relocs).apply(
                    null,
                    arguments
                  );
                }),
              _malloc = (Module._malloc = function () {
                return (_malloc = Module._malloc = Module.asm.malloc).apply(
                  null,
                  arguments
                );
              }),
              _calloc = (Module._calloc = function () {
                return (_calloc = Module._calloc = Module.asm.calloc).apply(
                  null,
                  arguments
                );
              }),
              _realloc = (Module._realloc = function () {
                return (_realloc = Module._realloc = Module.asm.realloc).apply(
                  null,
                  arguments
                );
              }),
              _free = (Module._free = function () {
                return (_free = Module._free = Module.asm.free).apply(
                  null,
                  arguments
                );
              }),
              _ts_language_symbol_count = (Module._ts_language_symbol_count =
                function () {
                  return (_ts_language_symbol_count =
                    Module._ts_language_symbol_count =
                      Module.asm.ts_language_symbol_count).apply(
                    null,
                    arguments
                  );
                }),
              _ts_language_version = (Module._ts_language_version =
                function () {
                  return (_ts_language_version = Module._ts_language_version =
                    Module.asm.ts_language_version).apply(null, arguments);
                }),
              _ts_language_field_count = (Module._ts_language_field_count =
                function () {
                  return (_ts_language_field_count =
                    Module._ts_language_field_count =
                      Module.asm.ts_language_field_count).apply(
                    null,
                    arguments
                  );
                }),
              _ts_language_symbol_name = (Module._ts_language_symbol_name =
                function () {
                  return (_ts_language_symbol_name =
                    Module._ts_language_symbol_name =
                      Module.asm.ts_language_symbol_name).apply(
                    null,
                    arguments
                  );
                }),
              _ts_language_symbol_for_name =
                (Module._ts_language_symbol_for_name = function () {
                  return (_ts_language_symbol_for_name =
                    Module._ts_language_symbol_for_name =
                      Module.asm.ts_language_symbol_for_name).apply(
                    null,
                    arguments
                  );
                }),
              _ts_language_symbol_type = (Module._ts_language_symbol_type =
                function () {
                  return (_ts_language_symbol_type =
                    Module._ts_language_symbol_type =
                      Module.asm.ts_language_symbol_type).apply(
                    null,
                    arguments
                  );
                }),
              _ts_language_field_name_for_id =
                (Module._ts_language_field_name_for_id = function () {
                  return (_ts_language_field_name_for_id =
                    Module._ts_language_field_name_for_id =
                      Module.asm.ts_language_field_name_for_id).apply(
                    null,
                    arguments
                  );
                }),
              _memset = (Module._memset = function () {
                return (_memset = Module._memset = Module.asm.memset).apply(
                  null,
                  arguments
                );
              }),
              _memcpy = (Module._memcpy = function () {
                return (_memcpy = Module._memcpy = Module.asm.memcpy).apply(
                  null,
                  arguments
                );
              }),
              _ts_parser_delete = (Module._ts_parser_delete = function () {
                return (_ts_parser_delete = Module._ts_parser_delete =
                  Module.asm.ts_parser_delete).apply(null, arguments);
              }),
              _ts_parser_reset = (Module._ts_parser_reset = function () {
                return (_ts_parser_reset = Module._ts_parser_reset =
                  Module.asm.ts_parser_reset).apply(null, arguments);
              }),
              _ts_parser_set_language = (Module._ts_parser_set_language =
                function () {
                  return (_ts_parser_set_language =
                    Module._ts_parser_set_language =
                      Module.asm.ts_parser_set_language).apply(null, arguments);
                }),
              _ts_parser_timeout_micros = (Module._ts_parser_timeout_micros =
                function () {
                  return (_ts_parser_timeout_micros =
                    Module._ts_parser_timeout_micros =
                      Module.asm.ts_parser_timeout_micros).apply(
                    null,
                    arguments
                  );
                }),
              _ts_parser_set_timeout_micros =
                (Module._ts_parser_set_timeout_micros = function () {
                  return (_ts_parser_set_timeout_micros =
                    Module._ts_parser_set_timeout_micros =
                      Module.asm.ts_parser_set_timeout_micros).apply(
                    null,
                    arguments
                  );
                }),
              _memmove = (Module._memmove = function () {
                return (_memmove = Module._memmove = Module.asm.memmove).apply(
                  null,
                  arguments
                );
              }),
              _memcmp = (Module._memcmp = function () {
                return (_memcmp = Module._memcmp = Module.asm.memcmp).apply(
                  null,
                  arguments
                );
              }),
              _ts_query_new = (Module._ts_query_new = function () {
                return (_ts_query_new = Module._ts_query_new =
                  Module.asm.ts_query_new).apply(null, arguments);
              }),
              _ts_query_delete = (Module._ts_query_delete = function () {
                return (_ts_query_delete = Module._ts_query_delete =
                  Module.asm.ts_query_delete).apply(null, arguments);
              }),
              _iswspace = (Module._iswspace = function () {
                return (_iswspace = Module._iswspace =
                  Module.asm.iswspace).apply(null, arguments);
              }),
              _iswalnum = (Module._iswalnum = function () {
                return (_iswalnum = Module._iswalnum =
                  Module.asm.iswalnum).apply(null, arguments);
              }),
              _ts_query_pattern_count = (Module._ts_query_pattern_count =
                function () {
                  return (_ts_query_pattern_count =
                    Module._ts_query_pattern_count =
                      Module.asm.ts_query_pattern_count).apply(null, arguments);
                }),
              _ts_query_capture_count = (Module._ts_query_capture_count =
                function () {
                  return (_ts_query_capture_count =
                    Module._ts_query_capture_count =
                      Module.asm.ts_query_capture_count).apply(null, arguments);
                }),
              _ts_query_string_count = (Module._ts_query_string_count =
                function () {
                  return (_ts_query_string_count =
                    Module._ts_query_string_count =
                      Module.asm.ts_query_string_count).apply(null, arguments);
                }),
              _ts_query_capture_name_for_id =
                (Module._ts_query_capture_name_for_id = function () {
                  return (_ts_query_capture_name_for_id =
                    Module._ts_query_capture_name_for_id =
                      Module.asm.ts_query_capture_name_for_id).apply(
                    null,
                    arguments
                  );
                }),
              _ts_query_string_value_for_id =
                (Module._ts_query_string_value_for_id = function () {
                  return (_ts_query_string_value_for_id =
                    Module._ts_query_string_value_for_id =
                      Module.asm.ts_query_string_value_for_id).apply(
                    null,
                    arguments
                  );
                }),
              _ts_query_predicates_for_pattern =
                (Module._ts_query_predicates_for_pattern = function () {
                  return (_ts_query_predicates_for_pattern =
                    Module._ts_query_predicates_for_pattern =
                      Module.asm.ts_query_predicates_for_pattern).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_copy = (Module._ts_tree_copy = function () {
                return (_ts_tree_copy = Module._ts_tree_copy =
                  Module.asm.ts_tree_copy).apply(null, arguments);
              }),
              _ts_tree_delete = (Module._ts_tree_delete = function () {
                return (_ts_tree_delete = Module._ts_tree_delete =
                  Module.asm.ts_tree_delete).apply(null, arguments);
              }),
              _ts_init = (Module._ts_init = function () {
                return (_ts_init = Module._ts_init = Module.asm.ts_init).apply(
                  null,
                  arguments
                );
              }),
              _ts_parser_new_wasm = (Module._ts_parser_new_wasm = function () {
                return (_ts_parser_new_wasm = Module._ts_parser_new_wasm =
                  Module.asm.ts_parser_new_wasm).apply(null, arguments);
              }),
              _ts_parser_enable_logger_wasm =
                (Module._ts_parser_enable_logger_wasm = function () {
                  return (_ts_parser_enable_logger_wasm =
                    Module._ts_parser_enable_logger_wasm =
                      Module.asm.ts_parser_enable_logger_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_parser_parse_wasm = (Module._ts_parser_parse_wasm =
                function () {
                  return (_ts_parser_parse_wasm = Module._ts_parser_parse_wasm =
                    Module.asm.ts_parser_parse_wasm).apply(null, arguments);
                }),
              _ts_language_type_is_named_wasm =
                (Module._ts_language_type_is_named_wasm = function () {
                  return (_ts_language_type_is_named_wasm =
                    Module._ts_language_type_is_named_wasm =
                      Module.asm.ts_language_type_is_named_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_language_type_is_visible_wasm =
                (Module._ts_language_type_is_visible_wasm = function () {
                  return (_ts_language_type_is_visible_wasm =
                    Module._ts_language_type_is_visible_wasm =
                      Module.asm.ts_language_type_is_visible_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_root_node_wasm = (Module._ts_tree_root_node_wasm =
                function () {
                  return (_ts_tree_root_node_wasm =
                    Module._ts_tree_root_node_wasm =
                      Module.asm.ts_tree_root_node_wasm).apply(null, arguments);
                }),
              _ts_tree_edit_wasm = (Module._ts_tree_edit_wasm = function () {
                return (_ts_tree_edit_wasm = Module._ts_tree_edit_wasm =
                  Module.asm.ts_tree_edit_wasm).apply(null, arguments);
              }),
              _ts_tree_get_changed_ranges_wasm =
                (Module._ts_tree_get_changed_ranges_wasm = function () {
                  return (_ts_tree_get_changed_ranges_wasm =
                    Module._ts_tree_get_changed_ranges_wasm =
                      Module.asm.ts_tree_get_changed_ranges_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_new_wasm = (Module._ts_tree_cursor_new_wasm =
                function () {
                  return (_ts_tree_cursor_new_wasm =
                    Module._ts_tree_cursor_new_wasm =
                      Module.asm.ts_tree_cursor_new_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_delete_wasm =
                (Module._ts_tree_cursor_delete_wasm = function () {
                  return (_ts_tree_cursor_delete_wasm =
                    Module._ts_tree_cursor_delete_wasm =
                      Module.asm.ts_tree_cursor_delete_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_reset_wasm = (Module._ts_tree_cursor_reset_wasm =
                function () {
                  return (_ts_tree_cursor_reset_wasm =
                    Module._ts_tree_cursor_reset_wasm =
                      Module.asm.ts_tree_cursor_reset_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_goto_first_child_wasm =
                (Module._ts_tree_cursor_goto_first_child_wasm = function () {
                  return (_ts_tree_cursor_goto_first_child_wasm =
                    Module._ts_tree_cursor_goto_first_child_wasm =
                      Module.asm.ts_tree_cursor_goto_first_child_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_goto_next_sibling_wasm =
                (Module._ts_tree_cursor_goto_next_sibling_wasm = function () {
                  return (_ts_tree_cursor_goto_next_sibling_wasm =
                    Module._ts_tree_cursor_goto_next_sibling_wasm =
                      Module.asm.ts_tree_cursor_goto_next_sibling_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_goto_parent_wasm =
                (Module._ts_tree_cursor_goto_parent_wasm = function () {
                  return (_ts_tree_cursor_goto_parent_wasm =
                    Module._ts_tree_cursor_goto_parent_wasm =
                      Module.asm.ts_tree_cursor_goto_parent_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_current_node_type_id_wasm =
                (Module._ts_tree_cursor_current_node_type_id_wasm =
                  function () {
                    return (_ts_tree_cursor_current_node_type_id_wasm =
                      Module._ts_tree_cursor_current_node_type_id_wasm =
                        Module.asm.ts_tree_cursor_current_node_type_id_wasm).apply(
                      null,
                      arguments
                    );
                  }),
              _ts_tree_cursor_current_node_is_named_wasm =
                (Module._ts_tree_cursor_current_node_is_named_wasm =
                  function () {
                    return (_ts_tree_cursor_current_node_is_named_wasm =
                      Module._ts_tree_cursor_current_node_is_named_wasm =
                        Module.asm.ts_tree_cursor_current_node_is_named_wasm).apply(
                      null,
                      arguments
                    );
                  }),
              _ts_tree_cursor_current_node_is_missing_wasm =
                (Module._ts_tree_cursor_current_node_is_missing_wasm =
                  function () {
                    return (_ts_tree_cursor_current_node_is_missing_wasm =
                      Module._ts_tree_cursor_current_node_is_missing_wasm =
                        Module.asm.ts_tree_cursor_current_node_is_missing_wasm).apply(
                      null,
                      arguments
                    );
                  }),
              _ts_tree_cursor_current_node_id_wasm =
                (Module._ts_tree_cursor_current_node_id_wasm = function () {
                  return (_ts_tree_cursor_current_node_id_wasm =
                    Module._ts_tree_cursor_current_node_id_wasm =
                      Module.asm.ts_tree_cursor_current_node_id_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_start_position_wasm =
                (Module._ts_tree_cursor_start_position_wasm = function () {
                  return (_ts_tree_cursor_start_position_wasm =
                    Module._ts_tree_cursor_start_position_wasm =
                      Module.asm.ts_tree_cursor_start_position_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_end_position_wasm =
                (Module._ts_tree_cursor_end_position_wasm = function () {
                  return (_ts_tree_cursor_end_position_wasm =
                    Module._ts_tree_cursor_end_position_wasm =
                      Module.asm.ts_tree_cursor_end_position_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_start_index_wasm =
                (Module._ts_tree_cursor_start_index_wasm = function () {
                  return (_ts_tree_cursor_start_index_wasm =
                    Module._ts_tree_cursor_start_index_wasm =
                      Module.asm.ts_tree_cursor_start_index_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_end_index_wasm =
                (Module._ts_tree_cursor_end_index_wasm = function () {
                  return (_ts_tree_cursor_end_index_wasm =
                    Module._ts_tree_cursor_end_index_wasm =
                      Module.asm.ts_tree_cursor_end_index_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_current_field_id_wasm =
                (Module._ts_tree_cursor_current_field_id_wasm = function () {
                  return (_ts_tree_cursor_current_field_id_wasm =
                    Module._ts_tree_cursor_current_field_id_wasm =
                      Module.asm.ts_tree_cursor_current_field_id_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_tree_cursor_current_node_wasm =
                (Module._ts_tree_cursor_current_node_wasm = function () {
                  return (_ts_tree_cursor_current_node_wasm =
                    Module._ts_tree_cursor_current_node_wasm =
                      Module.asm.ts_tree_cursor_current_node_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_symbol_wasm = (Module._ts_node_symbol_wasm =
                function () {
                  return (_ts_node_symbol_wasm = Module._ts_node_symbol_wasm =
                    Module.asm.ts_node_symbol_wasm).apply(null, arguments);
                }),
              _ts_node_child_count_wasm = (Module._ts_node_child_count_wasm =
                function () {
                  return (_ts_node_child_count_wasm =
                    Module._ts_node_child_count_wasm =
                      Module.asm.ts_node_child_count_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_named_child_count_wasm =
                (Module._ts_node_named_child_count_wasm = function () {
                  return (_ts_node_named_child_count_wasm =
                    Module._ts_node_named_child_count_wasm =
                      Module.asm.ts_node_named_child_count_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_child_wasm = (Module._ts_node_child_wasm = function () {
                return (_ts_node_child_wasm = Module._ts_node_child_wasm =
                  Module.asm.ts_node_child_wasm).apply(null, arguments);
              }),
              _ts_node_named_child_wasm = (Module._ts_node_named_child_wasm =
                function () {
                  return (_ts_node_named_child_wasm =
                    Module._ts_node_named_child_wasm =
                      Module.asm.ts_node_named_child_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_child_by_field_id_wasm =
                (Module._ts_node_child_by_field_id_wasm = function () {
                  return (_ts_node_child_by_field_id_wasm =
                    Module._ts_node_child_by_field_id_wasm =
                      Module.asm.ts_node_child_by_field_id_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_next_sibling_wasm = (Module._ts_node_next_sibling_wasm =
                function () {
                  return (_ts_node_next_sibling_wasm =
                    Module._ts_node_next_sibling_wasm =
                      Module.asm.ts_node_next_sibling_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_prev_sibling_wasm = (Module._ts_node_prev_sibling_wasm =
                function () {
                  return (_ts_node_prev_sibling_wasm =
                    Module._ts_node_prev_sibling_wasm =
                      Module.asm.ts_node_prev_sibling_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_next_named_sibling_wasm =
                (Module._ts_node_next_named_sibling_wasm = function () {
                  return (_ts_node_next_named_sibling_wasm =
                    Module._ts_node_next_named_sibling_wasm =
                      Module.asm.ts_node_next_named_sibling_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_prev_named_sibling_wasm =
                (Module._ts_node_prev_named_sibling_wasm = function () {
                  return (_ts_node_prev_named_sibling_wasm =
                    Module._ts_node_prev_named_sibling_wasm =
                      Module.asm.ts_node_prev_named_sibling_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_parent_wasm = (Module._ts_node_parent_wasm =
                function () {
                  return (_ts_node_parent_wasm = Module._ts_node_parent_wasm =
                    Module.asm.ts_node_parent_wasm).apply(null, arguments);
                }),
              _ts_node_descendant_for_index_wasm =
                (Module._ts_node_descendant_for_index_wasm = function () {
                  return (_ts_node_descendant_for_index_wasm =
                    Module._ts_node_descendant_for_index_wasm =
                      Module.asm.ts_node_descendant_for_index_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_named_descendant_for_index_wasm =
                (Module._ts_node_named_descendant_for_index_wasm = function () {
                  return (_ts_node_named_descendant_for_index_wasm =
                    Module._ts_node_named_descendant_for_index_wasm =
                      Module.asm.ts_node_named_descendant_for_index_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_descendant_for_position_wasm =
                (Module._ts_node_descendant_for_position_wasm = function () {
                  return (_ts_node_descendant_for_position_wasm =
                    Module._ts_node_descendant_for_position_wasm =
                      Module.asm.ts_node_descendant_for_position_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_named_descendant_for_position_wasm =
                (Module._ts_node_named_descendant_for_position_wasm =
                  function () {
                    return (_ts_node_named_descendant_for_position_wasm =
                      Module._ts_node_named_descendant_for_position_wasm =
                        Module.asm.ts_node_named_descendant_for_position_wasm).apply(
                      null,
                      arguments
                    );
                  }),
              _ts_node_start_point_wasm = (Module._ts_node_start_point_wasm =
                function () {
                  return (_ts_node_start_point_wasm =
                    Module._ts_node_start_point_wasm =
                      Module.asm.ts_node_start_point_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_end_point_wasm = (Module._ts_node_end_point_wasm =
                function () {
                  return (_ts_node_end_point_wasm =
                    Module._ts_node_end_point_wasm =
                      Module.asm.ts_node_end_point_wasm).apply(null, arguments);
                }),
              _ts_node_start_index_wasm = (Module._ts_node_start_index_wasm =
                function () {
                  return (_ts_node_start_index_wasm =
                    Module._ts_node_start_index_wasm =
                      Module.asm.ts_node_start_index_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_end_index_wasm = (Module._ts_node_end_index_wasm =
                function () {
                  return (_ts_node_end_index_wasm =
                    Module._ts_node_end_index_wasm =
                      Module.asm.ts_node_end_index_wasm).apply(null, arguments);
                }),
              _ts_node_to_string_wasm = (Module._ts_node_to_string_wasm =
                function () {
                  return (_ts_node_to_string_wasm =
                    Module._ts_node_to_string_wasm =
                      Module.asm.ts_node_to_string_wasm).apply(null, arguments);
                }),
              _ts_node_children_wasm = (Module._ts_node_children_wasm =
                function () {
                  return (_ts_node_children_wasm =
                    Module._ts_node_children_wasm =
                      Module.asm.ts_node_children_wasm).apply(null, arguments);
                }),
              _ts_node_named_children_wasm =
                (Module._ts_node_named_children_wasm = function () {
                  return (_ts_node_named_children_wasm =
                    Module._ts_node_named_children_wasm =
                      Module.asm.ts_node_named_children_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_descendants_of_type_wasm =
                (Module._ts_node_descendants_of_type_wasm = function () {
                  return (_ts_node_descendants_of_type_wasm =
                    Module._ts_node_descendants_of_type_wasm =
                      Module.asm.ts_node_descendants_of_type_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_is_named_wasm = (Module._ts_node_is_named_wasm =
                function () {
                  return (_ts_node_is_named_wasm =
                    Module._ts_node_is_named_wasm =
                      Module.asm.ts_node_is_named_wasm).apply(null, arguments);
                }),
              _ts_node_has_changes_wasm = (Module._ts_node_has_changes_wasm =
                function () {
                  return (_ts_node_has_changes_wasm =
                    Module._ts_node_has_changes_wasm =
                      Module.asm.ts_node_has_changes_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_node_has_error_wasm = (Module._ts_node_has_error_wasm =
                function () {
                  return (_ts_node_has_error_wasm =
                    Module._ts_node_has_error_wasm =
                      Module.asm.ts_node_has_error_wasm).apply(null, arguments);
                }),
              _ts_node_is_missing_wasm = (Module._ts_node_is_missing_wasm =
                function () {
                  return (_ts_node_is_missing_wasm =
                    Module._ts_node_is_missing_wasm =
                      Module.asm.ts_node_is_missing_wasm).apply(
                    null,
                    arguments
                  );
                }),
              _ts_query_matches_wasm = (Module._ts_query_matches_wasm =
                function () {
                  return (_ts_query_matches_wasm =
                    Module._ts_query_matches_wasm =
                      Module.asm.ts_query_matches_wasm).apply(null, arguments);
                }),
              _ts_query_captures_wasm = (Module._ts_query_captures_wasm =
                function () {
                  return (_ts_query_captures_wasm =
                    Module._ts_query_captures_wasm =
                      Module.asm.ts_query_captures_wasm).apply(null, arguments);
                }),
              ___cxa_atexit = (Module.___cxa_atexit = function () {
                return (___cxa_atexit = Module.___cxa_atexit =
                  Module.asm.__cxa_atexit).apply(null, arguments);
              }),
              ___errno_location = function () {
                return (___errno_location = Module.asm.__errno_location).apply(
                  null,
                  arguments
                );
              },
              _iswdigit = (Module._iswdigit = function () {
                return (_iswdigit = Module._iswdigit =
                  Module.asm.iswdigit).apply(null, arguments);
              }),
              _iswalpha = (Module._iswalpha = function () {
                return (_iswalpha = Module._iswalpha =
                  Module.asm.iswalpha).apply(null, arguments);
              }),
              _iswlower = (Module._iswlower = function () {
                return (_iswlower = Module._iswlower =
                  Module.asm.iswlower).apply(null, arguments);
              }),
              _memchr = (Module._memchr = function () {
                return (_memchr = Module._memchr = Module.asm.memchr).apply(
                  null,
                  arguments
                );
              }),
              _iprintf = (Module._iprintf = function () {
                return (_iprintf = Module._iprintf = Module.asm.iprintf).apply(
                  null,
                  arguments
                );
              }),
              _puts = (Module._puts = function () {
                return (_puts = Module._puts = Module.asm.puts).apply(
                  null,
                  arguments
                );
              }),
              _strlen = (Module._strlen = function () {
                return (_strlen = Module._strlen = Module.asm.strlen).apply(
                  null,
                  arguments
                );
              }),
              _strcmp = (Module._strcmp = function () {
                return (_strcmp = Module._strcmp = Module.asm.strcmp).apply(
                  null,
                  arguments
                );
              }),
              _strncpy = (Module._strncpy = function () {
                return (_strncpy = Module._strncpy = Module.asm.strncpy).apply(
                  null,
                  arguments
                );
              }),
              _towupper = (Module._towupper = function () {
                return (_towupper = Module._towupper =
                  Module.asm.towupper).apply(null, arguments);
              }),
              _setThrew = function () {
                return (_setThrew = Module.asm.setThrew).apply(null, arguments);
              },
              stackSave = function () {
                return (stackSave = Module.asm.stackSave).apply(
                  null,
                  arguments
                );
              },
              stackRestore = function () {
                return (stackRestore = Module.asm.stackRestore).apply(
                  null,
                  arguments
                );
              },
              stackAlloc = function () {
                return (stackAlloc = Module.asm.stackAlloc).apply(
                  null,
                  arguments
                );
              },
              __Znwm = (Module.__Znwm = function () {
                return (__Znwm = Module.__Znwm = Module.asm._Znwm).apply(
                  null,
                  arguments
                );
              }),
              __ZdlPv = (Module.__ZdlPv = function () {
                return (__ZdlPv = Module.__ZdlPv = Module.asm._ZdlPv).apply(
                  null,
                  arguments
                );
              }),
              __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev =
                (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev =
                  function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                  function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm =
                (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm =
                  function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm =
                (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm =
                  function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm =
                (Module.__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm =
                  function () {
                    return (__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm =
                      Module.__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm =
                        Module.asm._ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc =
                (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc =
                  function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev =
                (Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev =
                  function () {
                    return (__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev =
                      Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev =
                        Module.asm._ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw =
                (Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw =
                  function () {
                    return (__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw =
                      Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw =
                        Module.asm._ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw).apply(
                      null,
                      arguments
                    );
                  }),
              __ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw =
                (Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw =
                  function () {
                    return (__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw =
                      Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw =
                        Module.asm._ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw).apply(
                      null,
                      arguments
                    );
                  }),
              dynCall_jiji = (Module.dynCall_jiji = function () {
                return (dynCall_jiji = Module.dynCall_jiji =
                  Module.asm.dynCall_jiji).apply(null, arguments);
              }),
              _orig$ts_parser_timeout_micros =
                (Module._orig$ts_parser_timeout_micros = function () {
                  return (_orig$ts_parser_timeout_micros =
                    Module._orig$ts_parser_timeout_micros =
                      Module.asm.orig$ts_parser_timeout_micros).apply(
                    null,
                    arguments
                  );
                }),
              _orig$ts_parser_set_timeout_micros =
                (Module._orig$ts_parser_set_timeout_micros = function () {
                  return (_orig$ts_parser_set_timeout_micros =
                    Module._orig$ts_parser_set_timeout_micros =
                      Module.asm.orig$ts_parser_set_timeout_micros).apply(
                    null,
                    arguments
                  );
                }),
              calledRun;
            function callMain(e = []) {
              var t = resolveGlobalSymbol("main").sym;
              if (t) {
                e.unshift(thisProgram);
                var r = e.length,
                  n = stackAlloc(4 * (r + 1)),
                  o = n >> 2;
                e.forEach((e) => {
                  HEAP32[o++] = allocateUTF8OnStack(e);
                }),
                  (HEAP32[o] = 0);
                try {
                  var s = t(r, n);
                  return exitJS(s, !0), s;
                } catch (e) {
                  return handleException(e);
                }
              }
            }
            (Module.AsciiToString = AsciiToString),
              (Module.stringToUTF16 = stringToUTF16),
              (dependenciesFulfilled = function e() {
                calledRun || run(), calledRun || (dependenciesFulfilled = e);
              });
            var dylibsLoaded = !1;
            function run(e = arguments_) {
              function t() {
                calledRun ||
                  ((calledRun = !0),
                  (Module.calledRun = !0),
                  ABORT ||
                    (initRuntime(),
                    preMain(),
                    Module.onRuntimeInitialized &&
                      Module.onRuntimeInitialized(),
                    shouldRunNow && callMain(e),
                    postRun()));
              }
              runDependencies > 0 ||
                (!dylibsLoaded &&
                  (preloadDylibs(),
                  (dylibsLoaded = !0),
                  runDependencies > 0)) ||
                (preRun(),
                runDependencies > 0 ||
                  (Module.setStatus
                    ? (Module.setStatus("Running..."),
                      setTimeout(function () {
                        setTimeout(function () {
                          Module.setStatus("");
                        }, 1),
                          t();
                      }, 1))
                    : t()));
            }
            if ((LDSO.init(), Module.preInit))
              for (
                "function" == typeof Module.preInit &&
                (Module.preInit = [Module.preInit]);
                Module.preInit.length > 0;

              )
                Module.preInit.pop()();
            var shouldRunNow = !0;
            Module.noInitialRun && (shouldRunNow = !1), run();
            const C = Module,
              INTERNAL = {},
              SIZE_OF_INT = 4,
              SIZE_OF_NODE = 5 * SIZE_OF_INT,
              SIZE_OF_POINT = 2 * SIZE_OF_INT,
              SIZE_OF_RANGE = 2 * SIZE_OF_INT + 2 * SIZE_OF_POINT,
              ZERO_POINT = { row: 0, column: 0 },
              QUERY_WORD_REGEX = /[\w-.]*/g,
              PREDICATE_STEP_TYPE_CAPTURE = 1,
              PREDICATE_STEP_TYPE_STRING = 2,
              LANGUAGE_FUNCTION_REGEX = /^_?tree_sitter_\w+/;
            var VERSION,
              MIN_COMPATIBLE_VERSION,
              TRANSFER_BUFFER,
              currentParseCallback,
              currentLogCallback;
            function arrToJSStr(e) {
              for (var t = new Array(e.length), r = 0, n = 0; r < e.length; ) {
                var o = e[r];
                if (o < 128) (t[n] = String.fromCharCode(o)), (r += 1);
                else {
                  for (var s = []; ; ) {
                    var a = o.toString(16);
                    if (
                      (null != a && 1 == a.length ? s.push("%0") : s.push("%"),
                      s.push(a),
                      (r += 1),
                      e.length <= r || e[r] < 128)
                    )
                      break;
                    o = e[r];
                  }
                  try {
                    t[n] = decodeURIComponent(s.join(""));
                  } catch (e) {
                    t[n] = s.join("");
                  }
                }
                n += 1;
              }
              if (t.length < n) for (r = t.length; r < n; ++r) t.push(null);
              else t.length = n;
              return t.join("");
            }
            class ParserImpl {
              static init() {
                (TRANSFER_BUFFER = C._ts_init()),
                  (VERSION = getValue(TRANSFER_BUFFER, "i32")),
                  (MIN_COMPATIBLE_VERSION = getValue(
                    TRANSFER_BUFFER + SIZE_OF_INT,
                    "i32"
                  ));
              }
              initialize() {
                C._ts_parser_new_wasm(),
                  (this[0] = getValue(TRANSFER_BUFFER, "i32")),
                  (this[1] = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32"));
              }
              delete() {
                C._ts_parser_delete(this[0]),
                  C._free(this[1]),
                  (this[0] = 0),
                  (this[1] = 0);
              }
              setLanguage(e) {
                let t;
                if (e) {
                  if (e.constructor !== Language)
                    throw new Error("Argument must be a Language");
                  {
                    t = e[0];
                    const r = C._ts_language_version(t);
                    if (r < MIN_COMPATIBLE_VERSION || VERSION < r)
                      throw new Error(
                        `Incompatible language version ${r}. ` +
                          `Compatibility range ${MIN_COMPATIBLE_VERSION} through ${VERSION}.`
                      );
                  }
                } else (t = 0), (e = null);
                return (
                  (this.language = e),
                  C._ts_parser_set_language(this[0], t),
                  this
                );
              }
              getLanguage() {
                return this.language;
              }
              parse(e, t, r) {
                if ("string" == typeof e)
                  currentParseCallback = (t, r, n) => e.slice(t, n);
                else if ("object" == typeof e && e.constructor === Array)
                  currentParseCallback = (t, r, n) => e.slice(t, n);
                else {
                  if ("function" != typeof e)
                    throw new Error("Argument must be a string or a function");
                  currentParseCallback = e;
                }
                this.logCallback
                  ? ((currentLogCallback = this.logCallback),
                    C._ts_parser_enable_logger_wasm(this[0], 1))
                  : ((currentLogCallback = null),
                    C._ts_parser_enable_logger_wasm(this[0], 0));
                let n = 0,
                  o = 0;
                if (r && r.includedRanges) {
                  n = r.includedRanges.length;
                  let e = (o = C._calloc(n, SIZE_OF_RANGE));
                  for (let t = 0; t < n; t++)
                    marshalRange(e, r.includedRanges[t]), (e += SIZE_OF_RANGE);
                }
                const s = C._ts_parser_parse_wasm(
                  this[0],
                  this[1],
                  t ? t[0] : 0,
                  o,
                  n
                );
                if (!s)
                  throw (
                    ((currentParseCallback = null),
                    (currentLogCallback = null),
                    new Error("Parsing failed"))
                  );
                const a = new Tree(
                  INTERNAL,
                  s,
                  this.language,
                  currentParseCallback
                );
                return (
                  (currentParseCallback = null), (currentLogCallback = null), a
                );
              }
              reset() {
                C._ts_parser_reset(this[0]);
              }
              setTimeoutMicros(e) {
                C._ts_parser_set_timeout_micros(this[0], e);
              }
              getTimeoutMicros() {
                return C._ts_parser_timeout_micros(this[0]);
              }
              setLogger(e) {
                if (e) {
                  if ("function" != typeof e)
                    throw new Error("Logger callback must be a function");
                } else e = null;
                return (this.logCallback = e), this;
              }
              getLogger() {
                return this.logCallback;
              }
            }
            class Tree {
              constructor(e, t, r, n) {
                assertInternal(e),
                  (this[0] = t),
                  (this.language = r),
                  (this.textCallback = n);
              }
              copy() {
                const e = C._ts_tree_copy(this[0]);
                return new Tree(INTERNAL, e, this.language, this.textCallback);
              }
              delete() {
                C._ts_tree_delete(this[0]), (this[0] = 0);
              }
              edit(e) {
                marshalEdit(e), C._ts_tree_edit_wasm(this[0]);
              }
              get rootNode() {
                return C._ts_tree_root_node_wasm(this[0]), unmarshalNode(this);
              }
              getLanguage() {
                return this.language;
              }
              walk() {
                return this.rootNode.walk();
              }
              getChangedRanges(e) {
                if (e.constructor !== Tree)
                  throw new TypeError("Argument must be a Tree");
                C._ts_tree_get_changed_ranges_wasm(this[0], e[0]);
                const t = getValue(TRANSFER_BUFFER, "i32"),
                  r = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32"),
                  n = new Array(t);
                if (t > 0) {
                  let e = r;
                  for (let r = 0; r < t; r++)
                    (n[r] = unmarshalRange(e)), (e += SIZE_OF_RANGE);
                  C._free(r);
                }
                return n;
              }
            }
            class Node {
              constructor(e, t) {
                assertInternal(e), (this.tree = t);
              }
              get typeId() {
                return marshalNode(this), C._ts_node_symbol_wasm(this.tree[0]);
              }
              get type() {
                return this.tree.language.types[this.typeId] || "ERROR";
              }
              get endPosition() {
                return (
                  marshalNode(this),
                  C._ts_node_end_point_wasm(this.tree[0]),
                  unmarshalPoint(TRANSFER_BUFFER)
                );
              }
              get endIndex() {
                return (
                  marshalNode(this), C._ts_node_end_index_wasm(this.tree[0])
                );
              }
              get text() {
                return getText(this.tree, this.startIndex, this.endIndex);
              }
              isNamed() {
                return (
                  marshalNode(this),
                  1 === C._ts_node_is_named_wasm(this.tree[0])
                );
              }
              hasError() {
                return (
                  marshalNode(this),
                  1 === C._ts_node_has_error_wasm(this.tree[0])
                );
              }
              hasChanges() {
                return (
                  marshalNode(this),
                  1 === C._ts_node_has_changes_wasm(this.tree[0])
                );
              }
              isMissing() {
                return (
                  marshalNode(this),
                  1 === C._ts_node_is_missing_wasm(this.tree[0])
                );
              }
              equals(e) {
                return this.id === e.id;
              }
              child(e) {
                return (
                  marshalNode(this),
                  C._ts_node_child_wasm(this.tree[0], e),
                  unmarshalNode(this.tree)
                );
              }
              namedChild(e) {
                return (
                  marshalNode(this),
                  C._ts_node_named_child_wasm(this.tree[0], e),
                  unmarshalNode(this.tree)
                );
              }
              childForFieldId(e) {
                return (
                  marshalNode(this),
                  C._ts_node_child_by_field_id_wasm(this.tree[0], e),
                  unmarshalNode(this.tree)
                );
              }
              childForFieldName(e) {
                const t = this.tree.language.fields.indexOf(e);
                if (-1 !== t) return this.childForFieldId(t);
              }
              get childCount() {
                return (
                  marshalNode(this), C._ts_node_child_count_wasm(this.tree[0])
                );
              }
              get namedChildCount() {
                return (
                  marshalNode(this),
                  C._ts_node_named_child_count_wasm(this.tree[0])
                );
              }
              get firstChild() {
                return this.child(0);
              }
              get firstNamedChild() {
                return this.namedChild(0);
              }
              get lastChild() {
                return this.child(this.childCount - 1);
              }
              get lastNamedChild() {
                return this.namedChild(this.namedChildCount - 1);
              }
              get children() {
                if (!this._children) {
                  marshalNode(this), C._ts_node_children_wasm(this.tree[0]);
                  const e = getValue(TRANSFER_BUFFER, "i32"),
                    t = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                  if (((this._children = new Array(e)), e > 0)) {
                    let r = t;
                    for (let t = 0; t < e; t++)
                      (this._children[t] = unmarshalNode(this.tree, r)),
                        (r += SIZE_OF_NODE);
                    C._free(t);
                  }
                }
                return this._children;
              }
              get namedChildren() {
                if (!this._namedChildren) {
                  marshalNode(this),
                    C._ts_node_named_children_wasm(this.tree[0]);
                  const e = getValue(TRANSFER_BUFFER, "i32"),
                    t = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
                  if (((this._namedChildren = new Array(e)), e > 0)) {
                    let r = t;
                    for (let t = 0; t < e; t++)
                      (this._namedChildren[t] = unmarshalNode(this.tree, r)),
                        (r += SIZE_OF_NODE);
                    C._free(t);
                  }
                }
                return this._namedChildren;
              }
              descendantsOfType(e, t, r) {
                Array.isArray(e) || (e = [e]),
                  t || (t = ZERO_POINT),
                  r || (r = ZERO_POINT);
                const n = [],
                  o = this.tree.language.types;
                for (let t = 0, r = o.length; t < r; t++)
                  e.includes(o[t]) && n.push(t);
                const s = C._malloc(SIZE_OF_INT * n.length);
                for (let e = 0, t = n.length; e < t; e++)
                  setValue(s + e * SIZE_OF_INT, n[e], "i32");
                marshalNode(this),
                  C._ts_node_descendants_of_type_wasm(
                    this.tree[0],
                    s,
                    n.length,
                    t.row,
                    t.column,
                    r.row,
                    r.column
                  );
                const a = getValue(TRANSFER_BUFFER, "i32"),
                  _ = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32"),
                  i = new Array(a);
                if (a > 0) {
                  let e = _;
                  for (let t = 0; t < a; t++)
                    (i[t] = unmarshalNode(this.tree, e)), (e += SIZE_OF_NODE);
                }
                return C._free(_), C._free(s), i;
              }
              get nextSibling() {
                return (
                  marshalNode(this),
                  C._ts_node_next_sibling_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              get previousSibling() {
                return (
                  marshalNode(this),
                  C._ts_node_prev_sibling_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              get nextNamedSibling() {
                return (
                  marshalNode(this),
                  C._ts_node_next_named_sibling_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              get previousNamedSibling() {
                return (
                  marshalNode(this),
                  C._ts_node_prev_named_sibling_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              get parent() {
                return (
                  marshalNode(this),
                  C._ts_node_parent_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              descendantForIndex(e, t = e) {
                if ("number" != typeof e || "number" != typeof t)
                  throw new Error("Arguments must be numbers");
                marshalNode(this);
                let r = TRANSFER_BUFFER + SIZE_OF_NODE;
                return (
                  setValue(r, e, "i32"),
                  setValue(r + SIZE_OF_INT, t, "i32"),
                  C._ts_node_descendant_for_index_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              namedDescendantForIndex(e, t = e) {
                if ("number" != typeof e || "number" != typeof t)
                  throw new Error("Arguments must be numbers");
                marshalNode(this);
                let r = TRANSFER_BUFFER + SIZE_OF_NODE;
                return (
                  setValue(r, e, "i32"),
                  setValue(r + SIZE_OF_INT, t, "i32"),
                  C._ts_node_named_descendant_for_index_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              descendantForPosition(e, t = e) {
                if (!isPoint(e) || !isPoint(t))
                  throw new Error("Arguments must be {row, column} objects");
                marshalNode(this);
                let r = TRANSFER_BUFFER + SIZE_OF_NODE;
                return (
                  marshalPoint(r, e),
                  marshalPoint(r + SIZE_OF_POINT, t),
                  C._ts_node_descendant_for_position_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              namedDescendantForPosition(e, t = e) {
                if (!isPoint(e) || !isPoint(t))
                  throw new Error("Arguments must be {row, column} objects");
                marshalNode(this);
                let r = TRANSFER_BUFFER + SIZE_OF_NODE;
                return (
                  marshalPoint(r, e),
                  marshalPoint(r + SIZE_OF_POINT, t),
                  C._ts_node_named_descendant_for_position_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              walk() {
                return (
                  marshalNode(this),
                  C._ts_tree_cursor_new_wasm(this.tree[0]),
                  new TreeCursor(INTERNAL, this.tree)
                );
              }
              toString() {
                marshalNode(this);
                const e = C._ts_node_to_string_wasm(this.tree[0]),
                  t = AsciiToString(e);
                return C._free(e), t;
              }
            }
            class TreeCursor {
              constructor(e, t) {
                assertInternal(e), (this.tree = t), unmarshalTreeCursor(this);
              }
              delete() {
                marshalTreeCursor(this),
                  C._ts_tree_cursor_delete_wasm(this.tree[0]),
                  (this[0] = this[1] = this[2] = 0);
              }
              reset(e) {
                marshalNode(e),
                  marshalTreeCursor(this, TRANSFER_BUFFER + SIZE_OF_NODE),
                  C._ts_tree_cursor_reset_wasm(this.tree[0]),
                  unmarshalTreeCursor(this);
              }
              get nodeType() {
                return this.tree.language.types[this.nodeTypeId] || "ERROR";
              }
              get nodeTypeId() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_current_node_type_id_wasm(this.tree[0])
                );
              }
              get nodeId() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_current_node_id_wasm(this.tree[0])
                );
              }
              get nodeIsNamed() {
                return (
                  marshalTreeCursor(this),
                  1 ===
                    C._ts_tree_cursor_current_node_is_named_wasm(this.tree[0])
                );
              }
              get nodeIsMissing() {
                return (
                  marshalTreeCursor(this),
                  1 ===
                    C._ts_tree_cursor_current_node_is_missing_wasm(this.tree[0])
                );
              }
              get nodeText() {
                marshalTreeCursor(this);
                const e = C._ts_tree_cursor_start_index_wasm(this.tree[0]),
                  t = C._ts_tree_cursor_end_index_wasm(this.tree[0]);
                return getText(this.tree, e, t);
              }
              get startPosition() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_start_position_wasm(this.tree[0]),
                  unmarshalPoint(TRANSFER_BUFFER)
                );
              }
              get endPosition() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_end_position_wasm(this.tree[0]),
                  unmarshalPoint(TRANSFER_BUFFER)
                );
              }
              get startIndex() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_start_index_wasm(this.tree[0])
                );
              }
              get endIndex() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_end_index_wasm(this.tree[0])
                );
              }
              currentNode() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_current_node_wasm(this.tree[0]),
                  unmarshalNode(this.tree)
                );
              }
              currentFieldId() {
                return (
                  marshalTreeCursor(this),
                  C._ts_tree_cursor_current_field_id_wasm(this.tree[0])
                );
              }
              currentFieldName() {
                return this.tree.language.fields[this.currentFieldId()];
              }
              gotoFirstChild() {
                marshalTreeCursor(this);
                const e = C._ts_tree_cursor_goto_first_child_wasm(this.tree[0]);
                return unmarshalTreeCursor(this), 1 === e;
              }
              gotoNextSibling() {
                marshalTreeCursor(this);
                const e = C._ts_tree_cursor_goto_next_sibling_wasm(
                  this.tree[0]
                );
                return unmarshalTreeCursor(this), 1 === e;
              }
              gotoParent() {
                marshalTreeCursor(this);
                const e = C._ts_tree_cursor_goto_parent_wasm(this.tree[0]);
                return unmarshalTreeCursor(this), 1 === e;
              }
            }
            class Language {
              constructor(e, t) {
                assertInternal(e),
                  (this[0] = t),
                  (this.types = new Array(
                    C._ts_language_symbol_count(this[0])
                  ));
                for (let e = 0, t = this.types.length; e < t; e++)
                  C._ts_language_symbol_type(this[0], e) < 2 &&
                    (this.types[e] = UTF8ToString(
                      C._ts_language_symbol_name(this[0], e)
                    ));
                this.fields = new Array(
                  C._ts_language_field_count(this[0]) + 1
                );
                for (let e = 0, t = this.fields.length; e < t; e++) {
                  const t = C._ts_language_field_name_for_id(this[0], e);
                  this.fields[e] = 0 !== t ? UTF8ToString(t) : null;
                }
              }
              get version() {
                return C._ts_language_version(this[0]);
              }
              get fieldCount() {
                return this.fields.length - 1;
              }
              fieldIdForName(e) {
                const t = this.fields.indexOf(e);
                return -1 !== t ? t : null;
              }
              fieldNameForId(e) {
                return this.fields[e] || null;
              }
              idForNodeType(e, t) {
                const r = lengthBytesUTF8(e),
                  n = C._malloc(r + 1);
                stringToUTF8(e, n, r + 1);
                const o = C._ts_language_symbol_for_name(this[0], n, r, t);
                return C._free(n), o || null;
              }
              get nodeTypeCount() {
                return C._ts_language_symbol_count(this[0]);
              }
              nodeTypeForId(e) {
                const t = C._ts_language_symbol_name(this[0], e);
                return t ? UTF8ToString(t) : null;
              }
              nodeTypeIsNamed(e) {
                return !!C._ts_language_type_is_named_wasm(this[0], e);
              }
              nodeTypeIsVisible(e) {
                return !!C._ts_language_type_is_visible_wasm(this[0], e);
              }
              query(e) {
                const t = lengthBytesUTF8(e),
                  r = C._malloc(t + 1);
                stringToUTF8(e, r, t + 1);
                const n = C._ts_query_new(
                  this[0],
                  r,
                  t,
                  TRANSFER_BUFFER,
                  TRANSFER_BUFFER + SIZE_OF_INT
                );
                if (!n) {
                  const t = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32"),
                    n = UTF8ToString(
                      r,
                      getValue(TRANSFER_BUFFER, "i32")
                    ).length,
                    o = e.substr(n, 100).split("\n")[0];
                  let s,
                    a = o.match(QUERY_WORD_REGEX)[0];
                  switch (t) {
                    case 2:
                      s = new RangeError(`Bad node name '${a}'`);
                      break;
                    case 3:
                      s = new RangeError(`Bad field name '${a}'`);
                      break;
                    case 4:
                      s = new RangeError(`Bad capture name @${a}`);
                      break;
                    case 5:
                      (s = new TypeError(
                        `Bad pattern structure at offset ${n}: '${o}'...`
                      )),
                        (a = "");
                      break;
                    default:
                      (s = new SyntaxError(
                        `Bad syntax at offset ${n}: '${o}'...`
                      )),
                        (a = "");
                  }
                  throw ((s.index = n), (s.length = a.length), C._free(r), s);
                }
                const o = C._ts_query_string_count(n),
                  s = C._ts_query_capture_count(n),
                  a = C._ts_query_pattern_count(n),
                  _ = new Array(s),
                  i = new Array(o);
                for (let e = 0; e < s; e++) {
                  const t = C._ts_query_capture_name_for_id(
                      n,
                      e,
                      TRANSFER_BUFFER
                    ),
                    r = getValue(TRANSFER_BUFFER, "i32");
                  _[e] = UTF8ToString(t, r);
                }
                for (let e = 0; e < o; e++) {
                  const t = C._ts_query_string_value_for_id(
                      n,
                      e,
                      TRANSFER_BUFFER
                    ),
                    r = getValue(TRANSFER_BUFFER, "i32");
                  i[e] = UTF8ToString(t, r);
                }
                const l = new Array(a),
                  u = new Array(a),
                  d = new Array(a),
                  c = new Array(a),
                  m = new Array(a);
                for (let e = 0; e < a; e++) {
                  const t = C._ts_query_predicates_for_pattern(
                      n,
                      e,
                      TRANSFER_BUFFER
                    ),
                    r = getValue(TRANSFER_BUFFER, "i32");
                  (c[e] = []), (m[e] = []);
                  const o = [];
                  let s = t;
                  for (let t = 0; t < r; t++) {
                    const t = getValue(s, "i32"),
                      r = getValue((s += SIZE_OF_INT), "i32");
                    if (((s += SIZE_OF_INT), t === PREDICATE_STEP_TYPE_CAPTURE))
                      o.push({ type: "capture", name: _[r] });
                    else if (t === PREDICATE_STEP_TYPE_STRING)
                      o.push({ type: "string", value: i[r] });
                    else if (o.length > 0) {
                      if ("string" !== o[0].type)
                        throw new Error(
                          "Predicates must begin with a literal value"
                        );
                      const t = o[0].value;
                      let r = !0;
                      switch (t) {
                        case "not-eq?":
                          r = !1;
                        case "eq?":
                          if (3 !== o.length)
                            throw new Error(
                              `Wrong number of arguments to \`#eq?\` predicate. Expected 2, got ${
                                o.length - 1
                              }`
                            );
                          if ("capture" !== o[1].type)
                            throw new Error(
                              `First argument of \`#eq?\` predicate must be a capture. Got "${o[1].value}"`
                            );
                          if ("capture" === o[2].type) {
                            const t = o[1].name,
                              n = o[2].name;
                            m[e].push(function (e) {
                              let o, s;
                              for (const r of e)
                                r.name === t && (o = r.node),
                                  r.name === n && (s = r.node);
                              return (
                                void 0 === o ||
                                void 0 === s ||
                                (o.text === s.text) === r
                              );
                            });
                          } else {
                            const t = o[1].name,
                              n = o[2].value;
                            m[e].push(function (e) {
                              for (const o of e)
                                if (o.name === t)
                                  return (o.node.text === n) === r;
                              return !0;
                            });
                          }
                          break;
                        case "not-match?":
                          r = !1;
                        case "match?":
                          if (3 !== o.length)
                            throw new Error(
                              `Wrong number of arguments to \`#match?\` predicate. Expected 2, got ${
                                o.length - 1
                              }.`
                            );
                          if ("capture" !== o[1].type)
                            throw new Error(
                              `First argument of \`#match?\` predicate must be a capture. Got "${o[1].value}".`
                            );
                          if ("string" !== o[2].type)
                            throw new Error(
                              `Second argument of \`#match?\` predicate must be a string. Got @${o[2].value}.`
                            );
                          const n = o[1].name,
                            s = new RegExp(o[2].value);
                          m[e].push(function (e) {
                            for (const t of e)
                              if (t.name === n)
                                return s.test(t.node.text) === r;
                            return !0;
                          });
                          break;
                        case "set!":
                          if (o.length < 2 || o.length > 3)
                            throw new Error(
                              `Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${
                                o.length - 1
                              }.`
                            );
                          if (o.some((e) => "string" !== e.type))
                            throw new Error(
                              'Arguments to `#set!` predicate must be a strings.".'
                            );
                          l[e] || (l[e] = {}),
                            (l[e][o[1].value] = o[2] ? o[2].value : null);
                          break;
                        case "is?":
                        case "is-not?":
                          if (o.length < 2 || o.length > 3)
                            throw new Error(
                              `Wrong number of arguments to \`#${t}\` predicate. Expected 1 or 2. Got ${
                                o.length - 1
                              }.`
                            );
                          if (o.some((e) => "string" !== e.type))
                            throw new Error(
                              `Arguments to \`#${t}\` predicate must be a strings.".`
                            );
                          const a = "is?" === t ? u : d;
                          a[e] || (a[e] = {}),
                            (a[e][o[1].value] = o[2] ? o[2].value : null);
                          break;
                        default:
                          c[e].push({ operator: t, operands: o.slice(1) });
                      }
                      o.length = 0;
                    }
                  }
                  Object.freeze(l[e]), Object.freeze(u[e]), Object.freeze(d[e]);
                }
                return (
                  C._free(r),
                  new Query(
                    INTERNAL,
                    n,
                    _,
                    m,
                    c,
                    Object.freeze(l),
                    Object.freeze(u),
                    Object.freeze(d)
                  )
                );
              }
              static load(e) {
                let t;
                if (e instanceof Uint8Array) t = Promise.resolve(e);
                else {
                  const r = e;
                  if (
                    "undefined" != typeof process &&
                    process.versions &&
                    process.versions.node
                  ) {
                    const e = require("fs");
                    t = Promise.resolve(e.readFileSync(r));
                  } else
                    t = fetch(r).then((e) =>
                      e.arrayBuffer().then((t) => {
                        if (e.ok) return new Uint8Array(t);
                        {
                          const r = new TextDecoder("utf-8").decode(t);
                          throw new Error(
                            `Language.load failed with status ${e.status}.\n\n${r}`
                          );
                        }
                      })
                    );
                }
                const r =
                  "function" == typeof loadSideModule
                    ? loadSideModule
                    : loadWebAssemblyModule;
                return t
                  .then((e) => r(e, { loadAsync: !0 }))
                  .then((e) => {
                    const t = Object.keys(e),
                      r = t.find(
                        (e) =>
                          LANGUAGE_FUNCTION_REGEX.test(e) &&
                          !e.includes("external_scanner_")
                      );
                    r ||
                      console.log(
                        `Couldn't find language function in WASM file. Symbols:\n${JSON.stringify(
                          t,
                          null,
                          2
                        )}`
                      );
                    const n = e[r]();
                    return new Language(INTERNAL, n);
                  });
              }
            }
            class Query {
              constructor(e, t, r, n, o, s, a, _) {
                assertInternal(e),
                  (this[0] = t),
                  (this.captureNames = r),
                  (this.textPredicates = n),
                  (this.predicates = o),
                  (this.setProperties = s),
                  (this.assertedProperties = a),
                  (this.refutedProperties = _),
                  (this.exceededMatchLimit = !1);
              }
              delete() {
                C._ts_query_delete(this[0]), (this[0] = 0);
              }
              matches(e, t, r, n) {
                t || (t = ZERO_POINT), r || (r = ZERO_POINT), n || (n = {});
                let o = n.matchLimit;
                if (void 0 === o) o = 0;
                else if ("number" != typeof o)
                  throw new Error("Arguments must be numbers");
                marshalNode(e),
                  C._ts_query_matches_wasm(
                    this[0],
                    e.tree[0],
                    t.row,
                    t.column,
                    r.row,
                    r.column,
                    o
                  );
                const s = getValue(TRANSFER_BUFFER, "i32"),
                  a = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32"),
                  _ = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32"),
                  i = new Array(s);
                this.exceededMatchLimit = !!_;
                let l = 0,
                  u = a;
                for (let t = 0; t < s; t++) {
                  const t = getValue(u, "i32"),
                    r = getValue((u += SIZE_OF_INT), "i32");
                  u += SIZE_OF_INT;
                  const n = new Array(r);
                  if (
                    ((u = unmarshalCaptures(this, e.tree, u, n)),
                    this.textPredicates[t].every((e) => e(n)))
                  ) {
                    const e = l++;
                    i[e] = { pattern: t, captures: n };
                    const r = this.setProperties[t];
                    r && (i[e].setProperties = r);
                    const o = this.assertedProperties[t];
                    o && (i[e].assertedProperties = o);
                    const s = this.refutedProperties[t];
                    s && (i[e].refutedProperties = s);
                  }
                }
                return (i.length = l), C._free(a), i;
              }
              captures(e, t, r, n) {
                t || (t = ZERO_POINT), r || (r = ZERO_POINT), n || (n = {});
                let o = n.matchLimit;
                if (void 0 === o) o = 0;
                else if ("number" != typeof o)
                  throw new Error("Arguments must be numbers");
                marshalNode(e),
                  C._ts_query_captures_wasm(
                    this[0],
                    e.tree[0],
                    t.row,
                    t.column,
                    r.row,
                    r.column,
                    o
                  );
                const s = getValue(TRANSFER_BUFFER, "i32"),
                  a = getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32"),
                  _ = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32"),
                  i = [];
                this.exceededMatchLimit = !!_;
                const l = [];
                let u = a;
                for (let t = 0; t < s; t++) {
                  const t = getValue(u, "i32"),
                    r = getValue((u += SIZE_OF_INT), "i32"),
                    n = getValue((u += SIZE_OF_INT), "i32");
                  if (
                    ((u += SIZE_OF_INT),
                    (l.length = r),
                    (u = unmarshalCaptures(this, e.tree, u, l)),
                    this.textPredicates[t].every((e) => e(l)))
                  ) {
                    const e = l[n],
                      r = this.setProperties[t];
                    r && (e.setProperties = r);
                    const o = this.assertedProperties[t];
                    o && (e.assertedProperties = o);
                    const s = this.refutedProperties[t];
                    s && (e.refutedProperties = s), i.push(e);
                  }
                }
                return C._free(a), i;
              }
              predicatesForPattern(e) {
                return this.predicates[e];
              }
              didExceedMatchLimit() {
                return this.exceededMatchLimit;
              }
            }
            function getText(e, t, r) {
              const n = r - t;
              let o = e.textCallback(t, null, r);
              for (t += o.length; t < r; ) {
                const n = e.textCallback(t, null, r);
                if (!(n && n.length > 0)) break;
                (t += n.length), (o += n);
              }
              return (
                t > r && (o = o.slice(0, n)),
                "object" == typeof o &&
                  o.constructor === Array &&
                  (o = arrToJSStr(o)),
                o
              );
            }
            function unmarshalCaptures(e, t, r, n) {
              for (let o = 0, s = n.length; o < s; o++) {
                const s = getValue(r, "i32"),
                  a = unmarshalNode(t, (r += SIZE_OF_INT));
                (r += SIZE_OF_NODE),
                  (n[o] = { name: e.captureNames[s], node: a });
              }
              return r;
            }
            function assertInternal(e) {
              if (e !== INTERNAL) throw new Error("Illegal constructor");
            }
            function isPoint(e) {
              return (
                e && "number" == typeof e.row && "number" == typeof e.column
              );
            }
            function marshalNode(e) {
              let t = TRANSFER_BUFFER;
              setValue(t, e.id, "i32"),
                setValue((t += SIZE_OF_INT), e.startIndex, "i32"),
                setValue((t += SIZE_OF_INT), e.startPosition.row, "i32"),
                setValue((t += SIZE_OF_INT), e.startPosition.column, "i32"),
                setValue((t += SIZE_OF_INT), e[0], "i32");
            }
            function unmarshalNode(e, t = TRANSFER_BUFFER) {
              const r = getValue(t, "i32");
              if (0 === r) return null;
              const n = getValue((t += SIZE_OF_INT), "i32"),
                o = getValue((t += SIZE_OF_INT), "i32"),
                s = getValue((t += SIZE_OF_INT), "i32"),
                a = getValue((t += SIZE_OF_INT), "i32"),
                _ = new Node(INTERNAL, e);
              return (
                (_.id = r),
                (_.startIndex = n),
                (_.startPosition = { row: o, column: s }),
                (_[0] = a),
                _
              );
            }
            function marshalTreeCursor(e, t = TRANSFER_BUFFER) {
              setValue(t + 0 * SIZE_OF_INT, e[0], "i32"),
                setValue(t + 1 * SIZE_OF_INT, e[1], "i32"),
                setValue(t + 2 * SIZE_OF_INT, e[2], "i32");
            }
            function unmarshalTreeCursor(e) {
              (e[0] = getValue(TRANSFER_BUFFER + 0 * SIZE_OF_INT, "i32")),
                (e[1] = getValue(TRANSFER_BUFFER + 1 * SIZE_OF_INT, "i32")),
                (e[2] = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32"));
            }
            function marshalPoint(e, t) {
              setValue(e, t.row, "i32"),
                setValue(e + SIZE_OF_INT, t.column, "i32");
            }
            function unmarshalPoint(e) {
              return {
                row: getValue(e, "i32"),
                column: getValue(e + SIZE_OF_INT, "i32"),
              };
            }
            function marshalRange(e, t) {
              marshalPoint(e, t.startPosition),
                marshalPoint((e += SIZE_OF_POINT), t.endPosition),
                setValue((e += SIZE_OF_POINT), t.startIndex, "i32"),
                setValue((e += SIZE_OF_INT), t.endIndex, "i32"),
                (e += SIZE_OF_INT);
            }
            function unmarshalRange(e) {
              const t = {};
              return (
                (t.startPosition = unmarshalPoint(e)),
                (e += SIZE_OF_POINT),
                (t.endPosition = unmarshalPoint(e)),
                (e += SIZE_OF_POINT),
                (t.startIndex = getValue(e, "i32")),
                (e += SIZE_OF_INT),
                (t.endIndex = getValue(e, "i32")),
                t
              );
            }
            function marshalEdit(e) {
              let t = TRANSFER_BUFFER;
              marshalPoint(t, e.startPosition),
                marshalPoint((t += SIZE_OF_POINT), e.oldEndPosition),
                marshalPoint((t += SIZE_OF_POINT), e.newEndPosition),
                setValue((t += SIZE_OF_POINT), e.startIndex, "i32"),
                setValue((t += SIZE_OF_INT), e.oldEndIndex, "i32"),
                setValue((t += SIZE_OF_INT), e.newEndIndex, "i32"),
                (t += SIZE_OF_INT);
            }
            for (const e of Object.getOwnPropertyNames(ParserImpl.prototype))
              Object.defineProperty(Parser.prototype, e, {
                value: ParserImpl.prototype[e],
                enumerable: !1,
                writable: !1,
              });
            (Parser.Language = Language),
              (Module.onRuntimeInitialized = () => {
                ParserImpl.init(), resolveInitPromise();
              });
          })))
        );
      }
    }
    return Parser;
  })();
"object" == typeof exports && (module.exports = TreeSitter);
