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
exports.AuthService = void 0;
const core_1 = require("@angular/core");
const auth_1 = require("@angular/fire/auth");
const router_1 = require("@angular/router");
const rxjs_1 = require("rxjs");
let AuthService = (() => {
    let _classDecorators = [(0, core_1.Injectable)({
            providedIn: 'root',
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor() {
            this.router = (0, core_1.inject)(router_1.Router);
            this.auth = (0, core_1.inject)(auth_1.Auth);
            this.currentUser = new rxjs_1.BehaviorSubject(null);
            this.user$ = (0, auth_1.user)(this.auth); // Observes the auth state
            (0, auth_1.onAuthStateChanged)(this.auth, (user) => {
                this.currentUser.next(user);
            });
        }
        getCurrentUserUID() {
            return this.currentUser.asObservable().pipe((0, rxjs_1.map)(user => user ? user.uid : null) // Extract UID safely
            );
        }
        // getCurrentUserUID(): Observable<User | null> {
        //   return this.currentUser.asObservable();
        // }
        // getCurrentUserUID(): string | null {
        //   return this.auth.currentUser ? this.auth.currentUser.uid : null;
        // }
        // setAuth(auth: Auth) {
        //   this.auth = auth; // Manually assign Auth
        // }
        // ✅ Sign in with Google
        googleSignIn() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const provider = new auth_1.GoogleAuthProvider();
                    const result = yield (0, auth_1.signInWithPopup)(this.auth, provider);
                    console.log("Google Sign-In Successful", result);
                    this.router.navigate(['/dashboard']);
                }
                catch (error) {
                    console.error("Google Sign-In Error", error);
                }
            });
        }
        // ✅ Sign up with Email (Send Verification Email)
        signUpWithEmail(email) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const userCredential = yield (0, auth_1.createUserWithEmailAndPassword)(this.auth, email, 'temporaryPassword');
                    yield (0, auth_1.sendEmailVerification)(userCredential.user);
                    console.log("Verification email sent!");
                    return true;
                }
                catch (error) {
                    console.error("Sign-Up Error", error);
                    return false;
                }
            });
        }
        // ✅ Complete Sign-Up After Email Verification
        completeSignUp(email, password) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const userCredential = yield (0, auth_1.signInWithEmailAndPassword)(this.auth, email, 'temporaryPassword');
                    yield (0, auth_1.updatePassword)(userCredential.user, password);
                    console.log("Password set successfully!");
                    this.router.navigate(['/dashboard']);
                }
                catch (error) {
                    console.error("Complete Sign-Up Error", error);
                }
            });
        }
        // ✅ Sign in with Email & Password
        signInWithEmail(email, password) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield (0, auth_1.signInWithEmailAndPassword)(this.auth, email, password);
                    console.log("Email Sign-In Successful");
                    this.router.navigate(['/dashboard']);
                }
                catch (error) {
                    console.error("Sign-In Error", error);
                }
            });
        }
        logout() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.auth.signOut();
                this.router.navigate(['/login']);
            });
        }
        checkVerification(user) {
            return setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield user.reload();
            }));
        }
        signUp(auth, email, password) {
            return __awaiter(this, void 0, void 0, function* () {
                return (0, auth_1.createUserWithEmailAndPassword)(this.auth, email, password);
                // this.loading = true;
                // try {
                //   const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
                //   const user = userCredential.user;
                //   await sendEmailVerification(user);
                //   this.checkVerification(user);
                //   return userCredential;
                // } catch (error) {
                //   console.error('Error during signup:', error);
                //   this.loading = false;
                //   return Promise.reject(error);
                // }
            });
        }
        signIn(email, password) {
            return (0, auth_1.signInWithEmailAndPassword)(this.auth, email, password);
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
