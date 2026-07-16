import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { inject, provideAppInitializer } from '@angular/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { ThemeService } from './app/services/theme.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { customerAuthInterceptor } from './app/interceptors/customer-auth.interceptor';
import { CustomerStateService } from './app/services/customer-state.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([customerAuthInterceptor])),
    provideAppInitializer(() => {
      inject(ThemeService).init();
    }),
    provideAppInitializer(() => inject(CustomerStateService).initialize())
  ]
}).catch(error => console.error(error));
