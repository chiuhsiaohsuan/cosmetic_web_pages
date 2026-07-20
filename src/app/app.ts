import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { provideHttpClient, withInterceptors } 
from '@angular/common/http';

import { authInterceptor } 
from './auth-interceptor';


@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
export const appConfig = {

 providers:[
   provideHttpClient(
     withInterceptors([
       authInterceptor
     ])
   )
 ]

};