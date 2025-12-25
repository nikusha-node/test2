import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Services } from '../services/services';
import { Product, ApiResponse } from '../model/model.interface';
import { BehaviorSubject, catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit, OnDestroy {
  public getToDoListServ = inject(Services);
  public router = inject(Router);
  public activatedRoute = inject(ActivatedRoute);
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
  public currentPage: number = 1;
  public itemsPerPage: number = 12;

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
          this.initializeFromQueryParams();
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

    // Listen for query parameter changes
    this.activatedRoute.queryParams.subscribe(params => {
      this.updateFiltersFromParams(params);
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeFromQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.updateFiltersFromParams(params);
      this.applyFilters();
    });
  }

  updateFiltersFromParams(params: any) {
    this.searchTerm = params['search'] || '';
    this.minPrice = params['minPrice'] ? Number(params['minPrice']) : null;
    this.maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : null;
    this.selectedCategory = params['category'] || '';
    this.selectedBrand = params['brand'] || '';
    this.sortOrder = params['sort'] || 'asc';
    this.currentPage = params['page'] ? Number(params['page']) : 1;
  }

  updateQueryParams() {
    const params: any = {};
    
    if (this.searchTerm) params['search'] = this.searchTerm;
    if (this.minPrice) params['minPrice'] = this.minPrice;
    if (this.maxPrice) params['maxPrice'] = this.maxPrice;
    if (this.selectedCategory) params['category'] = this.selectedCategory;
    if (this.selectedBrand) params['brand'] = this.selectedBrand;
    if (this.sortOrder !== 'asc') params['sort'] = this.sortOrder;
    if (this.currentPage !== 1) params['page'] = this.currentPage;

    this.router.navigate(['/products'], { queryParams: params });
  }

  sortProducts(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.filteredProducts = [...this.filteredProducts].sort((a, b) => {
      return order === 'asc' 
        ? a.price.current - b.price.current
        : b.price.current - a.price.current;
    });
    this.updateQueryParams();
  }

  navigateToProductDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  extractCategoriesAndBrands() {
    this.categories = [...new Set(this.products.map(p => p.category.name))];
    this.brands = [...new Set(this.products.map(p => p.brand))];
  }

  applyFilters() {
    console.log('Applying filters with query params...');
    
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
    this.currentPage = 1;
    this.sortOrder = 'asc';
    this.filteredProducts = [...this.products];
    this.sortProducts('asc');
    this.updateQueryParams();
  }

  // Pagination methods
  get paginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateQueryParams();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
