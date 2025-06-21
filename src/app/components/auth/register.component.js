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
exports.RegisterComponent = void 0;
const forms_1 = require("@angular/forms");
const common_1 = require("@angular/common");
const auth_module_1 = require("../../../auth.module");
const auth_1 = require("@angular/fire/auth");
const core_1 = require("@angular/core");
const http_1 = require("@angular/common/http");
let RegisterComponent = (() => {
    let _classDecorators = [(0, core_1.Component)({
            selector: 'app-register',
            standalone: true,
            imports: [forms_1.FormsModule, common_1.CommonModule, forms_1.ReactiveFormsModule, auth_module_1.AuthModule],
            providers: [auth_module_1.AuthModule],
            templateUrl: './register.component.html',
            styleUrls: ['./register.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RegisterComponent = _classThis = class {
        constructor(fb, authService, router) {
            this.fb = fb;
            this.authService = authService;
            this.router = router;
            this.isSignUpMode = true;
            this.email = '';
            this.loading = false;
            this.verified = false;
            this.message = 'Verifying Email';
            this.isEmailVerified = false;
            this.errorMessage = '';
            this.auth = (0, core_1.inject)(auth_1.Auth);
            this.http = (0, core_1.inject)(http_1.HttpClient);
            this.apiUrl = 'http://localhost:8080/users';
            this.username = 'admin'; // Replace with actual username
            this.password = 'admin'; // Replace with actual password
            this.registerForm = this.fb.group({
                email: ['', [forms_1.Validators.required, forms_1.Validators.email]],
                password: ['', [forms_1.Validators.required, forms_1.Validators.minLength(6)]],
                confirmPassword: [''] // Only used in Sign Up mode
            });
            //authService.setAuth(this.auth);
        }
        toggleMode() {
            this.isSignUpMode = !this.isSignUpMode;
            if (!this.isSignUpMode) {
                this.registerForm.removeControl('confirmPassword');
            }
            else {
                this.registerForm.addControl('confirmPassword', this.fb.control('', forms_1.Validators.required));
            }
        }
        submitForm() {
            const { email, password } = this.registerForm.value;
            if (this.isSignUpMode) {
                // Sign Up Logic
                this.authService.signUp(this.auth, email, password)
                    .then(userCredential => {
                    const user = userCredential.user;
                    this.saveUser(user.uid, user.email || "", user.displayName || "", user.photoURL || "")
                        .subscribe(() => {
                        this.router.navigate(['/dashboard']); // ✅ Redirect only if API succeeds
                    }, error => {
                        this.showError("Failed to register user. Internal error occurred.");
                        console.error("User API Error:", error);
                    });
                })
                    .catch(error => {
                    this.showError("Failed to sign up. " + error.message);
                    console.error("Sign Up Error:", error);
                });
            }
            else {
                // Sign In Logic
                this.authService.signIn(email, password)
                    .then(userCredential => {
                    const user = userCredential.user;
                    this.saveUser(user.uid, user.email || "", user.displayName || "", user.photoURL || "")
                        .subscribe(() => {
                        this.router.navigate(['/dashboard']); // ✅ Redirect only if API succeeds
                    }, error => {
                        this.showError("Failed to log in user. Internal error occurred.");
                        console.error("User API Error:", error);
                    });
                })
                    .catch(error => {
                    this.showError("Failed to sign in. " + error.message);
                    console.error("Sign In Error:", error);
                });
            }
        }
        showError(message) {
            this.errorMessage = message;
            setTimeout(() => this.errorMessage = "", 5000); // Hide after 5 seconds
        }
        saveUser(uid, email, displayName, photoURL) {
            const headers = new http_1.HttpHeaders({
                Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
            });
            const documentData = { "id": uid, "email": email, "displayName": displayName, "photoURL": photoURL };
            return this.http.post(`${this.apiUrl}`, documentData, { headers });
        }
        // createUserInDB(uid: string, email: string, displayName: string, photoURL: string): Promise<any> {
        //   return fetch('/users', {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify({ uid, email, displayName, photoURL })
        //   }).then(response => {
        //       if (!response.ok) {
        //           throw new Error("Failed to create user in DB");
        //       }
        //       return response.json();
        //   });
        // }
        signUp(auth, email, password) {
            return __awaiter(this, void 0, void 0, function* () {
                this.loading = true;
                try {
                    const userCredential = yield (0, auth_1.createUserWithEmailAndPassword)(this.auth, email, password);
                    const user = userCredential.user;
                    yield (0, auth_1.sendEmailVerification)(user);
                    this.checkVerification(user);
                    return userCredential;
                }
                catch (error) {
                    console.error('Error during signup:', error);
                    this.loading = false;
                    return Promise.reject(error);
                }
            });
        }
        checkVerification(user) {
            const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield user.reload();
                if (user.emailVerified) {
                    clearInterval(interval);
                    this.loading = false;
                    this.verified = true;
                    this.message = 'Verified!';
                    setTimeout(() => {
                        this.router.navigate(['/dashboard']);
                    }, 1000);
                }
            }), 2000);
        }
        signInWithGoogle() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                try {
                    const provider = new auth_1.GoogleAuthProvider();
                    const result = yield (0, auth_1.signInWithPopup)(this.auth, provider);
                    // Check if it's a new user or an existing user
                    const isNewUser = (_a = (0, auth_1.getAdditionalUserInfo)(result)) === null || _a === void 0 ? void 0 : _a.isNewUser;
                    if (result.user) {
                        const firstName = ((_b = result.user.displayName) === null || _b === void 0 ? void 0 : _b.split(' ')[0]) || 'Unknown';
                        const lastName = ((_c = result.user.displayName) === null || _c === void 0 ? void 0 : _c.split(' ')[1]) || 'Unknown';
                        console.log('User First Name:', firstName);
                        console.log('User Last Name:', lastName);
                        if (isNewUser) {
                            console.log('New user signed up via Google');
                            this.saveUser(result.user.uid, result.user.email || "", result.user.displayName || "", result.user.photoURL || "").
                                subscribe((response) => console.log(response), error => console.log(error));
                            // You can store additional user data in Firestore if needed
                        }
                        else {
                            console.log('Existing user logged in via Google');
                        }
                        // Redirect to dashboard after login/signup
                        this.router.navigate(['/dashboard']);
                    }
                }
                catch (error) {
                    console.error('Google Sign-In Error:', error);
                }
            });
        }
    };
    __setFunctionName(_classThis, "RegisterComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RegisterComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RegisterComponent = _classThis;
})();
exports.RegisterComponent = RegisterComponent;
