/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePasswordStrength(password: string): string | null {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return "Паролата трябва да е минимум 8 символа";
  }

  if (!hasUpperCase || !hasLowerCase) {
    return "Паролата трябва да съдържа главни и малки букви";
  }

  if (!hasNumbers) {
    return "Паролата трябва да съдържа поне 1 цифра";
  }

  if (!hasSpecialChar) {
    return "Паролата трябва да съдържа поне 1 специален символ (!@#$%^&*...)";
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "12345678",
    "qwerty123",
    "password1",
    "admin123",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return "Тази парола е твърде често срещана. Изберете по-уникална парола";
  }

  return null; // Password is valid
}

/**
 * Get password strength score
 * @param password - Password to evaluate
 * @returns Strength score from 0 (weak) to 4 (very strong)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Normalize to 0-4 scale
  score = Math.min(4, score);

  const strengthMap = [
    { label: "Много слаба", color: "red" },
    { label: "Слаба", color: "orange" },
    { label: "Средна", color: "yellow" },
    { label: "Силна", color: "lightgreen" },
    { label: "Много силна", color: "green" },
  ];

  return {
    score,
    ...strengthMap[score],
  };
}
