import { Routes } from '@angular/router';
import { adminGuard } from './admin/guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
      { path: 'about', loadComponent: () => import('./about/about').then((m) => m.About) },
      { path: 'about/team', loadComponent: () => import('./about/team/team').then((m) => m.Team) },
      { path: 'about/vision', loadComponent: () => import('./about/vision/vision').then((m) => m.Vision) },
      { path: 'about/location', loadComponent: () => import('./about/location/location').then((m) => m.LocationComponent) },
      { path: 'news', loadComponent: () => import('./news/news').then((m) => m.News) },
      { path: 'product', loadComponent: () => import('./product/product').then((m) => m.Product) },
      { path: 'product/:id', loadComponent: () => import('./product-detail/product-detail').then((m) => m.ProductDetail) },
      { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
      { path: 'forgot-password', loadComponent: () => import('./login/forgot-password').then((m) => m.ForgotPassword) },
      { path: 'register', loadComponent: () => import('./register/register').then((m) => m.Register) },
      { path: 'blog', loadComponent: () => import('./blog/blog').then((m) => m.Blog) },
      { path: 'blog/:id', loadComponent: () => import('./article-detail/article-detail').then((m) => m.ArticleDetail) },
      { path: 'cart', loadComponent: () => import('./cart/cart').then((m) => m.Cart) },
      { path: 'member', loadComponent: () => import('./member/member').then((m) => m.Member) },
      { path: 'checkout', loadComponent: () => import('./checkout/checkout').then((m) => m.Checkout) },
      { path: 'payment/:orderId', loadComponent: () => import('./payment/payment').then((m) => m.Payment) },
      { path: 'orders', loadComponent: () => import('./orders/orders').then((m) => m.Orders) },
      { path: 'reset-password', loadComponent: () => import('./reset-password/reset-password').then((m) => m.ResetPasswordComponent) },
      { path: 'analysis', loadComponent: () => import('./analysis/analysis').then((m) => m.Analysis) },
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products/add', loadComponent: () => import('./admin/products/product-add/product-add').then((m) => m.ProductAdd) },
      { path: 'products/edit/:id', loadComponent: () => import('./admin/products/product-edit/product-edit').then((m) => m.ProductEdit) },
      { path: 'products', loadComponent: () => import('./admin/products/product-list/product-list').then((m) => m.ProductList) },
      { path: 'orders/add', loadComponent: () => import('./admin/orders/admin-order-add/admin-order-add').then((m) => m.AdminOrderAdd) },
      { path: 'orders', loadComponent: () => import('./admin/orders/admin-orders').then((m) => m.AdminOrders) },
      { path: 'members', loadComponent: () => import('./admin/member/member').then((m) => m.AdminMemberComponent) },
      { path: 'articles', loadComponent: () => import('./admin/articles/articles').then((m) => m.AdminArticlesComponent) },
      { path: 'articles/add', loadComponent: () => import('./admin/articles/admin-article-add/admin-article-add').then((m) => m.AdminArticleAddComponent) },
      { path: 'articles/edit/:id', loadComponent: () => import('./admin/articles/admin-article-edit/admin-article-edit').then((m) => m.AdminArticleEditComponent) },
      { path: 'news', loadComponent: () => import('./admin/news/admin-news').then((m) => m.AdminNews) }
    ]
  }
];
