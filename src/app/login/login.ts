import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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

        next: () => {

          this.api.getMe().subscribe({

          next: (res: any) => {

              this.auth.setUser(res.user);

              if (res.user.role === 'admin') {
                  this.router.navigate(['/admin/products']);
              } else {
                  this.router.navigate(['/']);
              }

          },

            error: () => {

              alert('無法取得使用者資料');

            }

          });

        },

        error: (err) => {

          alert(err.error.message);

        }

      });

  }

}