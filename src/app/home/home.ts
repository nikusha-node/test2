import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { Services } from '../services/services';
import { ApiResponse, Product } from '../model/model.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit , OnDestroy{
public getToDoListServ = inject(Services);
  public router = inject(Router);
  public products: Product[] = [];
  public filteredProducts: Product[] = [];
  public hasError: boolean = false;
  public loading: boolean = false;
  public destroy$ = new Subject<void>();
  public sortOrder: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.loading = true;
    this.getToDoListServ
      .getAllProducts()
      .pipe(
        takeUntil(this.destroy$),
        tap((data: ApiResponse) => {
          this.products = data.products;
          this.filteredProducts = [...data.products];
          this.hasError = false;
        }),
        catchError(() => {
          this.hasError = true;
          return of('error');
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sortProducts(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.filteredProducts = [...this.products].sort((a, b) => {
      return order === 'asc' 
        ? a.price.current - b.price.current
        : b.price.current - a.price.current;
    });
  }

  navigateToProductDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

}