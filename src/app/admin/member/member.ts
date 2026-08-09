import { Component, signal  } from '@angular/core';
import { Router } from '@angular/router';
import { AdminMemberService } from '../../services/admin-member';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-member',
  imports: [],
  templateUrl: './member.html',
  styleUrl: './member.css',
})
export class  AdminMemberComponent {
  users = signal<any[]>([]);
  selectedUser = signal<any>(null);

  constructor(
    private adminMemberService: AdminMemberService,
    private authService: AuthService,
    private router: Router
  ){}


  ngOnInit(){

    this.adminMemberService.getUsers()
    .subscribe(data=>{

      this.users.set(data);

    });

  }
  showDetail(user:any){

    this.selectedUser.set(user);

  }

  closeDetail(){

    this.selectedUser.set(null);

  }
  changeStatus(user:any){

      const newStatus =
      user.status === 'active'
      ? 'disabled'
      : 'active';

      this.adminMemberService
      .updateStatus(user.id,newStatus)
      .subscribe({
        next: () => {
          this.users.update(users =>
            users.map(item =>
              item.id === user.id
                ? {
                    ...item,
                    status:newStatus
                  }
                : item
            )
          );

          if (newStatus === 'disabled') {
            const currentUser = this.authService.getUser();
            if (currentUser && currentUser.id === user.id) {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              this.authService.logout();
              window.location.href = '/login';
            }
          }
        },
        error: () => {
          alert('更新會員狀態失敗');
        }
      });

  }
  deleteUser(user:any){
      const confirmDelete =
      confirm(
          `確定刪除 ${user.name} ?`
      );
      if(!confirmDelete){
          return;
      }
      this.adminMemberService
      .deleteUser(user.id)
      .subscribe(()=>{
          this.users.update(users=>

              users.filter(
                  item=>item.id !== user.id
              )

          );

      });

  }
}
