import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import{ News } from './news/news';
import{ Product } from './product/product';
import{ Login } from './login/login';
import{ Register } from './register/register';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'about', component: About},
    {path: 'news', component: News},
    {path: 'product', component: Product},
    {path: 'login', component: Login},
    {path: 'register', component: Register},
];
