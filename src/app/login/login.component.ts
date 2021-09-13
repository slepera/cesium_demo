import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private _router: Router, private http: HttpClient) { }

  ngOnInit(): void {
  }

  form: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  submit() {
    if (this.form.valid) {
      // this.http.get("http://localhost:8080/demo/login?name="+this.form.value.username+"&password="+this.form.value.password, { responseType: 'text' }).subscribe(val => {
      // if(val !== "not ok"){
      //     if(val == 'user'){
      //       console.log("Welcome, you're an user!");
      //     }else{
      //       console.log("Welcome, you're an admin!");
      //     }
      //     this._router.navigate(['home']);
      //   } else {
      //     this.error = "Wrong Username or Password!!!"
      //   }
      // });
      if((this.form.value.username=='INSURE')&&(this.form.value.password=='password'))
      {
        this._router.navigate(['home']);
      }
      else
      {
        this.error = "Wrong Username or Password!!!"
      }
      this.submitEM.emit(this.form.value);
    }
  }
  @Input() error: string | null;

  @Output() submitEM = new EventEmitter();
}
