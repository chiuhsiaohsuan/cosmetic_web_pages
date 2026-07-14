import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements AfterViewInit {

  ngAfterViewInit(): void {

    const observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        } else {
          entry.target.classList.remove('show');
        }

      });

    }, {
      threshold: 0.3
    });

    document.querySelectorAll('.fade-section').forEach(item => {
      observer.observe(item);
    });

  }

}