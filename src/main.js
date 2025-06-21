"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform_browser_1 = require("@angular/platform-browser");
const router_1 = require("@angular/router");
const app_component_1 = require("./app/app.component");
const app_routes_1 = require("./app/app.routes");
const http_1 = require("@angular/common/http");
const app_1 = require("@angular/fire/app");
const auth_1 = require("@angular/fire/auth");
const firestore_1 = require("@angular/fire/firestore");
const storage_1 = require("@angular/fire/storage");
const environment_1 = require("./environment"); //Import the environment file
const auth_module_1 = require("./auth.module");
const core_1 = require("@angular/core");
(0, platform_browser_1.bootstrapApplication)(app_component_1.AppComponent, {
    providers: [
        (0, http_1.provideHttpClient)(),
        (0, router_1.provideRouter)(app_routes_1.routes),
        (0, core_1.importProvidersFrom)(auth_module_1.AuthModule),
        (0, app_1.provideFirebaseApp)(() => (0, app_1.initializeApp)(environment_1.environment.firebaseConfig)),
        (0, auth_1.provideAuth)(() => (0, auth_1.getAuth)()),
        (0, firestore_1.provideFirestore)(() => (0, firestore_1.getFirestore)()),
        (0, storage_1.provideStorage)(() => (0, storage_1.getStorage)())
    ],
}).catch(err => console.error(err));
