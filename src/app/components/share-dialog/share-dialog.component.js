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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareDialogComponent = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
let ShareDialogComponent = (() => {
    let _classDecorators = [(0, core_1.Component)({
            selector: 'app-share-dialog',
            templateUrl: './share-dialog.component.html',
            imports: [forms_1.FormsModule, common_1.CommonModule],
            styleUrls: ['./share-dialog.component.css'],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ShareDialogComponent = _classThis = class {
        constructor(dialogRef, data, http) {
            this.dialogRef = dialogRef;
            this.data = data;
            this.http = http;
            this.email = '';
            this.errorMessage = '';
            this.loading = false; // Spinner state
            this.selectedRole = "Viewer";
        }
        shareDocument() {
            var _a, _b;
            if (!this.email || !this.selectedRole) {
                this.errorMessage = 'Please enter an email and select a role.';
                return;
            }
            if (!this.validateEmail(this.email)) {
                this.errorMessage = 'Invalid email address!';
                return;
            }
            this.loading = true; // Show spinner
            this.errorMessage = ''; // Reset error message
            const postBody = {
                _id: (_a = this.data) === null || _a === void 0 ? void 0 : _a.docId, // Use optional chaining to avoid errors
                ownerId: (_b = this.data) === null || _b === void 0 ? void 0 : _b.ownerId,
                sharedWith: this.email,
                role: this.selectedRole
            };
            // Debugging log (remove this in production)
            console.log("Sharing Document Request:", JSON.stringify(postBody));
            this.loading = true; // Show spinner while request is in progress
            this.http.post(`http://localhost:8080/documents/share`, postBody).subscribe({
                next: () => {
                    this.loading = false; // Hide spinner
                    this.dialogRef.close(this.email); // Close dialog on success
                },
                error: (error) => {
                    this.loading = false; // Hide spinner
                    console.error("Error Sharing Document:", error);
                    this.errorMessage = 'User does not exist or sharing failed!'; // Show error
                }
            });
        }
        closeDialog() {
            this.dialogRef.close();
        }
        validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
    };
    __setFunctionName(_classThis, "ShareDialogComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ShareDialogComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ShareDialogComponent = _classThis;
})();
exports.ShareDialogComponent = ShareDialogComponent;
