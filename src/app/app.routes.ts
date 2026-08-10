import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import{ News } from './news/news';
import{ Product } from './product/product';
import{ ProductDetail } from './product-detail/product-detail';
import{ Login } from './login/login';
import{ Register } from './register/register';
import{ ForgotPassword } from './login/forgot-password';
import{ Team } from './about/team/team';
import{ Vision } from './about/vision/vision';
import{ Blog } from './blog/blog'; 
import{ Cart } from './cart/cart';
import { ProductEdit } from './admin/products/product-edit/product-edit';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { ProductAdd } from './admin/products/product-add/product-add';
import { ProductList } from './admin/products/product-list/product-list';
import { AdminOrders } from './admin/orders/admin-orders';
import { AdminOrderAdd } from './admin/orders/admin-order-add/admin-order-add';
import { MainLayout } from './main-layout/main-layout';
import { adminGuard } from './admin/guard';
import {  AdminMemberComponent } from './admin/member/member';
import { Member } from './member/member';
import { Checkout } from './checkout/checkout';
import { Payment } from './payment/payment';
import { Orders } from './orders/orders';
import { ResetPasswordComponent } from './reset-password/reset-password';
import { LocationComponent } from './about/location/location';

export const routes: Routes = [
  {
  path: '',
  component: MainLayout,
  children: [
    { path: '', component: Home },
    { path: 'about', component: About },
    { path: 'about/team', component: Team },
    { path: 'about/vision', component: Vision },
    { path: 'news', component: News },
    { path: 'product', component: Product },
    { path: 'product/:id', component: ProductDetail },
    { path: 'login', component: Login },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'register', component: Register },
    { path: 'blog', component: Blog },
    { path: 'cart', component: Cart },
    { path: 'member', component: Member },
    { path: 'checkout', component: Checkout },
    { path: 'payment/:orderId', component: Payment },
    { path: 'orders', component: Orders },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'about/location', component: LocationComponent }
  ]
  },
  { path:'admin', component: AdminLayout,
    canActivate: [adminGuard],
    children:[
    {
      path:'',
      redirectTo:'products',
      pathMatch:'full'
    },
    {
      path:'products/add',
      component:ProductAdd
    },

    {
      path:'products/edit/:id',
      component:ProductEdit
    },

    {
      path:'products',
      component:ProductList
    },
    {
      path:'orders/add',
      component: AdminOrderAdd
    },
    {
      path:'orders',
      component: AdminOrders
    },
    {
      path:'members',
      component: AdminMemberComponent
    }
   ]
  }
];
