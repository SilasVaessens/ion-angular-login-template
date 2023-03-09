import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

export interface credentials {
  email: string;
  password: string;
}

export enum registerError {
  invalid,
  weak,
  used,
  internal,
  unknown,
}

export enum resetResult {
  invalid,
  notFound,
  internal,
  unknown,
  succes,
}

export enum resetConfirm {
  expired,
  invalid,
  notFound,
  weak,
  unknown,
  internal,
  succes,
}

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  user: BehaviorSubject<UserCredential | null> =
    new BehaviorSubject<UserCredential | null>(null);
  readonly loginErrors = [
    'auth/user-not-found',
    'auth/invalid-email',
    'auth/wrong-password',
  ];
  readonly internalError = 'auth/internal-error';

  constructor(private auth: Auth) {}

  async register(credentials: credentials) {
    try {
      return await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            return registerError.used;
          case 'auth/invalid-email':
            return registerError.invalid;
          case 'auth/weak-password':
            return registerError.weak;
          case this.internalError:
            return registerError.internal;
          default:
            return registerError.unknown;
        }
      }
      return registerError.unknown;
    }
  }

  async login(credentials: credentials) {
    try {
      const user = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      this.user.next(user);
      return user;
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (this.loginErrors.includes(error.code)) {
          return 'Email en/of wachtwoord is incorrect.';
        } else if (error.code === this.internalError) {
          return 'Interne error, controleer je verbinding.';
        }
        return 'Onbekende error.';
      }
      return 'Onbekende error.';
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email, );
      return resetResult.succes;
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            return resetResult.invalid;
          case this.internalError:
            return resetResult.internal;
          case 'auth/user-not-found':
            return resetResult.notFound;
          default:
            return resetResult.unknown;
        }
      }
      return resetResult.unknown;
    }
  }

  async confirmResetPassword(code: string, password: string) {
    try {
      await confirmPasswordReset(this.auth, code, password);
      return resetConfirm.succes;
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/expired-action-code':
            return resetConfirm.expired;
          case 'auth/invalid-action-code':
            return resetConfirm.invalid;
          case 'auth/user-not-found':
            return resetConfirm.notFound;
          case 'auth/weak-password':
            return resetConfirm.weak
          case this.internalError:
            return resetConfirm.internal;
          default:
            return resetConfirm.unknown;
        }
      }
      return resetConfirm.unknown;
    }
  }
}
