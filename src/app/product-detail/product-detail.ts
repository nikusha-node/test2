import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Services } from '../services/services';
import { Product } from '../model/model.interface';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit, OnDestroy {
  public getToDoListServ = inject(Services);
  public router = inject(Router);
  public activatedRoute = inject(ActivatedRoute);
  public product: Product | null = null;
  public hasError: boolean = false;
  public loading: boolean = false;
  public destroy$ = new Subject<void>();
  public productId: string = '';

  ngOnInit() {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.loadProductDetails();
    } else {
      this.hasError = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProductDetails() {
    this.loading = true;
    this.getToDoListServ
      .getProductById(this.productId)
      .pipe(
        takeUntil(this.destroy$),
        tap((product: Product) => {
          this.product = product;
          this.hasError = false;
        }),
        catchError((error) => {
          console.error('Product detail API Error:', error);
          this.hasError = true;
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return `Only ${stock} left`;
    return 'In Stock';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStarRating(rating: number): number[] {
    const fullStars = Math.round(rating);
    return Array(5).fill(0).map((_, i) => i < fullStars ? 1 : 0);
  }
}
