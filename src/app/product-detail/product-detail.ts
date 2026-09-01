import { Component, OnInit, signal, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart';
import { AuthService } from '../services/auth';
import { Location } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../enviroments/enviroment';


@Component({
  selector: 'app-product-detail',
  imports: [],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product = signal<any>(null);
  quantity = signal(1);
  detailImages = signal<any[]>([]);
  environment = environment;
  activeTab = signal('feature');

  constructor(
    private route: ActivatedRoute,
    public productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private location: Location,
    private title: Title, 
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ){}

  changeTab(tab: string) {
    this.activeTab.set(tab);
  }
  goBack() {
    this.location.back();
  }
  addCart(){
      if(!this.authService.isLogin()){

      alert("請先登入");

      return;

    }

    const item = {

      ...this.product(),

      quantity:this.quantity()

    };

    this.cartService.addToCart(item);

  }
  increase(){

    this.quantity.update(q => q + 1);

  }
  decrease(){

    this.quantity.update(q => {

      if(q > 1){
        return q - 1;
      }

      return q;
      });

  }

  ngOnInit(){
    this.route.params.subscribe(params=>{
      const id = Number(params['id']);
      if (!Number.isInteger(id) || id <= 0) { 
        this.setDefaultSeo(); return; 
      }
      this.productService.getProductById(id).subscribe({

        next:(data)=>{
          if (!data) { this.setDefaultSeo(); return; }
   
          this.product.set(data);
          this.setProductSeo(data, id);

            // 取得產品特色圖片
          this.productService.getDetailImages(data.id).subscribe({

            next:(images)=>{
              
              this.detailImages.set(images);

            },

            error:(err)=>{

              console.log('取得特色圖片失敗', err);

            }

          });


        },

        error:(err)=>{
            console.log(err);
            this.setDefaultSeo();
        }

      });

    });

  }
  private setProductSeo(product: any, id: number): void {
    const productName = this.getProductName(product);
    const description = this.createDescription(product, productName);
    const canonicalUrl = `https://chengyi-group.com.tw/product/${id}`;
    this.title.setTitle(`${productName}｜承檍`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: `${productName}｜承檍` });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.setCanonical(canonicalUrl);
  }
  private getProductName(product: any): string { 
    return ( product.name || product.productName || product.product_name || '美容保養產品' ); 
  }
  private setDefaultSeo(): void {
    const title = '美容保養產品｜承檍';
    const description = '探索承檍美容保養產品，了解產品特色、使用方式與肌膚管理資訊。';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.setCanonical( 'https://chengyi-group.com.tw/product' );
  }
  private createDescription( product: any, productName: string ): string { 
    const rawDescription = product.description || product.productDescription || product.product_description || ''; 
    const description = String(rawDescription) .replace(/<[^>]*>/g, '') .replace(/\s+/g, ' ') .trim(); 
    if (description) { 
      return description.slice(0, 160); 
    } 
    return `了解 ${productName} 的商品資訊、產品特色與使用方式，探索適合你的美容保養產品。`; 
  }
  private setCanonical(url: string): void { 
    let canonicalLink = 
      this.document.querySelector( 'link[rel="canonical"]' ) as HTMLLinkElement | null; 
    if (!canonicalLink) { 
      canonicalLink = this.document.createElement('link'); 
      canonicalLink.setAttribute( 'rel', 'canonical' ); 
      this.document.head.appendChild(canonicalLink); 
    } 
    canonicalLink.setAttribute('href', url); 
  } 
}
