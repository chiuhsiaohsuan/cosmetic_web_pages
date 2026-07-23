import { Component, resource } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
 constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}
  login() {

    this.api.login(this.email, this.password)
      .subscribe({

        next: (res:any) => {

          this.auth.login(res.token, res.user);


          if(res.user.role === "admin") {

            this.router.navigate([
              "/admin/products"
            ]);

          } else {

            this.router.navigate([
              "/"
            ]);

          }

        },

        error: () => {

          alert("帳號或密碼錯誤");

        }

      });

  }
}
