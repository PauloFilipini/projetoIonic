import { Usuario } from './module/usuario.model';
import {Injectable} from '@angular/core'
import {Router} from '@angular/router'
import * as firebase from 'firebase'
import { AlertController } from '@ionic/angular';


@Injectable()
export class Autenticacao {

    public token_id: string 
    
    constructor(private router: Router,
        public alertController: AlertController){}
    

    public cadastrarUsuario(usuario: Usuario): Promise<any> {
       return firebase.auth().createUserWithEmailAndPassword(usuario.email, usuario.senha)
        .then((resposta:any) =>{
            // removendo senha do atributo senha do objeto do usuario
            delete usuario.senha

            // registrando dados complementares do usuario no path email na base64
            firebase.database().ref(`usuario_detalhe/${btoa(usuario.email)}`)
            .set(usuario)
        })
        .catch((error: Error)=> {
            this.presentAlert()
        })
    }
    public autenticar(email:string, senha:string): void { 
        firebase.auth().signInWithEmailAndPassword(email,senha)
        .then((resposta: any) => {
            firebase.auth().currentUser.getIdToken()
            .then((idToken: string) => {
                this.token_id = idToken
                localStorage.setItem('idToken' , idToken)
                this.router.navigate(['/home'])
            })
        })
        .catch((error: Error) => 
            {
                this.presentAlert()
            })
    }
    public autenticado(): boolean {
        if(this.token_id === undefined && localStorage.getItem('idToken') != null){
            this.token_id = localStorage.getItem('idToken')
        }
        if(this.token_id === undefined){
            this.router.navigate(['/'])
        }
        return this.token_id !== undefined
    }
    public sair(): void{
        firebase.auth().signOut()
            .then(() => {
                localStorage.removeItem('idToken')
                this.token_id = undefined
                this.router.navigate(['/login'])
            })
    }
    async presentAlert() {
        const alert = await this.alertController.create({
          header: 'Alert',
          message: 'Dados Incorretos!!',
          buttons: ['OK']
        });
    
        await alert.present();
      }
    }
