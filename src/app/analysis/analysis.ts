import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-analysis',
  imports: [FormsModule],
  templateUrl: './analysis.html',
  styleUrl: './analysis.css',
})
export class Analysis {
  currentQuestion = signal(1);

  answers = {
      age: '',
      feel: '',
      problem: [] as string[],
      routine: ''
  };
  nextQuestion() {

      if (this.currentQuestion() < 4) {
          this.currentQuestion.update(value => value + 1);
      }

  }
  previousQuestion() {

      if (this.currentQuestion() > 1) {
          this.currentQuestion.update(value => value - 1);
      }

  }
  toggleProblem(value: string) {

      const index = this.answers.problem.indexOf(value);

      if (index === -1) {

          this.answers.problem.push(value);

      } else {

          this.answers.problem.splice(index, 1);

      }

  }
  submitTest() {

      console.log('肌膚檢測結果：', this.answers);
  }
}
