import { Component, signal  } from '@angular/core';
import { AdminMemberService } from '../../services/admin-member';

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
    private adminMemberService: AdminMemberService
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
      .subscribe(()=>{
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
