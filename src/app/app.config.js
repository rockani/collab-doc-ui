"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const http_1 = require("@angular/common/http");
const app_routes_1 = require("./app.routes");
const platform_browser_1 = require("@angular/platform-browser");
const auth_1 = require("@angular/fire/auth");
exports.appConfig = {
    providers: [(0, core_1.provideZoneChangeDetection)({ eventCoalescing: true }), (0, router_1.provideRouter)(app_routes_1.routes), (0, platform_browser_1.provideClientHydration)((0, platform_browser_1.withEventReplay)()), (0, http_1.provideHttpClient)(), auth_1.AuthModule]
};
