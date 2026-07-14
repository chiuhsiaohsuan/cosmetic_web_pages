import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import{ News } from './news/news';
import{ Product } from './product/product';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'about', component: About},
    {path: 'news', component: News},
    {path: 'product', component: Product},
];
