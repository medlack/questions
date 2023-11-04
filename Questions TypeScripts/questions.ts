import { Component } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { ActivatedRoute, Router } from '@angular/router';
import { interval } from 'rxjs';
import { ContentService } from '../services/content.service';
import { RecordData } from './question.model';
import { HttpClient } from '@angular/common/http';
import { RecordService } from '../services/record.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent {
  public name: any=[];
  
  public questionList : any = [];
  recordModelObj: RecordData = new RecordData;
  public currentQuestion : number = 0;
  public points: number = 0;
  counter=60;
  correctAnswer: number = 0;
  inCorrectAnswer: number = 0;
  interval : any;
  progress: string='0';
  isQuizCompleted: Boolean= false;
  isFailedQuiz: Boolean= false;
  isInstruction: Boolean= false;
  test: Number= 1;
  tests: Number= 2;
  ftest: Number=1;
  id: any;
  option: any;
  subjectName: string="";
  public content: any[]=[];
  contentS: number=0;
  currContent: any=[];
  nextContent: number=0;
  nextCon: Number= 0;
  subjectId: Number= 0;
  moduleId: Number= 0;
  score: string="";
  moduleName: any=[];
  result=false;
  contentIndex=0;
  lastRecordId=0;
  lastcontent=0;
  k=0;
  readonly baseURL = "http://127.0.0.1:8000/records";
  
  
  constructor(private questionService: QuestionService , private router: Router, private _http: HttpClient, private contentService: ContentService, private record: RecordService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.name = this.contentService.getName();
    this.id= this.route.snapshot.params['id']
    this.getAllQuestions()
    
    this.getAllQuestions();
    this.startCounter();
    this.subjectName =localStorage.getItem("subjectName")!;
    console.log(this.subjectName)
    this.moduleName= this.contentService.getModuleName()
 console.log("module Name"+this.contentService.getModuleName())
  }
getAllQuestions(){
  this.questionService.getOneQuestion(this.id)
  .subscribe(res=>{
    this.questionList = res;
    this.subjectId= this.questionList[0].subject_id
    this.moduleId= this.id
    console.log(this.subjectId)
    console.log(this.moduleId)
   // this.option= this.questionList.options
    this.contentS= this.questionList[0].content_id
    console.log(this.questionList)
    console.log("Current Question"+this.contentS)
  })
 /* setTimeout(() => {
    this.contentService.getOne(this.id).subscribe(data=>{
      this.currContent= data
      console.log("Current Content"+this.currContent)
    })
  }, 1000);*/
  
  
setTimeout(() => {
  
  this.contentService.getContent()
  .subscribe(res=>{
    this.content = res;
    this.contentIndex= res.length -1;
    this.lastcontent= res[this.contentIndex].id
    console.log(" Record in Number:"+this.contentS)
    for(let i=0; i<res.length -1; i++){
      if(this.contentS==res[i].id){
        this.k= res[i+1].id;
      }
    }
      //this.nextContent = this.findContent(this.contentS, res)
      //console.log("Next Content"+this.nextContent)
      console.log("Next Content"+this.k)
  })
  
  
}, 2000);
  setTimeout(() => {
    this.record.getRecord().subscribe(res=>{
      this.lastRecordId= res[this.contentIndex].content_id
      console.log(" Record in Question:"+this.lastRecordId)
    })
  }, 3000);
  
 
}
/*findContent(item:any, items: any){
var k

  for(let i=0; i<items.length -1; i++){
    if(item==item[i].id){
      return items[i+1];
    }
    console.log("Items"+i)
    
    
  }
   
  
}*/
addRecord() {
    
  this.recordModelObj.subject_id = this.subjectId;
  this.recordModelObj.content_id = this.moduleId;
  this.recordModelObj.score = this.points+10;

  this._http.post<any>(this.baseURL, this.recordModelObj).subscribe(res => {
    console.log(res);
    
      if(this.lastcontent==res.content_id){
        this.result=true
        this.router.navigate(['home'])
       
      }
    //alert("School Record Added Successfully");
    //this.toast.success({detail:"SUCCESS", summary: "Registration done Successfully", duration:5000})
    console.log("Record response"+res.content_id)
    let ref = document.getElementById('clear');
    ref?.click();
    
    

    //this.signupForm.reset()
    //this.router.navigate(['login'])
    //this.getAllData();
  },
    err => {
      alert("Error Occur, Try Again !")
      console.log(this.recordModelObj)
    }
  )


}

nextQuestion(){
  this.currentQuestion++;
}
previousQuestion(){
  this.currentQuestion--;
}
instruction(){
  this.isInstruction = true;
}
answer(currentQuestion:number,option:any){
  if(currentQuestion=== this.questionList.length && this.points >= 10){
    this.isQuizCompleted = true;
    this.addRecord();
    this.stopCounter();
    
      
    
    //window.location.reload();
  }
  if(currentQuestion=== this.questionList.length && this.points <= 10){
    this.isFailedQuiz = true;
    
    this.stopCounter();
  }
  if(option.correct){
    this.points+=10;
    this.correctAnswer++;
    
    
    
    
    setTimeout(() => {
      this.currentQuestion++
    //this.points = this.points + 10
    this.resetCounter();
    this.getProgressPercent();
    }, 1000);
    
  }else{
    setTimeout(() => {
      this.currentQuestion++;
    this.inCorrectAnswer++;
    this.resetCounter();
    this.getProgressPercent();
    }, 1000);
    
    this.points -= 10;
  }
}
startCounter(){
  this.interval = interval(1000)
  .subscribe(rel=>{
    this.counter--;
    if(this.counter==0){
      this.currentQuestion++;
      this.counter =60;
      this.points-=10;
    }

  });
  setTimeout(() => {
    this.interval.unsubscribe();
  }, 100000);
}
stopCounter(){
  this.interval.unsubscribe();
  this.counter=0;
}
resetCounter(){
  this.stopCounter();
  this.counter=60;
  this.startCounter();

}
resetQuiz(){
  this.resetCounter();
  this.getAllQuestions();
  this.points=0;
  this.counter=60;
  this.currentQuestion=0;
  this.progress='0';
}
getProgressPercent(){
  this.progress= [(this.currentQuestion/this.questionList.length)*100].toString();
  return this.progress;
}

}