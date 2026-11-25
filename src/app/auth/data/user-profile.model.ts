export interface UserProfile {
  readonly uid: string;
  readonly email: string;
  readonly username: string;
  readonly phone: string | null;
  readonly birthDate: string | null;
  readonly city: string | null;
  readonly createdAt: number;
}

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface SignUpData extends Credentials {
  readonly username: string;
  readonly phone: string;
  readonly birthDate: string;
  readonly city: string;
}
