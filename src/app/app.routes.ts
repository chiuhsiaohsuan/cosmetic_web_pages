import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import{ News } from './news/news';
import{ Product } from './product/product';
import{ Login } from './login/login';
import{ Register } from './register/register';
import{ Team } from './about/team/team';
import{ Vision } from './about/vision/vision';
import{ Blog } from './blog/blog';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'about/team', component: Team },
  { path: 'about/vision', component: Vision },
  { path: 'news', component: News },
  { path: 'product', component: Product },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'blog', component: Blog}
];
