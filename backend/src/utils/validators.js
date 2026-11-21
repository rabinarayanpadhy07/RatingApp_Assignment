/**
 * Validation rules:
 * - Name: Min 20 characters, Max 60 characters.
 * - Address: Max 400 characters.
 * - Password: 8-16 characters, must include at least one uppercase letter and one special character.
 * - Email: Must follow standard email validation rules.
 */

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 20 && trimmed.length <= 60;
};

const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return trimmed.length > 0 && trimmed.length <= 400;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/`~]/.test(password);
  return hasUppercase && hasSpecial;
};

const validateUserData = ({ name, email, password, address }) => {
  const errors = {};

  if (!name || !validateName(name)) {
    errors.name = 'Name must be between 20 and 60 characters.';
  }

  if (!email || !validateEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (password !== undefined) {
    if (!validatePassword(password)) {
      errors.password = 'Password must be 8-16 characters and contain at least one uppercase letter and one special character.';
    }
  }

  if (!address || !validateAddress(address)) {
    errors.address = 'Address cannot be empty and must not exceed 400 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateStoreData = ({ name, email, address }) => {
  const errors = {};

  if (!name || !validateName(name)) {
    errors.name = 'Store name must be between 20 and 60 characters.';
  }

  if (!email || !validateEmail(email)) {
    errors.email = 'Please provide a valid email address for the store.';
  }

  if (!address || !validateAddress(address)) {
    errors.address = 'Address cannot be empty and must not exceed 400 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
  validateUserData,
  validateStoreData
};
