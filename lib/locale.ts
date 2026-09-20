export const LOCALES=["id","en","ms","zh","ja","ko","ar","hi","es","fr"] as const;
export type Locale=(typeof LOCALES)[number];
export const localeNames:Record<Locale,string>={id:"Bahasa Indonesia",en:"English",ms:"Bahasa Melayu",zh:"简体中文",ja:"日本語",ko:"한국어",ar:"العربية",hi:"हिन्दी",es:"Español",fr:"Français"};
export const rtlLocales:Locale[]=["ar"];
const dict:Record<Locale,Record<string,string>>={
id:{store:"Store",design:"Design",request:"Request",portfolio:"Portfolio",projects:"Projects",cart:"Keranjang",login:"Login",register:"Daftar",settings:"Pengaturan",dashboard:"Dashboard",logout:"Keluar",language:"Bahasa",theme:"Tema",save:"Simpan"},
en:{store:"Store",design:"Design",request:"Request",portfolio:"Portfolio",projects:"Projects",cart:"Cart",login:"Login",register:"Register",settings:"Settings",dashboard:"Dashboard",logout:"Logout",language:"Language",theme:"Theme",save:"Save"},
ms:{store:"Kedai",design:"Reka Bentuk",request:"Permintaan",portfolio:"Portfolio",projects:"Projek",cart:"Troli",login:"Log Masuk",register:"Daftar",settings:"Tetapan",dashboard:"Papan Pemuka",logout:"Log Keluar",language:"Bahasa",theme:"Tema",save:"Simpan"},
zh:{store:"商店",design:"设计",request:"定制请求",portfolio:"作品集",projects:"项目",cart:"购物车",login:"登录",register:"注册",settings:"设置",dashboard:"控制台",logout:"退出",language:"语言",theme:"主题",save:"保存"},
ja:{store:"ストア",design:"デザイン",request:"リクエスト",portfolio:"ポートフォリオ",projects:"プロジェクト",cart:"カート",login:"ログイン",register:"登録",settings:"設定",dashboard:"ダッシュボード",logout:"ログアウト",language:"言語",theme:"テーマ",save:"保存"},
ko:{store:"스토어",design:"디자인",request:"요청",portfolio:"포트폴리오",projects:"프로젝트",cart:"장바구니",login:"로그인",register:"회원가입",settings:"설정",dashboard:"대시보드",logout:"로그아웃",language:"언어",theme:"테마",save:"저장"},
ar:{store:"المتجر",design:"التصميم",request:"طلب مخصص",portfolio:"الأعمال",projects:"المشاريع",cart:"السلة",login:"تسجيل الدخول",register:"إنشاء حساب",settings:"الإعدادات",dashboard:"لوحة التحكم",logout:"تسجيل الخروج",language:"اللغة",theme:"المظهر",save:"حفظ"},
hi:{store:"स्टोर",design:"डिज़ाइन",request:"अनुरोध",portfolio:"पोर्टफोलियो",projects:"प्रोजेक्ट",cart:"कार्ट",login:"लॉगिन",register:"रजिस्टर",settings:"सेटिंग्स",dashboard:"डैशबोर्ड",logout:"लॉगआउट",language:"भाषा",theme:"थीम",save:"सहेजें"},
es:{store:"Tienda",design:"Diseño",request:"Solicitud",portfolio:"Portafolio",projects:"Proyectos",cart:"Carrito",login:"Iniciar sesión",register:"Registrarse",settings:"Ajustes",dashboard:"Panel",logout:"Cerrar sesión",language:"Idioma",theme:"Tema",save:"Guardar"},
fr:{store:"Boutique",design:"Design",request:"Demande",portfolio:"Portfolio",projects:"Projets",cart:"Panier",login:"Connexion",register:"Inscription",settings:"Paramètres",dashboard:"Tableau de bord",logout:"Déconnexion",language:"Langue",theme:"Thème",save:"Enregistrer"}
};
export function translate(locale:Locale,key:string){return dict[locale]?.[key]??dict.en[key]??key}
