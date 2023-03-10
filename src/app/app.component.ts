import { Component, OnInit } from '@angular/core';
import { questions } from './utility/questions';
import { ptype } from './utility/ptype';
import { NgxBootstrapExpandedFeaturesService as BEFService } from 'ngx-bootstrap-expanded-features';

export interface IAnswer {
  index: number;
  question: string;
  answer: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [BEFService],
})
export class AppComponent implements OnInit {
  public questions: string[] = questions;
  public answers: IAnswer[] = this.questions.map((q, i) => {
    return {
      index: i,
      question: q,
      answer: '',
    };
  });
  public currentAnswer: number = 0;
  public finished: boolean = false;
  public consola: string = '';
  public ptype: string = ptype;
  public importInput: string = '';
  public hasAnswers: boolean = false;

  constructor(private _befService: BEFService) {}

  ngOnInit(): void {}

  getCurrentAnswer(): IAnswer {
    let answer = this.answers.find((a) => a.index === this.currentAnswer);
    while (!answer) {
      if (this.currentAnswer < 0) {
        this.currentAnswer = 0;
      } else {
        this.currentAnswer--;
      }
      answer = this.answers.find((a) => a.index === this.currentAnswer);
    }
    this.cssCreate();
    return answer;
  }

  changeCurrentAnswer(type: '+' | '-' | 'reset') {
    this.currentAnswer =
      type === '+'
        ? this.currentAnswer + 1
        : type === '-'
        ? this.currentAnswer - 1
        : 0;
    if (this.currentAnswer === 0) {
      this.finished = false;
    }
    this.cssCreate();
  }

  answerQuestion(answer: string) {
    this.hasAnswers = true;
    this.getCurrentAnswer().answer = answer;
    if (this.answers[this.currentAnswer + 1]) {
      this.changeCurrentAnswer('+');
    } else {
      this.finalizar();
    }
  }

  finalizar(imported: boolean = false) {
    this.finished = true;
    this.getAnswers(imported);
  }

  getAnswers(imported: boolean = false) {
    this.consola = 'Ya se pueden exportar sus respuestas.';
    if (!imported) {
      this.writeText();
    }
  }

  importAnswers() {
    try {
      if (this.importInput === '') {
        throw new Error('No has escrito nada.');
      }
      let newAnswers = JSON.parse(this.importInput);
      if (!newAnswers || !newAnswers[0]) {
        throw new Error('Lo que has escrito no es v??lido, por favor rev??salo.');
      }
      if (this.answers.length !== newAnswers.length) {
        throw new Error(
          'No hay la misma cantidad de preguntas que en el formato normal, por favor rev??salo.'
        );
      }
      for (let nA of newAnswers) {
        this.answers[nA.index].answer = nA.answer;
      }
      if (!this.checkIfAllEmpty()) {
        this.finalizar(true);
      }
      this.cssCreate();
    } catch (error) {
      this.consola =
        'Hay un error con las respuestas que quieres importar:\n' + error;
    }
  }

  clearAnswers() {
    for (let a of this.answers) {
      a.answer = '';
    }
    this.hasAnswers = false;
    this.finished = false;
    this.consola = '';
  }

  getCell(i: number, ix: number): number {
    return i === 10 ? i * parseInt(ix + 1 + '') : parseInt(ix + '' + i);
  }

  getPuntuation(i: number): number {
    let ixs: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let puntuation: number = 0;
    for (let ix of ixs) {
      if (
        (this.answers[this.getCell(i, ix) - 1].answer === 'si' &&
          this.ptype[this.getCell(i, ix) - 1] === 'A') ||
        (this.answers[this.getCell(i, ix) - 1].answer === 'no' &&
          this.ptype[this.getCell(i, ix) - 1] === 'B')
      ) {
        puntuation++;
      }
    }
    return puntuation;
  }

  checkIfAllEmpty(): boolean {
    return (
      this.answers.filter((a) => {
        return a.answer !== '';
      }).length <= 0
    );
  }

  handleFileSelect(evt: any) {
    var files = evt.target.files;
    var f = files[0];
    var reader = new FileReader();

    reader.readAsText(f);
    reader.onload = ((f) => {
      return (e: any) => {
        this.importInput = e.target.result;
        this.importAnswers();
      };
    })(f);
  }

  writeText() {
    let answers: any[] = JSON.parse(JSON.stringify(this.answers));
    for (let a of answers) {
      delete a.question;
    }
    const str = JSON.stringify(answers);
    const FileSaver = require('file-saver');
    const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'IdeasIrracionales.txt');
  }

  cssCreate() {
    this._befService.cssCreate();
  }
}
