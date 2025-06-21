import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updatePassword, User, user, UserCredential, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthModule } from '@angular/fire/auth';
import { BehaviorSubject, map, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  router = inject(Router);
  auth =  inject(Auth);
  user$: Observable<User | null> | undefined;
  private currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  greeting: string = '';

  constructor() {
    this.user$ = user(this.auth); // Observes the auth state
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.next(user);
      if (user) {
        const name = user.displayName || "there";
        this.greeting = `Welcome, ${name}! 👋`;
      } else {
        this.greeting= "Welcome, guest!";
      }
    });
  }
  getGreeting(){
    return this.greeting;
  }
  getCurrentUserUID(): Observable<string | null> {
    return this.currentUser.asObservable().pipe(
      map(user => user ? user.uid : null) // Extract UID safely
    );
  }
  // getCurrentUserUID(): Observable<User | null> {
  //   return this.currentUser.asObservable();
  // }
  // getCurrentUserUID(): string | null {
  //   return this.auth.currentUser ? this.auth.currentUser.uid : null;
  // }

  // setAuth(auth: Auth) {
  //   this.auth = auth; // Manually assign Auth
  // }
  // ✅ Sign in with Google
  async googleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      console.log("Google Sign-In Successful", result);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error("Google Sign-In Error", error);
    }
  }

  // ✅ Sign up with Email (Send Verification Email)
  async signUpWithEmail(email: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, 'temporaryPassword');
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent!");
      return true;
    } catch (error) {
      console.error("Sign-Up Error", error);
      return false;
    }
  }

  // ✅ Complete Sign-Up After Email Verification
  async completeSignUp(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, 'temporaryPassword');
      await updatePassword(userCredential.user, password);
      console.log("Password set successfully!");
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error("Complete Sign-Up Error", error);
    }
  }

  // ✅ Sign in with Email & Password
  async signInWithEmail(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      console.log("Email Sign-In Successful");
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error("Sign-In Error", error);
    }
  }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
  checkVerification(user: any) {
    return setInterval(async () => {
      await user.reload();
    });
  }
  async signUp(auth: Auth, email: any, password: any):Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
    // this.loading = true;
    // try {
    //   const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    //   const user = userCredential.user;
    //   await sendEmailVerification(user);
    //   this.checkVerification(user);
    //   return userCredential;
    // } catch (error) {
    //   console.error('Error during signup:', error);
    //   this.loading = false;
    //   return Promise.reject(error);
    // }
  }

  signIn(email: string, password: string):Promise<UserCredential>{
    return signInWithEmailAndPassword(this.auth, email, password);
      
  }

}
