export type Locale = 'he' | 'en';

type Dict = Record<string, Record<Locale, string>>;

// Minimal centralized dictionary
const dict: Dict = {
  login_title: { he: 'ברוכים הבאים', en: 'Welcome Back' },
  login_subtitle: { he: 'התחבר לחשבון שלך', en: 'Sign in to your account' },
  email: { he: 'אימייל', en: 'Email' },
  password: { he: 'סיסמה', en: 'Password' },
  sign_in: { he: 'התחבר', en: 'Sign In' },
  login_demo: { he: 'התחבר עם חשבון דמו', en: 'Login with Demo Account' },
  forgot_password: { he: 'שכחת סיסמה?', en: 'Forgot password?' },
  reset_password: { he: 'איפוס סיסמה', en: 'Reset Password' },
  new_password: { he: 'סיסמה חדשה', en: 'New Password' },
  confirm_password: { he: 'אשר סיסמה', en: 'Confirm Password' },
  submit: { he: 'שלח', en: 'Submit' },
  register_title: { he: 'צור חשבון', en: 'Create Account' },
  name: { he: 'שם', en: 'Name' },
  register: { he: 'הירשם', en: 'Register' },
};

export function t(key: keyof typeof dict, locale: Locale): string {
  const entry = dict[key];
  return entry ? entry[locale] : String(key);
}


