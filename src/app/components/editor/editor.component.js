"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorComponent = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const ngx_quill_1 = require("ngx-quill");
let EditorComponent = (() => {
    let _classDecorators = [(0, core_1.Component)({
            selector: 'app-editor',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule, ngx_quill_1.QuillModule],
            templateUrl: './editor.component.html',
            styleUrls: ['./editor.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EditorComponent = _classThis = class {
        constructor(documentService, authService, route, router, dataService, wsService, platformId) {
            this.documentService = documentService;
            this.authService = authService;
            this.route = route;
            this.router = router;
            this.dataService = dataService;
            this.wsService = wsService;
            this.platformId = platformId;
            this.title = '';
            this.content = '';
            this.ownerId = '';
            this.cursorPosition = 0;
            this.isBrowser = (0, common_1.isPlatformBrowser)(this.platformId);
        }
        ngAfterViewInit() {
            this.quillMaker();
        }
        saveDocument() {
            var _a;
            if (!this.title.trim()) {
                alert("Please enter a title before saving.");
                return;
            }
            const owner = ((_a = this.authService.getCurrentUserUID()) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            this.authService.getCurrentUserUID().subscribe((uid) => {
                if (uid) {
                    this.ownerId = uid;
                }
            });
            this.documentService.saveDocument(this.title, this.content, this.ownerId)
                .subscribe(response => {
                alert("Document saved successfully! ID: " + response.id);
            }, error => {
                console.error("Error saving document:", error);
                alert("Failed to save document.");
            });
        }
        updateDocument() {
            if (!this.title.trim()) {
                alert("Please enter a title before saving.");
                return;
            }
            // const owner = this.authService.getCurrentUserUID()?.toString() || '';
            // this.authService.getCurrentUserUID().subscribe((uid) => {
            //   if (uid) {
            //     this.ownerId = uid;
            //   }
            // });
            this.documentService.updateDocument(this.title, this.content, this.docId)
                .subscribe(response => {
                alert("Document updated successfully! ID: " + response.id);
            }, error => {
                console.error("Error saving document:", error);
                alert("Failed to save document.");
            });
        }
        ngOnInit() {
            return __awaiter(this, void 0, void 0, function* () {
                this.docId = this.route.snapshot.paramMap.get('id');
                this.authService.getCurrentUserUID().subscribe((uid) => {
                    if (uid) {
                        this.ownerId = uid;
                    }
                });
                const cachedData = this.dataService.getCachedContent(this.docId);
                if (cachedData) {
                    this.content = cachedData[1];
                    this.title = cachedData[0];
                }
                else {
                    this.dataService.getDocumentContent(this.docId).subscribe((data) => {
                        this.content = data.content;
                        this.title = data.title;
                        this.dataService.setCachedContent(this.docId, this.content);
                    });
                }
                this.initEditor();
                const socket$ = this.wsService.connect(this.docId);
                socket$.subscribe(msg => {
                    console.log(msg);
                    if (msg.delta) {
                        this.quillInstance.updateContents(msg.delta); // Apply the incoming delta
                    }
                    if (msg.cursor) {
                        this.highlightCursor(msg.cursor.userId, msg.cursor.position);
                    }
                });
            });
        }
        onTextChange(event) {
            const operation = {
                docId: this.docId,
                userId: 'user1',
                index: this.cursorPosition,
                text: event.target.value,
                isInsert: true
            };
            this.wsService.sendMessage({ operation });
        }
        onCursorMove(event) {
            var _a;
            this.cursorPosition = (_a = event.target) === null || _a === void 0 ? void 0 : _a.selectionStart;
            this.wsService.sendMessage({ cursor: { userId: 'user1', position: this.cursorPosition } });
        }
        highlightCursor(userId, position) {
            console.log(`User ${userId} is at position ${position}`);
        }
        initEditor() {
            this.quillMaker();
            // this.quill.root.innerHTML = this.content;
        }
        quillMaker() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isBrowser) {
                    const m = yield Promise.resolve().then(() => __importStar(require('quill')));
                    // this.quill = new m.default('#editor-container', {
                    //   // modules: { toolbar: '#toolbar' },
                    //   theme: 'snow',
                    //   placeholder: "placeholder",
                    // });
                }
            });
        }
        onEditorCreated(quill) {
            this.quillInstance = quill;
            // Listen for text changes
            quill.on('text-change', (delta, oldContent, source) => {
                console.log('Text changed:', delta, oldContent, source);
                this.handleTextChange(delta, oldContent, source);
            });
        }
        handleTextChange(delta, oldContent, source) {
            if (source === 'user') { // Only process user edits
                const operation = {
                    docId: this.docId, // The current document ID
                    userId: this.ownerId, // The current user ID
                    delta: delta, // Quill delta object representing changes
                };
                console.log('User edit detected:', delta);
                // Send operation to WebSocket server
                this.wsService.sendMessage({ operation });
            }
        }
    };
    __setFunctionName(_classThis, "EditorComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EditorComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EditorComponent = _classThis;
})();
exports.EditorComponent = EditorComponent;
