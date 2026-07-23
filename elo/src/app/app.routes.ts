import { Routes } from '@angular/router';
import { ContactListComponent } from './contact-list.component';
import { ContactFormComponent } from './contact-form.component';

export const routes: Routes = [
  { path: '', component: ContactListComponent },
  { path: 'novo', component: ContactFormComponent },
  { path: 'editar/:id', component: ContactFormComponent },
  { path: '**', redirectTo: '' },
];
