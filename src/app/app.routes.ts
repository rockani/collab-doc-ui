import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EditorComponent } from './components/editor/editor.component';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { CloudStorageComponent } from './components/cloud/cloud.component';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'editor/:id', component: EditorComponent },
  { path: 'permissions', component: PermissionsComponent },
  { path: 'cloud', component: CloudStorageComponent },
  { path: '**', redirectTo: 'dashboard' }
];
