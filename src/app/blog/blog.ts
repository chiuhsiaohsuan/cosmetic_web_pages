import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-blog',
  imports: [],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit {

  articles = [
    {
      id:1,
      title:'玻尿酸保養成分解析',
      description:'了解玻尿酸保濕原理，以及如何選擇適合自己的保養產品。',
      category:'knowledge',
      date:'2026.07.10',
      image:'example.jpg'
    },
    {
      id:2,
      title:'2026美容保養新趨勢',
      description:'探索AI科技、生技研發與智慧美容帶來的新世代保養方式。',
      category:'trend',
      date:'2026.07.05',
      image:'pic.jpg'
    },
    {
      id:3,
      title:'使用精華液30天心得分享',
      description:'消費者實際使用心得，分享肌膚保養前後的變化。',
      category:'share',
      date:'2026.06.20',
      image:'example.jpg'
    }
  ];
  categories = [
    { name:'使用者分享', value:'share' },
    { name:'保養知識', value:'knowledge' },
    { name:'保養趨勢', value:'trend' }
  ];

  selectedCategory = signal('share');


  constructor(
    private route: ActivatedRoute
  ){}


  ngOnInit(){

    this.route.queryParams.subscribe(params=>{

      this.selectedCategory.set(
        params['category'] ?? 'share'
      );

    });

  }
  changeCategory(category:string){

    this.selectedCategory.set(category);

  }

  filteredArticles = computed(()=>{

    const category = this.selectedCategory();

    return this.articles.filter(
      article => article.category === category
    );

  });

}