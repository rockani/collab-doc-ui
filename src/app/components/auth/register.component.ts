import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthModule } from  '../../../auth.module';
import { Auth, createUserWithEmailAndPassword, getAdditionalUserInfo, getAuth, GoogleAuthProvider, provideAuth, sendEmailVerification, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { error } from 'console';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule,ReactiveFormsModule,AuthModule],
  providers: [AuthModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSignUpMode: boolean = true; 
  
  email: string = '';
  loading: boolean = false;
  verified: boolean = false;
  message: string = 'Verifying Email';
  isEmailVerified: boolean = false;
  errorMessage: string = '';
  auth = inject(Auth);
  http = inject(HttpClient); 
  
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''] // Only used in Sign Up mode
    });
    //authService.setAuth(this.auth);
  }
  private apiUrl = 'http://localhost:8080/users';
  private username = 'admin'; // Replace with actual username
  private password = 'admin'; // Replace with actual password

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
    if (!this.isSignUpMode) {
      this.registerForm.removeControl('confirmPassword');
    } else {
      this.registerForm.addControl('confirmPassword', this.fb.control('', Validators.required));
    }
  }
  
  submitForm() {
    const { email, password } = this.registerForm.value;

    if (this.isSignUpMode) {
        // Sign Up Logic
        this.authService.signUp(this.auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            this.saveUser(user.uid, user.email || "", user.displayName || "", user.photoURL || "")
                .subscribe(
                    () => {
                        this.router.navigate(['/dashboard']); // ✅ Redirect only if API succeeds
                    },
                    error => {
                        this.showError("Failed to register user. Internal error occurred.");
                        console.error("User API Error:", error);
                    }
                );
        })
        .catch(error => {
            this.showError("Failed to sign up. " + error.message);
            console.error("Sign Up Error:", error);
        });

    } else {
        // Sign In Logic
         this.authService.signIn(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                this.saveUser(user.uid, user.email||"", user.displayName || "", user.photoURL || "")
                    .subscribe(() => {
                        this.router.navigate(['/dashboard']); // ✅ Redirect only if API succeeds
                    },
                    error => {
                        this.showError("Failed to log in user. Internal error occurred.");
                        console.error("User API Error:", error);
                    });
            })
            .catch(error => {
                this.showError("Failed to sign in. " + error.message);
                console.error("Sign In Error:", error);
            });
    }
  }
  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = "", 5000); // Hide after 5 seconds
  }
  confirmPassword: any;
  
  saveUser(uid: string, email: string, displayName: string, photoURL: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.username}:${this.password}`)
    });

    const documentData = { "id": uid, "email": email, "displayName": displayName, "photoURL": photoURL };

    return this.http.post(`${this.apiUrl}`, documentData, { headers });
}
  // createUserInDB(uid: string, email: string, displayName: string, photoURL: string): Promise<any> {
  //   return fetch('/users', {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ uid, email, displayName, photoURL })
  //   }).then(response => {
  //       if (!response.ok) {
  //           throw new Error("Failed to create user in DB");
  //       }
  //       return response.json();
  //   });
  // }
  async signUp(auth: Auth, email: any, password: any):Promise<UserCredential> {
    this.loading = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      this.checkVerification(user);
      return userCredential;
    } catch (error) {
      console.error('Error during signup:', error);
      this.loading = false;
      return Promise.reject(error);
    }
  }

  checkVerification(user: any) {
    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        this.loading = false;
        this.verified = true;
        this.message = 'Verified!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      }
    }, 2000);
  }
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      // Check if it's a new user or an existing user
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
      
      if (result.user) {
        const firstName = result.user.displayName?.split(' ')[0] || 'Unknown';
        const lastName = result.user.displayName?.split(' ')[1] || 'Unknown';
        console.log('User First Name:', firstName);
        console.log('User Last Name:', lastName);

        if (isNewUser) {
          console.log('New user signed up via Google');
          this.saveUser(result.user.uid,result.user.email||"",result.user.displayName||"",result.user.photoURL||"").
          subscribe((response)=>console.log(response),
          error=>console.log(error));
          // You can store additional user data in Firestore if needed
        } else {
          console.log('Existing user logged in via Google');

        }

        // Redirect to dashboard after login/signup
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  }
  // ✅ Google Sign-Up
  // googleSignUp() {
  //   this.authService.googleSignIn();
  // }

  // // ✅ Sign-Up Step 1: Send Verification Email
  // async sendVerificationEmail() {
  //   const result = await this.authService.signUpWithEmail(this.email);
  //   if (result) {
  //     alert("Verification email sent! Please check your email.");
  //   }
  // }

  // // ✅ Sign-Up Step 2: Complete Sign-Up with Password
  // completeSignUp() {
  //   this.authService.completeSignUp(this.email, this.password);
  // }
}
