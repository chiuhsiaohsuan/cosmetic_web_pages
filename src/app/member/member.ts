import { Component, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-member',
  imports: [CommonModule, FormsModule],
  templateUrl: './member.html',
  styleUrl: './member.css',
})
export class Member{
  user = signal<any>({
    name:'',
    email:'',
    phone:''
  });

  constructor(
    private http: HttpClient
  ){}

  ngOnInit(){

    this.loadUser();

  }

  //取得會員資料
  loadUser(){

    const token = localStorage.getItem('token');

    this.http.get(

      `${environment.apiUrl}/user`,

      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }

    )
    .subscribe({

      next:(res:any)=>{


        this.user.set(res);


      },

      error:(err)=>{

        console.log(err);

      }

    });


  }

  //修改會員資料
  updateUser(){

    const token = localStorage.getItem('token');

    this.http.put(

      `${environment.apiUrl}/user/update`,

      this.user(),

      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }

    )
    .subscribe({

      next:(res:any)=>{

        alert("會員資料修改成功");

      },

      error:(err)=>{

        console.log(err);

      }

    });

  }

}
