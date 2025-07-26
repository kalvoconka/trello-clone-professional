export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  // Username: 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password: string): boolean => {
  // Password: at least 6 characters
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  // Name: 1-50 characters, no special validation needed
  return name.trim().length >= 1 && name.trim().length <= 50;
};

export interface ValidationErrors {
  email?: string;
  username?: string;
  password?: string;
  name?: string;
}

export const validateRegisterData = (data: {
  email: string;
  username: string;
  password: string;
  name: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  }

  if (!validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (!validateName(data.name)) {
    errors.name = 'Name must be between 1 and 50 characters';
  }

  return errors;
};