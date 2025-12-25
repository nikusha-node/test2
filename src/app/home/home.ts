import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { Services } from '../services/services';
import { Product, ApiResponse } from '../model/model.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
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

  // Filter properties
  public searchTerm: string = '';
  public minPrice: number | null = null;
  public maxPrice: number | null = null;
  public selectedCategory: string = '';
  public selectedBrand: string = '';
  public categories: string[] = [];
  public brands: string[] = [];

  ngOnInit() {
    this.loading = true;
    this.getToDoListServ
      .getAllProducts()
      .pipe(
        takeUntil(this.destroy$),
        tap((data: ApiResponse) => {
          this.products = data.products;
          this.filteredProducts = [...data.products];
          this.extractCategoriesAndBrands();
          this.hasError = false;
        }),
        catchError((error) => {
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
    this.filteredProducts = [...this.filteredProducts].sort((a, b) => {
      return order === 'asc' 
        ? a.price.current - b.price.current
        : b.price.current - a.price.current;
    });
  }

  navigateToProductDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  navigateToAllProducts() {
    this.router.navigate(['/products']);
  }

  extractCategoriesAndBrands() {
    this.categories = [...new Set(this.products.map(p => p.category.name))];
    this.brands = [...new Set(this.products.map(p => p.brand))];
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      // Search filter
      const matchesSearch = !this.searchTerm || 
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Price range filter
      const matchesMinPrice = !this.minPrice || product.price.current >= this.minPrice;
      const matchesMaxPrice = !this.maxPrice || product.price.current <= this.maxPrice;

      // Category filter
      const matchesCategory = !this.selectedCategory || 
        product.category.name === this.selectedCategory;

      // Brand filter
      const matchesBrand = !this.selectedBrand || 
        product.brand === this.selectedBrand;

      return matchesSearch && matchesMinPrice && matchesMaxPrice && 
             matchesCategory && matchesBrand;
    });

    // Apply current sort order
    this.sortProducts(this.sortOrder);
  }

  clearFilters() {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.filteredProducts = [...this.products];
    this.sortOrder = 'asc';
    this.sortProducts('asc');
  }

}