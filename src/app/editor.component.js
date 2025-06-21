"use strict";
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorComponent = void 0;
const core_1 = require("@angular/core");
const stompjs_1 = require("@stomp/stompjs");
const sockjs_client_1 = __importDefault(require("sockjs-client"));
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
const rxjs_1 = require("rxjs");
const ngx_quill_1 = require("ngx-quill");
let EditorComponent = (() => {
    let _classDecorators = [(0, core_1.Component)({
            selector: 'app-editor',
            templateUrl: './editor.component.html',
            imports: [forms_1.FormsModule, common_1.CommonModule, ngx_quill_1.QuillModule],
            styleUrls: ['./editor.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _editor_decorators;
    let _editor_initializers = [];
    let _editor_extraInitializers = [];
    var EditorComponent = _classThis = class {
        constructor() {
            this.editor = __runInitializers(this, _editor_initializers, void 0);
            this.messageContent = (__runInitializers(this, _editor_extraInitializers), '');
            this.messages = [];
            this.activeUsers = [];
            this.documentUpdates = new rxjs_1.BehaviorSubject('');
            this.connect();
        }
        connect() {
            this.stompClient = new stompjs_1.Client({
                webSocketFactory: () => new sockjs_client_1.default('http://localhost:8080/ws'),
                debug: (str) => console.log(str),
            });
            this.stompClient.onConnect = () => {
                this.stompClient.subscribe('/topic/document', (message) => {
                    console.log("connected");
                    this.showMessage(JSON.parse(message.body));
                    //this.documentUpdates.next(JSON.parse(message.body).content);
                });
            };
            this.stompClient.activate();
        }
        //   sendUpdate(content: string) {
        //     this.stompClient.publish({
        //       destination: '/app/edit',
        //       body: JSON.stringify({ content }),
        //     });
        //   }
        //   getUpdates() {
        //     return this.documentUpdates.asObservable();
        //   }
        //   connectWebSocket() {
        //     const socket = new SockJS('/ws');
        //     this.stompClient = new Client({
        //       webSocketFactory: () => socket,
        //       debug: (str) => console.log(str),
        //       reconnectDelay: 5000
        //     });
        //     this.stompClient.onConnect = (frame) => {
        //       console.log('Connected: ' + frame);
        //       this.stompClient?.subscribe('/topic/document', (messageOutput) => {
        //         this.showMessage(JSON.parse(messageOutput.body));
        //       });
        //     };
        //     this.stompClient.activate();
        //   }
        disconnectWebSocket() {
            if (this.stompClient) {
                this.stompClient.deactivate();
                console.log("Disconnected");
            }
        }
        sendMessage() {
            if (this.stompClient && this.stompClient.connected && this.messageContent) {
                this.stompClient.publish({
                    destination: '/app/edit',
                    body: JSON.stringify({ 'content': this.messageContent })
                });
                this.messageContent = '';
            }
        }
        showMessage(message) {
            this.messages.push(message.content);
        }
        format(command) {
            document.execCommand(command, false, '');
        }
        exportDocument() {
            const content = this.editor.nativeElement.innerHTML;
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.html';
            a.click();
            URL.revokeObjectURL(url);
        }
        onContentChange(event) {
            console.log('Content changed:', event.target.innerHTML);
        }
    };
    __setFunctionName(_classThis, "EditorComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _editor_decorators = [(0, core_1.ViewChild)('editor')];
        __esDecorate(null, null, _editor_decorators, { kind: "field", name: "editor", static: false, private: false, access: { has: obj => "editor" in obj, get: obj => obj.editor, set: (obj, value) => { obj.editor = value; } }, metadata: _metadata }, _editor_initializers, _editor_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EditorComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EditorComponent = _classThis;
})();
exports.EditorComponent = EditorComponent;
