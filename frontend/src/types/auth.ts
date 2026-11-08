export type LoginRequest = {
  username: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: 'bearer';
};

export type User = {
  id: number;
  username: string;
  is_active: boolean;
};
