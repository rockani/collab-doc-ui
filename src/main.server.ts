import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/editor.config.server';
import { AppComponent } from './app/app.component';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
