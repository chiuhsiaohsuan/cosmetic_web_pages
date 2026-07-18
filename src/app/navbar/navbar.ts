import { Component, HostListener, signal, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  private cartService = inject(CartService);
  cartCount = this.cartService.totalQuantity;
  /** 漢堡選單 */
  isMenuOpen = signal(false);

  /** 手機版 Accordion */
  aboutOpen = signal(false);
  blogOpen = signal(false);

  /** 開關 Drawer */
  toggleMenu(): void {
    const open = !this.isMenuOpen();

    this.isMenuOpen.set(open);

    // 關閉時收起所有子選單
    if (!open) {
      this.closeSubMenus();
    }

    // 防止背景滾動
    document.body.style.overflow = open ? 'hidden' : '';
  }

  /** 關閉 Drawer */
  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.closeSubMenus();
    document.body.style.overflow = '';
  }

  /** 關於我們 */
  toggleAbout(event: Event): void {

    event.preventDefault();
    event.stopPropagation();

    this.aboutOpen.update(v => !v);

      if(this.aboutOpen()){
          this.blogOpen.set(false);
      }

  }

  /** 部落格 */
  toggleBlog(event: Event): void {

    if (window.innerWidth > 768) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.blogOpen.update(v => !v);

    if (this.blogOpen()) {
      this.aboutOpen.set(false);
    }
  }

  /** 收合全部子選單 */
  private closeSubMenus(): void {
    this.aboutOpen.set(false);
    this.blogOpen.set(false);
  }

  /** 視窗放大回桌機 */
  @HostListener('window:resize')
  onResize(): void {

    if (window.innerWidth > 768) {

      this.aboutOpen.set(false);
      this.blogOpen.set(false);

      this.isMenuOpen.set(false);

      document.body.style.overflow = '';
    }

  }
  isLogin = signal(false);
  userName = '';
  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.auth.loginStatus$
      .subscribe(status => {

        this.isLogin.set(status);

        if (status) {
          this.userName = this.auth.getUserName();

          const user = this.auth.getUser();

          if (user) {
            this.cartService.loadCart(user.id);
          }

        } else {

          this.userName = '';

          this.cartService.clearCart();

        }

      });
  }

  logout() {
    this.auth.logout();
    this.cartService.clearCart();
  }

}