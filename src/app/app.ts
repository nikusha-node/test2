import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './home/home';
import { Products } from './products/products';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Home, Products],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('routing');
}
