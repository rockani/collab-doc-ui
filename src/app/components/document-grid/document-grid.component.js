"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentGridComponent = void 0;
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
const common_1 = require("@angular/common");
const forms_1 = require("@angular/forms");
const share_dialog_component_1 = require("../share-dialog/share-dialog.component");
let DocumentGridComponent = (() => {
    let _classDecorators = [(0, core_1.Component)({
            selector: 'app-document-grid',
            imports: [common_1.CommonModule, forms_1.FormsModule],
            templateUrl: './document-grid.component.html',
            styleUrls: ['./document-grid.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _documents_decorators;
    let _documents_initializers = [];
    let _documents_extraInitializers = [];
    let _closeMenus_decorators;
    let _onScroll_decorators;
    var DocumentGridComponent = _classThis = class {
        applyFilter() {
            this.documents = [];
            this.page = 0;
            this.pageSize = 8;
            this.loading = false;
            this.allLoaded = false;
            if (this.selectedFilter == "shared") {
                this.loadMoreSharedDocs();
            }
            else {
                this.loadMore();
            }
        }
        openShareDialog(id, event) {
            event.stopPropagation(); // Prevent click from propagating to the document card
            console.log("Stopped Propogation");
            this.menuOpenMap[id] = false; // Close menu before opening dialog
            const dialogRef = this.dialog.open(share_dialog_component_1.ShareDialogComponent, {
                width: '600px',
                data: { docId: id, ownerId: this.ownerId },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    console.log('Shared with:', result);
                }
            });
        }
        toggleMenu(event, docId) {
            event.stopPropagation(); // Prevent click from propagating to the document card
            if (this.menuOpenMap[docId] == undefined)
                this.menuOpenMap[docId] = true;
            else
                this.menuOpenMap[docId] = !this.menuOpenMap[docId]; // Toggle for specific document
        }
        closeMenus(event) {
            this.menuOpenMap = {}; // Close all menus when clicking outside
        }
        constructor(http, router, authService, dialog) {
            this.http = (__runInitializers(this, _instanceExtraInitializers), http);
            this.router = router;
            this.authService = authService;
            this.dialog = dialog;
            this.documents = __runInitializers(this, _documents_initializers, []);
            this.filteredDocuments = (__runInitializers(this, _documents_extraInitializers), []); // Store filtered documents
            this.selectedFilter = 'owned'; // Default filter
            this.menuOpenMap = {}; // Track state per doc
            this.page = 0;
            this.pageSize = 8;
            this.loading = false;
            this.allLoaded = false; // Stop further loading if no more data
            this.username = 'admin'; // Replace with actual username
            this.password = 'admin'; // Replace with actual password
            this.ownerId = null;
        }
        ngOnInit() {
            this.authService.getCurrentUserUID().subscribe((uid) => {
                if (uid) {
                    this.ownerId = uid;
                    this.loadMore(); // Now called only after ownerId is set
                }
            });
            //this.loadMore();
        }
        onScroll() {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !this.loading && !this.allLoaded) {
                console.log("scrolled");
                if (this.selectedFilter == "owned") {
                    this.loadMore();
                }
                else {
                    this.loadMoreSharedDocs();
                }
            }
        }
        loadMore() {
            if (this.loading || this.allLoaded)
                return;
            const headers = new http_1.HttpHeaders({
                'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
                'Content-Type': "application/json"
            });
            this.loading = true;
            this.http.get(`http://localhost:8080/documents/metadata?ownerId=${this.ownerId}&page=${this.page}&size=${this.pageSize}`, { headers })
                .subscribe((data) => {
                console.log(data);
                if (data.content.length === 0) {
                    this.allLoaded = true; // Stop if no more data
                }
                else {
                    this.documents = [...this.documents, ...data.content];
                    this.page++;
                }
                this.loading = false;
            }, (error) => {
                console.error('Error fetching documents', error);
                this.loading = false;
            });
        }
        loadMoreSharedDocs() {
            if (this.loading || this.allLoaded)
                return;
            const headers = new http_1.HttpHeaders({
                'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
                'Content-Type': "application/json"
            });
            this.loading = true;
            this.http.get(`http://localhost:8080/shared-documents?userUID=${this.ownerId}&page=${this.page}&size=${this.pageSize}`, { headers })
                .subscribe((data) => {
                console.log(data);
                if (data.content.length === 0) {
                    this.allLoaded = true; // Stop if no more data
                }
                else {
                    this.documents = [...this.documents, ...data.content];
                    this.page++;
                }
                this.loading = false;
            }, (error) => {
                console.error('Error fetching documents', error);
                this.loading = false;
            });
        }
        opendoc(doc) {
            this.router.navigate(['/editor', doc.id]);
        }
    };
    __setFunctionName(_classThis, "DocumentGridComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _documents_decorators = [(0, core_1.Input)()];
        _closeMenus_decorators = [(0, core_1.HostListener)('document:click', ['$event'])];
        _onScroll_decorators = [(0, core_1.HostListener)('window:scroll', ['$event'])];
        __esDecorate(_classThis, null, _closeMenus_decorators, { kind: "method", name: "closeMenus", static: false, private: false, access: { has: obj => "closeMenus" in obj, get: obj => obj.closeMenus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onScroll_decorators, { kind: "method", name: "onScroll", static: false, private: false, access: { has: obj => "onScroll" in obj, get: obj => obj.onScroll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _documents_decorators, { kind: "field", name: "documents", static: false, private: false, access: { has: obj => "documents" in obj, get: obj => obj.documents, set: (obj, value) => { obj.documents = value; } }, metadata: _metadata }, _documents_initializers, _documents_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DocumentGridComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DocumentGridComponent = _classThis;
})();
exports.DocumentGridComponent = DocumentGridComponent;
