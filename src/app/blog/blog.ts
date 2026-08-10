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
      title:'2026美容保養新趨勢',
      description:'探索AI科技、生技研發與智慧美容帶來的新世代保養方式。',
      category:'trend',
      date:'2026.07.05',
      image:'pic.jpg'
    }
  ];
  categories = [
    { name:'保養趨勢', value:'trend' }
  ];

  selectedCategory = signal('trend');


  constructor(
    private route: ActivatedRoute
  ){}


  ngOnInit(){

    this.route.queryParams.subscribe(params=>{

      this.selectedCategory.set(
        params['category'] ?? 'trend'
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