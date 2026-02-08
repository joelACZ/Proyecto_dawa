import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../services/auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
 constructor(private authService: AuthService) {}


  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken(); // obtiene el token guardado


    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // agrega encabezado Authorization
        }
      });


      return next.handle(cloned); // continúa con la solicitud modificada
    }


    return next.handle(req); // si no hay token, envía la solicitud original
  }
}
