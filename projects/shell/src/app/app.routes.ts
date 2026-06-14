import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

/**
 * The shell owns no feature code. Each route resolves a remote's exposed
 * route definitions at runtime from its remoteEntry.json (listed in
 * federation.manifest.json), so remotes deploy independently of the shell.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mail' },
  {
    path: 'mail',
    loadChildren: () =>
      loadRemoteModule({ remoteName: 'mail', exposedModule: './Routes' }).then((m) => m.routes),
  },
  {
    path: 'calendar',
    loadChildren: () =>
      loadRemoteModule({ remoteName: 'calendar', exposedModule: './Routes' }).then((m) => m.routes),
  },
  { path: '**', redirectTo: 'mail' },
];
