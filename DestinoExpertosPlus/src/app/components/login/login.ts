import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form: FormGroup;
  error: string | null = null;


  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  onSubmit(): void {
    if (this.form.valid) {
      const { username, password } = this.form.value;
      this.auth.login(username, password).subscribe({//savetoken guardar el token en el localstorage, y redireccionar a la pagina principal
        next: res => {
          this.auth.saveToken(res.token);
          this.router.navigate(['/']);
        },
        error: err => {
          this.error = 'Credenciales inválidas';
        }
      });
    }
  }


}


