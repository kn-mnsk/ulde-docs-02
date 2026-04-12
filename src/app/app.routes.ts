import { Routes } from '@angular/router';
import { UldeViewer } from './ulde/angular/ulde-viewer/ulde-viewer';
import { DocsViewer } from './docs-viewer/docs-viewer';
import { PageNotFound } from './page-not-found/page-not-found';
import { Error } from './page-error/error';

export const routes: Routes = [
{
    path: 'home',
    // title: docsTitleResolver,
    title: 'home-UldeDocsV2',
    loadComponent:  () => import('./docs-viewer/docs-viewer').then(m => m.DocsViewer)
  },
  {
    path: "fallback",
    title: "Page Not Found",
    component: PageNotFound
  },
  {
    path: 'error',
    title: 'Error on Page',
    component: Error
  },
    {
    path: '',
    redirectTo: "home",
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: "fallback"
  }
];
