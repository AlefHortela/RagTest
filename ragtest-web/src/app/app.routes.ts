import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'occurrences' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'occurrences',
    canActivate: [authGuard],
    loadComponent: () => import('./occurrences/occurrence-list/occurrence-list').then((m) => m.OccurrenceList),
  },
  {
    path: 'occurrences/new',
    canActivate: [authGuard],
    loadComponent: () => import('./occurrences/occurrence-form/occurrence-form').then((m) => m.OccurrenceForm),
  },
  {
    path: 'occurrences/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./occurrences/occurrence-detail/occurrence-detail').then((m) => m.OccurrenceDetail),
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./chat/chat').then((m) => m.Chat),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./settings/settings').then((m) => m.Settings),
  },
  { path: '**', redirectTo: 'occurrences' },
];
