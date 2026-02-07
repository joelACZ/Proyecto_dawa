import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
//import { jwtDecode } from 'jwt-decode';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5257/api/Auth'; //URL de la API de autenticación
  private tokenKey = 'token';


  constructor(private http: HttpClient, private router: Router) {}

// PETEICION POR POST PARA INICIAR SESION, SE ENVIA EL USUARIO Y CONTRASEÑA, Y SE ESPERA RECIBIR UN TOKEN EN LA RESPUESTA
  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password });
  }

//LEE EL STRING QUE SE GENERA EM EL TOKEN Y LO GUARDA EN EL LOCALSTORAGE PARA USARLO EN LAS PETICIONES PROTEGIDAS POR AUTENTICACION, COMO LOS ENDPOINTS DE LA API QUE REQUIEREN UN TOKEN VALIDO EN EL HEADER
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

//LEE EL TOKEN GUARDADO EN EL LOCALSTORAGE, SI NO HAY NINGUN TOKEN GUARDADO, DEVUELVE NULL                        
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

//ELIMINA EL TOKEN DEL LOCALSTORAGE, LO QUE EFECTIVAMENTE CIERRA LA SESION DEL USUARIO, Y REDIRIGE AL USUARIO A LA PAGINA DE LOGIN
  logout(): void {          
    localStorage.removeItem(this.tokenKey);                                                                                                                              
    this.router.navigate(['/login']);// rredireccion a login 
  }

//VERIFICA SI EL USUARIO ESTA LOGUEADO, LO HACE VERIFICANDO SI HAY UN TOKEN VALIDO EN EL LOCALSTORAGE, SI HAY UN TOKEN, DEVUELVE TRUE, SI NO HAY NINGUN TOKEN O EL
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

//EXTRAER EL ROL DEL USUARIO DEL TOKEN, PARA SABER SI ES ADMINISTRADOR O USUARIO NORMAL, LO HACE DECODIFICANDO
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['role'] || null; //Porque ClaimTypes.Role se serializa como role en el JWT
  }

//EXTRAER EL NOMBRE DE USUARIO DEL TOKEN, PARA MOSTRARLO EN LA INTERFAZ DE USUARIO O PARA USARLO EN LAS PETICIONES A LA API QUE REQUIEREN EL NOMBRE DE USUARIO, LO HACE DECODIFICANDO EL TOKEN Y OBTENIENDO EL VALOR DEL CLAIM QUE CONTIENE EL NOMBRE DE USUARIO, QUE GENERALMENTE SE SERIALIZA COMO "username" EN EL JWT
  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['username'] || null; 
  }
}
