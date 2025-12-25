import { Routes } from '@angular/router';
import { Products } from './products/products';
import { Home } from './home/home';
import { ProductDetail } from './product-detail/product-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'products', component: Products },
  { path: 'product/:id', component: ProductDetail },
  { path: '**', redirectTo: '' }
];
