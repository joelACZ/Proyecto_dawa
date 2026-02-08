import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form: FormGroup;
  error: string | null = null;
  isLoading: boolean = false; // Para mostrar spinner

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.error = null;
      
      const { username, password } = this.form.value;
      
      this.auth.login(username, password).subscribe({
        next: (res: any) => {
          this.auth.saveToken(res.token);
          this.redirectBasedOnRole();
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
          console.error('Error en login:', err);
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    }
  }

  private redirectBasedOnRole(): void {
    const userRole = this.auth.getUserRole();
    this.isLoading = false;

    // Redirigir según el rol del usuario
    switch(userRole) {
      case 'Administrador':
        this.router.navigate(['/menu']); // O puedes usar '/crud-clientes'
        break;
      case 'Profesional':
        this.router.navigate(['/crud-solicitudes']);
        break;
      case 'Cliente':
        this.router.navigate(['/crud-solicitudes']);
        break;
      default:
        // Si no se reconoce el rol, redirigir al menú
        console.warn('Rol no reconocido:', userRole);
        this.router.navigate(['/menu']);
    }
  }

  // Método para limpiar el error
  clearError(): void {
    this.error = null;
  }
}