"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const login_component_1 = require("./components/auth/login.component");
const register_component_1 = require("./components/auth/register.component");
const dashboard_component_1 = require("./components/dashboard/dashboard.component");
const editor_component_1 = require("./components/editor/editor.component");
const permissions_component_1 = require("./components/permissions/permissions.component");
const cloud_component_1 = require("./components/cloud/cloud.component");
exports.routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'register', component: register_component_1.RegisterComponent },
    { path: 'dashboard', component: dashboard_component_1.DashboardComponent },
    { path: 'editor/:id', component: editor_component_1.EditorComponent,renderMode: 'no-prerender' },
    { path: 'permissions', component: permissions_component_1.PermissionsComponent },
    { path: 'cloud', component: cloud_component_1.CloudStorageComponent },
    { path: '**', redirectTo: 'dashboard' }
];
