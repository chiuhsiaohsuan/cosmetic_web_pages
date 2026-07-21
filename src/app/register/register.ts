import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule, RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {


  name = '';
  birthday = '';
  email = '';
  password = '';
  phone = '';
  confirmPassword = '';

  constructor(
    private api: ApiService,
    private router: Router
  ){}



  register(){
      if(this.password !== this.confirmPassword){

        alert("兩次密碼輸入不一致");

        return;

      }

    this.api.register(
      this.name,
      this.birthday,
      this.password,
      this.phone,
      this.email
    )
    .subscribe({

      next:(res:any)=>{

        console.log("註冊成功",res);

        alert("註冊成功");

        this.router.navigate(['/login']);

      },


      error:(err)=>{

        console.log(err);

        alert("註冊失敗");

      }

    });


  }


}