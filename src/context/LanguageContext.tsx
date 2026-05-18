import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "es" | "en" | "ar" | "fr";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

type Dict = Record<string, Record<Lang, string>>;

const DICT: Dict = {
  language: { es: "Idioma", en: "Language", ar: "اللغة", fr: "Langue" },
  // Login / Register
  phone_ph: {
    es: "Ingrese su número de teléfono",
    en: "Please enter your phone number",
    ar: "الرجاء إدخال رقم هاتفك",
    fr: "Veuillez entrer votre numéro de téléphone",
  },
  password_ph: {
    es: "Ingrese su contraseña",
    en: "Please enter the login password",
    ar: "الرجاء إدخال كلمة المرور",
    fr: "Veuillez entrer le mot de passe",
  },
  confirm_ph: {
    es: "Confirme su contraseña",
    en: "Please confirm your password",
    ar: "تأكيد كلمة المرور",
    fr: "Veuillez confirmer votre mot de passe",
  },
  captcha_ph: {
    es: "Ingrese el código de verificación",
    en: "Please enter the verification code",
    ar: "الرجاء إدخال رمز التحقق",
    fr: "Veuillez entrer le code de vérification",
  },
  invite_ph: {
    es: "Ingrese el código de invitación",
    en: "Please enter the invitation code",
    ar: "الرجاء إدخال رمز الدعوة",
    fr: "Veuillez entrer le code d'invitation",
  },
  remember: {
    es: "Recordar usuario/contraseña",
    en: "Remember username/password",
    ar: "تذكر اسم المستخدم/كلمة المرور",
    fr: "Se souvenir du nom d'utilisateur/mot de passe",
  },
  login_now: { es: "Iniciar sesión", en: "Log in now", ar: "تسجيل الدخول", fr: "Se connecter" },
  register_now: { es: "Registrarse", en: "Register now", ar: "التسجيل الآن", fr: "S'inscrire" },
  signing_in: { es: "Iniciando…", en: "Signing in…", ar: "جارٍ الدخول…", fr: "Connexion…" },
  creating: { es: "Creando…", en: "Creating…", ar: "جارٍ الإنشاء…", fr: "Création…" },
  have_account: { es: "¿Tiene una cuenta?", en: "Have an account?", ar: "هل لديك حساب؟", fr: "Avez-vous un compte ?" },
  login: { es: "Iniciar sesión", en: "Login", ar: "تسجيل الدخول", fr: "Connexion" },
  download_app: {
    es: "Tiene una cuenta, descargar APP",
    en: "Have an account, download APP",
    ar: "لديك حساب، تنزيل التطبيق",
    fr: "Avez un compte, télécharger l'APP",
  },
  online_service: {
    es: "Servicio\nen línea",
    en: "Online\nService",
    ar: "خدمة\nعبر الإنترنت",
    fr: "Service\nen ligne",
  },
  // Home
  company_profile: { es: "Perfil de empresa", en: "Company Profile", ar: "ملف الشركة", fr: "Profil entreprise" },
  video_tutorial: { es: "Video tutorial", en: "Video tutorial", ar: "فيديو تعليمي", fr: "Tutoriel vidéo" },
  recharge: { es: "Recargar", en: "Recharge", ar: "إعادة الشحن", fr: "Recharger" },
  withdrawal: { es: "Retirar", en: "Withdrawal", ar: "سحب", fr: "Retrait" },
  join: { es: "Unirse", en: "Join", ar: "انضم", fr: "Rejoindre" },
  music: { es: "GIC Música", en: "GIC Music", ar: "GIC موسيقى", fr: "GIC Musique" },
  handbook: { es: "Manual del empleado", en: "Employee Handbook", ar: "دليل الموظف", fr: "Manuel employé" },
  invite_friends: { es: "Invitar amigos", en: "Invite Friends", ar: "دعوة الأصدقاء", fr: "Inviter des amis" },
  membership_list: { es: "Lista de miembros", en: "Membership list", ar: "قائمة الأعضاء", fr: "Liste des membres" },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
}

const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("app_lang") as Lang | null;
    if (saved && LANGS.some((l) => l.code === saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("app_lang", l);
  };

  const t = (key: keyof typeof DICT) => DICT[key]?.[lang] ?? DICT[key]?.en ?? String(key);

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
