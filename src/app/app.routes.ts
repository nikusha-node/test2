import { Routes } from '@angular/router';
import { Products } from './products/products';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'products', component: Products },
  { path: 'product/:id', component: Home }, // Temporary, will create product details later
  { path: '**', redirectTo: '' }
];
