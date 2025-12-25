import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Product } from '../model/model.interface';

@Injectable({
  providedIn: 'root',
})
export class Services {
public http = inject(HttpClient)

  public getAllProducts(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      "https://api.everrest.educata.dev/shop/products/all"
    )
  }

  public getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(
      `https://api.everrest.educata.dev/shop/products/id/${id}`
    )
  }
}
