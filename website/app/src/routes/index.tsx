import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { askTutor, parseCalendarImport, testTutorConnection } from "../lib/api/tutor.functions";
import { verifyTurnstile } from "../lib/api/turnstile.functions";
import {
  FlashcardsPage,
  ExamsPage,
  StatsPage,
  FocusPage,
  MindfulnessPage,
  NotesPage,
  TutorContext,
} from "../components/study-tools";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estudiax IA" },
      { name: "description", content: "Tu espacio privado para tareas y estudio." },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Estudiax" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/icons/icon.svg" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "preload", href: "/fonts/OpenDyslexic-Regular.woff", as: "font", type: "font/woff", crossOrigin: "anonymous" },
    ],
  }),
  component: Dashboard,
});
type CalendarDraft = { title: string; subject: string; due: string; kind: Task["kind"]; instructions: string; selected: boolean };
type LofiTrack = { title: string; src: string };
// Ambient study tracks; names are intentionally hidden in the interface.
const LOFI_TRACKS: LofiTrack[] = [
  { title: "Ambient 1", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/46ed6c89-ccbf-48e9-85f6-488f86eb78c5.mp3" },
  { title: "Ambient 2", src: "/estudiax-lofi.mp3" },
  { title: "Ambient 3", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/9723a753-c803-456c-9506-2740cf23d0b3.mp3" },
  { title: "Ambient 4", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/a0a42feb-f394-4e9a-b54e-dd0d4a6c3057.mp3" },
  { title: "Ambient 5", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/c6908c2c-25a5-472f-b788-54c09bad9929.mp3" },
  { title: "Ambient 6", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/3856a0ed-1e91-4e77-adcc-69f2ff40bffb.mp3" },
  { title: "Ambient 7", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/02685a21-5616-460b-a496-30cdbc6a60fd.mp3" },
  { title: "Ambient 8", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/2b2bc6ad-4c71-45cb-8d96-1a760f78360a.mp3" },
  { title: "Ambient 9", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/078f774e-707f-4e25-947a-f73c7c082eb9.mp3" },
  { title: "Ambient 10", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/0cdd8f22-7d85-4c0e-a6bc-ca8065c1f9b1.mp3" },
  { title: "Ambient 11", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/d952d046-aded-41e0-98c5-3bd204e0b605.mp3" },
  { title: "Ambient 12", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/d729c3b5-7698-4689-847d-14252d1cbe75.mp3" },
  { title: "Ambient 13", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/3038bbf7-3b6d-4213-a709-e05b55f44b94.mp3" },
  { title: "Ambient 14", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/1f4fefdf-f09b-4b29-bdff-dafb6f2acfab.mp3" },
  { title: "Ambient 15", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/4a2e5b83-0fd5-49ab-aeb9-2a907c5674b8.mp3" },
  { title: "Ambient 16", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/31288686-5881-464d-9cfb-2f58038eb608.mp3" },
  { title: "Ambient 17", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/86d9ed75-30f3-40b8-a647-32e61ad062b7.mp3" },
  { title: "Ambient 18", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/4639928e-ce6e-41dd-8d77-2448abc4aa8a.mp3" },
  { title: "Ambient 19", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/00cd5b7b-ee5a-4754-896c-63caf05d0d18.mp3" },
  { title: "Ambient 20", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/6476b9b4-c381-4511-a19b-c35a6ff2db0b.mp3" },
  { title: "Ambient 21", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/fcd7240b-ec5b-42b0-b6f0-a9b57e3c05b1.mp3" },
  { title: "Ambient 22", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/1d280664-2d80-4d0d-a8c3-08d8fa480351.mp3" },
  { title: "Ambient 23", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/ee63e153-5c11-4f38-97dd-e5863876163f.mp3" },
  { title: "Ambient 24", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/3826e65d-c2c6-46ad-b971-d0701dc87005.mp3" },
  { title: "Ambient 25", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/f828a259-a877-4f77-b91d-4f74be3dc373.mp3" },
  { title: "Ambient 26", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/29d594f1-4659-4b2b-b352-92692baabe28.mp3" },
  { title: "Ambient 27", src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3JZJBeBh8hUnj8VSWGLxitbKHCJ/5853a2ca-c38f-4f62-b905-67c0078f8b2e.mp3" },
];
function shuffledTracks(tracks: LofiTrack[], previousTitle?: string): LofiTrack[] {
  const result = [...tracks];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.length > 1 && previousTitle && result[0].title === previousTitle) {
    const swapIndex = 1 + Math.floor(Math.random() * (result.length - 1));
    [result[0], result[swapIndex]] = [result[swapIndex], result[0]];
  }
  return result;
}
type Task = {
  id: string;
  title: string;
  subject: string;
  due: string;
  kind: "Tarea" | "Parcial" | "Estudio";
  instructions: string;
  done: boolean;
};
const key = "estudiax-tasks-v1";
const themeLabels: Record<string, Record<string, string>> = {
  hi: {blue:"नीला",red:"लाल",green:"हरा",yellow:"पीला",purple:"बैंगनी",pink:"गुलाबी",orange:"नारंगी",black:"ग्रेफाइट",white:"सफेद",teal:"टील",cyan:"सियान",indigo:"इंडिगो",lime:"लाइम",coral:"कोरल"},
  id: {blue:"Biru",red:"Merah",green:"Hijau",yellow:"Kuning",purple:"Ungu",pink:"Merah muda",orange:"Jingga",black:"Grafit",white:"Putih",teal:"Teal",cyan:"Sian",indigo:"Nila",lime:"Limau",coral:"Koral"},
  tr: {blue:"Mavi",red:"Kırmızı",green:"Yeşil",yellow:"Sarı",purple:"Mor",pink:"Pembe",orange:"Turuncu",black:"Grafit",white:"Beyaz",teal:"Petrol",cyan:"Camgöbeği",indigo:"Çivit",lime:"Limon yeşili",coral:"Mercan"},
  vi: {blue:"Xanh dương",red:"Đỏ",green:"Xanh lá",yellow:"Vàng",purple:"Tím",pink:"Hồng",orange:"Cam",black:"Than chì",white:"Trắng",teal:"Xanh mòng két",cyan:"Xanh lơ",indigo:"Chàm",lime:"Xanh chanh",coral:"San hô"},
  nl: {blue:"Blauw",red:"Rood",green:"Groen",yellow:"Geel",purple:"Paars",pink:"Roze",orange:"Oranje",black:"Grafiet",white:"Wit",teal:"Blauwgroen",cyan:"Cyaan",indigo:"Indigo",lime:"Limoen",coral:"Koraal"},
};
const FONT_OPTIONS = {
  system: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  dyslexic: 'OpenDyslexic, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  rounded: 'ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif',
} as const;
async function deriveBackupKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 250000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function encryptBackup(payload: unknown, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await deriveBackupKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv.buffer as ArrayBuffer }, k, new TextEncoder().encode(JSON.stringify(payload)));
  const toB64 = (bytes: Uint8Array) => { let binary = ""; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(binary); };
  return JSON.stringify({ format: "estudiax-encrypted-backup", version: 1, kdf: "PBKDF2-SHA256", iterations: 250000, cipher: "AES-256-GCM", salt: toB64(salt), iv: toB64(iv), data: toB64(new Uint8Array(encrypted)) }, null, 2);
}
async function decryptBackup(raw: string, password: string) {
  const data = JSON.parse(raw) as { format?: string; version?: number; salt?: string; iv?: string; data?: string };
  if (data.format !== "estudiax-encrypted-backup" || data.version !== 1 || !data.salt || !data.iv || !data.data) throw new Error("Formato de respaldo no reconocido.");
  const fromB64 = (v: string) => Uint8Array.from(atob(v), c => c.charCodeAt(0));
  const key = await deriveBackupKey(password, fromB64(data.salt));
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(data.iv).buffer as ArrayBuffer }, key, fromB64(data.data).buffer as ArrayBuffer);
  return JSON.parse(new TextDecoder().decode(clear)) as Record<string, unknown>;
}
const TURNSTILE_SITE_KEY = "0x4AAAAAAFVNA4Hs8lPzjiTj";
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void; "expired-callback"?: () => void; theme?: "light" | "dark" | "auto" }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
const isSafari = () => typeof navigator !== "undefined" && /Safari/i.test(navigator.userAgent) && !/(Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS|Android)/i.test(navigator.userAgent);
const isInstalledWebApp = () => typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
const isIOSDevice = () => typeof navigator !== "undefined" && (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const day = (n: number) => {
  const d = new Date(`${today()}T12:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const date = (s: string) =>
  s
    ? new Date(`${s}T12:00:00`).toLocaleDateString(
        typeof document !== "undefined"
          ? document.documentElement.lang === "en"
            ? "en-US"
            : document.documentElement.lang === "fr"
              ? "fr-FR"
              : "es-MX"
          : "es-MX",
        { day: "numeric", month: "short" },
      )
    : typeof document !== "undefined" && document.documentElement.lang === "en"
      ? "No date"
      : typeof document !== "undefined" && document.documentElement.lang === "fr"
        ? "Sans date"
        : "Sin fecha";
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const DRIVE_COPY: Record<string, {subtitle:string;headline:string;description:string;account:string;accountDesc:string;encrypted:string;encryptedDesc:string;schedule:string;scheduleDesc:string;notConnected:string;checking:string;connectedFallback:string;connect:string;disconnect:string;save:string;saving:string;encryptedLocal:string;saveFailed:string;disconnectFailed:string}> = {
 es:{subtitle:"Respaldos cifrados en tu propia cuenta de Google.",headline:"Tus archivos. Tu Drive. Tu control.",description:"Conecta tu cuenta de Google para guardar respaldos cifrados. El respaldo programado se ejecuta los martes cuando abres ESTUDIAX; por seguridad, te pedirá la contraseña para cifrarlo.",account:"Tu propia cuenta",accountDesc:"Los archivos van a tu Drive, no al del desarrollador.",encrypted:"Respaldos cifrados",encryptedDesc:"El archivo se cifra en tu dispositivo antes de subirlo.",schedule:"Frecuencia semanal",scheduleDesc:"Cada martes, cuando abras ESTUDIAX con Drive conectado. El navegador debe estar abierto y te pedirá la contraseña.",notConnected:"Google Drive no está conectado",checking:"Comprobando conexión…",connectedFallback:"Cuenta Google conectada.",connect:"Conectar Google Drive",disconnect:"Desconectar",save:"Guardar respaldo cifrado en Drive",saving:"Guardando…",encryptedLocal:"El respaldo se cifra en tu dispositivo antes de enviarse.",saveFailed:"No se pudo guardar el respaldo en Google Drive. Revisa la conexión e inténtalo de nuevo.",disconnectFailed:"No se pudo desconectar Google Drive."},
 en:{subtitle:"Encrypted backups in your own Google account.",headline:"Your files. Your Drive. Your control.",description:"Connect your Google account to save encrypted backups. The scheduled backup runs on Tuesdays when you open ESTUDIAX; it asks for your password to encrypt the file.",account:"Your own account",accountDesc:"Files go to your Drive, not the developer’s.",encrypted:"Encrypted backups",encryptedDesc:"The file is encrypted on your device before upload.",schedule:"Weekly schedule",scheduleDesc:"Every Tuesday when you open ESTUDIAX with Drive connected. The browser must be open and will ask for your password.",notConnected:"Google Drive not connected",checking:"Checking connection…",connectedFallback:"Google account connected.",connect:"Connect Google Drive",disconnect:"Disconnect",save:"Save encrypted backup to Drive",saving:"Saving…",encryptedLocal:"The backup is encrypted on your device before upload.",saveFailed:"Could not save the backup to Google Drive. Check the connection and try again.",disconnectFailed:"Could not disconnect Google Drive."},
 fr:{subtitle:"Sauvegardes chiffrées dans votre propre compte Google.",headline:"Vos fichiers. Votre Drive. Votre contrôle.",description:"Connectez votre compte Google pour enregistrer des sauvegardes chiffrées. La sauvegarde programmée s’exécute le mardi lorsque vous ouvrez ESTUDIAX et demande votre mot de passe pour chiffrer le fichier.",account:"Votre propre compte",accountDesc:"Les fichiers sont enregistrés dans votre Drive, pas celui du développeur.",encrypted:"Sauvegardes chiffrées",encryptedDesc:"Le fichier est chiffré sur votre appareil avant l’envoi.",schedule:"Fréquence hebdomadaire",scheduleDesc:"Chaque mardi lorsque vous ouvrez ESTUDIAX avec Drive connecté. Le navigateur doit être ouvert et demandera votre mot de passe.",notConnected:"Google Drive non connecté",checking:"Vérification de la connexion…",connectedFallback:"Compte Google connecté.",connect:"Connecter Google Drive",disconnect:"Déconnecter",save:"Enregistrer la sauvegarde chiffrée dans Drive",saving:"Enregistrement…",encryptedLocal:"La sauvegarde est chiffrée sur votre appareil avant l’envoi.",saveFailed:"Impossible d’enregistrer la sauvegarde dans Google Drive. Vérifiez la connexion et réessayez.",disconnectFailed:"Impossible de déconnecter Google Drive."},
 pt:{subtitle:"Backups criptografados na sua própria conta Google.",headline:"Seus arquivos. Seu Drive. Seu controle.",description:"Conecte sua conta Google para salvar backups criptografados. O backup agendado é executado às terças-feiras quando você abre o ESTUDIAX e pede sua senha para criptografar o arquivo.",account:"Sua própria conta",accountDesc:"Os arquivos ficam no seu Drive, não no do desenvolvedor.",encrypted:"Backups criptografados",encryptedDesc:"O arquivo é criptografado no dispositivo antes do envio.",schedule:"Agenda semanal",scheduleDesc:"Toda terça-feira, quando você abrir o ESTUDIAX com o Drive conectado. O navegador precisa estar aberto e pedirá sua senha.",notConnected:"Google Drive não conectado",checking:"Verificando conexão…",connectedFallback:"Conta Google conectada.",connect:"Conectar Google Drive",disconnect:"Desconectar",save:"Salvar backup criptografado no Drive",saving:"Salvando…",encryptedLocal:"O backup é criptografado no dispositivo antes do envio.",saveFailed:"Não foi possível salvar o backup no Google Drive. Verifique a conexão e tente novamente.",disconnectFailed:"Não foi possível desconectar o Google Drive."},
 zh:{subtitle:"将加密备份保存到您自己的 Google 账号。",headline:"您的文件，您的云端硬盘，由您掌控。",description:"连接 Google 账号后即可保存加密备份。每周二打开 ESTUDIAX 时会运行计划备份，并要求输入密码来加密文件。",account:"您自己的账号",accountDesc:"文件保存到您的云端硬盘，而不是开发者的账号。",encrypted:"加密备份",encryptedDesc:"文件会先在您的设备上加密，再上传。",schedule:"每周计划",scheduleDesc:"每周二打开 ESTUDIAX 且已连接 Drive 时运行。浏览器必须打开，并会要求输入密码。",notConnected:"Google Drive 尚未连接",checking:"正在检查连接…",connectedFallback:"Google 账号已连接。",connect:"连接 Google Drive",disconnect:"断开连接",save:"将加密备份保存到 Drive",saving:"正在保存…",encryptedLocal:"备份会先在设备上加密，再上传。",saveFailed:"无法将备份保存到 Google Drive。请检查连接后重试。",disconnectFailed:"无法断开 Google Drive。"},
 it:{subtitle:"Backup crittografati nel tuo account Google.",headline:"I tuoi file. Il tuo Drive. Il tuo controllo.",description:"Collega il tuo account Google per salvare backup crittografati. Il backup programmato viene eseguito il martedì quando apri ESTUDIAX e richiede la password per cifrare il file.",account:"Il tuo account",accountDesc:"I file vengono salvati nel tuo Drive, non in quello dello sviluppatore.",encrypted:"Backup crittografati",encryptedDesc:"Il file viene cifrato sul dispositivo prima del caricamento.",schedule:"Pianificazione settimanale",scheduleDesc:"Ogni martedì quando apri ESTUDIAX con Drive collegato. Il browser deve essere aperto e chiederà la password.",notConnected:"Google Drive non connesso",checking:"Verifica della connessione…",connectedFallback:"Account Google connesso.",connect:"Connetti Google Drive",disconnect:"Disconnetti",save:"Salva il backup cifrato su Drive",saving:"Salvataggio…",encryptedLocal:"Il backup viene cifrato sul dispositivo prima dell’invio.",saveFailed:"Impossibile salvare il backup su Google Drive. Controlla la connessione e riprova.",disconnectFailed:"Impossibile disconnettere Google Drive."},
 de:{subtitle:"Verschlüsselte Backups in deinem eigenen Google-Konto.",headline:"Deine Dateien. Dein Drive. Deine Kontrolle.",description:"Verbinde dein Google-Konto, um verschlüsselte Backups zu speichern. Das geplante Backup läuft dienstags, wenn du ESTUDIAX öffnest, und fragt nach deinem Passwort zur Verschlüsselung.",account:"Dein eigenes Konto",accountDesc:"Dateien werden in deinem Drive gespeichert, nicht im Konto des Entwicklers.",encrypted:"Verschlüsselte Backups",encryptedDesc:"Die Datei wird vor dem Upload auf deinem Gerät verschlüsselt.",schedule:"Wöchentlicher Zeitplan",scheduleDesc:"Jeden Dienstag, wenn du ESTUDIAX bei verbundenem Drive öffnest. Der Browser muss geöffnet sein und fragt nach deinem Passwort.",notConnected:"Google Drive nicht verbunden",checking:"Verbindung wird geprüft…",connectedFallback:"Google-Konto verbunden.",connect:"Google Drive verbinden",disconnect:"Trennen",save:"Verschlüsseltes Backup in Drive speichern",saving:"Wird gespeichert…",encryptedLocal:"Das Backup wird vor dem Upload auf deinem Gerät verschlüsselt.",saveFailed:"Das Backup konnte nicht in Google Drive gespeichert werden. Prüfe die Verbindung und versuche es erneut.",disconnectFailed:"Google Drive konnte nicht getrennt werden."},
 ru:{subtitle:"Зашифрованные резервные копии в вашем аккаунте Google.",headline:"Ваши файлы. Ваш Drive. Ваш контроль.",description:"Подключите аккаунт Google, чтобы сохранять зашифрованные копии. Запланированное копирование выполняется по вторникам при открытии ESTUDIAX и запрашивает пароль для шифрования файла.",account:"Ваш аккаунт",accountDesc:"Файлы сохраняются в вашем Drive, а не в аккаунте разработчика.",encrypted:"Зашифрованные копии",encryptedDesc:"Файл шифруется на устройстве перед загрузкой.",schedule:"Еженедельное расписание",scheduleDesc:"Каждый вторник при открытии ESTUDIAX с подключённым Drive. Браузер должен быть открыт и запросит пароль.",notConnected:"Google Drive не подключён",checking:"Проверка подключения…",connectedFallback:"Аккаунт Google подключён.",connect:"Подключить Google Drive",disconnect:"Отключить",save:"Сохранить зашифрованную копию в Drive",saving:"Сохранение…",encryptedLocal:"Резервная копия шифруется на устройстве перед отправкой.",saveFailed:"Не удалось сохранить копию в Google Drive. Проверьте подключение и повторите попытку.",disconnectFailed:"Не удалось отключить Google Drive."}
};

const DOWNLOAD_STEPS: Record<string, Record<string, string[]>> = {
  es:{android:["Abre ESTUDIAX en tu navegador","En Chrome, abre el menú ⋮","Pulsa Instalar aplicación o Añadir a pantalla de inicio","Confirma y abre ESTUDIAX desde el icono creado"],iphone:["Abre ESTUDIAX en Safari","Pulsa Compartir (cuadrado con flecha hacia arriba)","Elige Añadir a pantalla de inicio","Pulsa Añadir y abre el icono de ESTUDIAX"],ipad:["Abre ESTUDIAX en Safari","Pulsa Compartir","Elige Añadir a pantalla de inicio","Pulsa Añadir y abre el icono de ESTUDIAX"],mac:["Abre ESTUDIAX en Safari","Selecciona Archivo → Añadir al Dock","Confirma el nombre y pulsa Añadir","Abre ESTUDIAX desde el Dock como una app"],windows:["Abre ESTUDIAX en Microsoft Edge o Google Chrome","Abre el menú del navegador","Selecciona Instalar este sitio como aplicación o Instalar página","Confirma; podrás abrirlo desde Inicio o la barra de tareas"],linux:["Abre ESTUDIAX en Chrome o Chromium compatible","Abre el menú del navegador","Si aparece Instalar página como aplicación, selecciónalo","Si no aparece, crea un marcador y usa ESTUDIAX desde el navegador"]},
  en:{android:["Open ESTUDIAX in your browser","In Chrome, open the ⋮ menu","Choose Install app or Add to Home Screen","Confirm, then launch ESTUDIAX from its new icon"],iphone:["Open ESTUDIAX in Safari","Tap Share (the square with an upward arrow)","Choose Add to Home Screen","Tap Add, then open the ESTUDIAX icon"],ipad:["Open ESTUDIAX in Safari","Tap Share","Choose Add to Home Screen","Tap Add, then open the ESTUDIAX icon"],mac:["Open ESTUDIAX in Safari","In the menu bar, choose File → Add to Dock","Confirm the name and click Add","Launch ESTUDIAX from the Dock like an app"],windows:["Open ESTUDIAX in Microsoft Edge or Google Chrome","Open the browser menu","Choose Install this site as an app or Install page","Confirm; launch it from Start or the taskbar"],linux:["Open ESTUDIAX in a compatible Chrome or Chromium browser","Open the browser menu","If available, choose Install page as app","Otherwise, bookmark ESTUDIAX and open it in the browser"]},
  fr:{android:["Ouvrez ESTUDIAX dans votre navigateur","Dans Chrome, ouvrez le menu ⋮","Choisissez Installer l’application ou Ajouter à l’écran d’accueil","Confirmez puis ouvrez l’icône ESTUDIAX"],iphone:["Ouvrez ESTUDIAX dans Safari","Touchez Partager","Choisissez Sur l’écran d’accueil","Touchez Ajouter puis ouvrez l’icône ESTUDIAX"],ipad:["Ouvrez ESTUDIAX dans Safari","Touchez Partager","Choisissez Sur l’écran d’accueil","Touchez Ajouter puis ouvrez l’icône ESTUDIAX"],mac:["Ouvrez ESTUDIAX dans Safari","Choisissez Fichier → Ajouter au Dock","Confirmez le nom puis cliquez sur Ajouter","Lancez ESTUDIAX depuis le Dock comme une app"],windows:["Ouvrez ESTUDIAX dans Microsoft Edge ou Google Chrome","Ouvrez le menu du navigateur","Choisissez Installer ce site comme application, si disponible","Lancez-le depuis Démarrer ou la barre des tâches"],linux:["Ouvrez ESTUDIAX dans Chrome ou Chromium compatible","Ouvrez le menu du navigateur","Si disponible, choisissez Installer la page comme application","Sinon, ajoutez ESTUDIAX aux favoris"]},
  pt:{android:["Abra o ESTUDIAX no navegador","No Chrome, abra o menu ⋮","Escolha Instalar aplicativo ou Adicionar à tela inicial","Confirme e abra o ícone criado do ESTUDIAX"],iphone:["Abra o ESTUDIAX no Safari","Toque em Compartilhar","Escolha Adicionar à Tela de Início","Toque em Adicionar e abra o ícone do ESTUDIAX"],ipad:["Abra o ESTUDIAX no Safari","Toque em Compartilhar","Escolha Adicionar à Tela de Início","Toque em Adicionar e abra o ícone do ESTUDIAX"],mac:["Abra o ESTUDIAX no Safari","Escolha Arquivo → Adicionar ao Dock","Confirme o nome e clique em Adicionar","Abra o ESTUDIAX pelo Dock como um app"],windows:["Abra o ESTUDIAX no Microsoft Edge ou Google Chrome","Abra o menu do navegador","Escolha Instalar este site como aplicativo, se disponível","Abra pelo menu Iniciar ou pela barra de tarefas"],linux:["Abra o ESTUDIAX em um Chrome ou Chromium compatível","Abra o menu do navegador","Se disponível, escolha Instalar página como aplicativo","Caso contrário, adicione o ESTUDIAX aos favoritos"]},
  zh:{android:["在浏览器中打开 ESTUDIAX","在 Chrome 中打开 ⋮ 菜单","选择“安装应用”或“添加到主屏幕”","确认后从新图标打开 ESTUDIAX"],iphone:["在 Safari 中打开 ESTUDIAX","轻点分享按钮","选择“添加到主屏幕”","轻点“添加”，然后打开 ESTUDIAX 图标"],ipad:["在 Safari 中打开 ESTUDIAX","轻点分享按钮","选择“添加到主屏幕”","轻点“添加”，然后打开 ESTUDIAX 图标"],mac:["在 Safari 中打开 ESTUDIAX","在菜单栏选择“文件 → 添加到程序坞”","确认名称并点击“添加”","从程序坞像普通应用一样打开 ESTUDIAX"],windows:["在 Microsoft Edge 或 Google Chrome 中打开 ESTUDIAX","打开浏览器菜单","选择“将此网站安装为应用”或“安装页面”","确认后从开始菜单或任务栏打开"],linux:["在兼容的 Chrome 或 Chromium 浏览器中打开 ESTUDIAX","打开浏览器菜单","如果有“将页面安装为应用”，请选择它","否则将 ESTUDIAX 添加为书签"]},
  it:{android:["Apri ESTUDIAX nel browser","In Chrome, apri il menu ⋮","Scegli Installa app o Aggiungi alla schermata Home","Conferma e apri l’icona ESTUDIAX"],iphone:["Apri ESTUDIAX in Safari","Tocca Condividi","Scegli Aggiungi alla schermata Home","Tocca Aggiungi e apri l’icona ESTUDIAX"],ipad:["Apri ESTUDIAX in Safari","Tocca Condividi","Scegli Aggiungi alla schermata Home","Tocca Aggiungi e apri l’icona ESTUDIAX"],mac:["Apri ESTUDIAX in Safari","Scegli File → Aggiungi al Dock","Conferma il nome e premi Aggiungi","Avvia ESTUDIAX dal Dock"],windows:["Apri ESTUDIAX in Edge o Chrome","Apri il menu del browser","Scegli Installa questo sito come app, se disponibile","Aprilo dal menu Start o dalla barra delle applicazioni"],linux:["Apri ESTUDIAX in Chrome o Chromium compatibile","Apri il menu del browser","Se disponibile, scegli Installa pagina come app","Altrimenti aggiungi ESTUDIAX ai preferiti"]},
  de:{android:["Öffne ESTUDIAX im Browser","Öffne in Chrome das Menü ⋮","Wähle App installieren oder Zum Startbildschirm hinzufügen","Bestätige und öffne das neue ESTUDIAX-Symbol"],iphone:["Öffne ESTUDIAX in Safari","Tippe auf Teilen","Wähle Zum Home-Bildschirm","Tippe auf Hinzufügen und öffne das ESTUDIAX-Symbol"],ipad:["Öffne ESTUDIAX in Safari","Tippe auf Teilen","Wähle Zum Home-Bildschirm","Tippe auf Hinzufügen und öffne das ESTUDIAX-Symbol"],mac:["Öffne ESTUDIAX in Safari","Wähle Ablage → Zum Dock hinzufügen","Bestätige den Namen und klicke Hinzufügen","Starte ESTUDIAX aus dem Dock"],windows:["Öffne ESTUDIAX in Edge oder Chrome","Öffne das Browsermenü","Wähle Diese Website als App installieren, falls verfügbar","Starte ESTUDIAX über Start oder die Taskleiste"],linux:["Öffne ESTUDIAX in einem kompatiblen Chrome- oder Chromium-Browser","Öffne das Browsermenü","Wähle bei Verfügbarkeit Seite als App installieren","Andernfalls füge ESTUDIAX zu den Lesezeichen hinzu"]},
  ru:{android:["Откройте ESTUDIAX в браузере","В Chrome откройте меню ⋮","Выберите «Установить приложение» или «Добавить на главный экран»","Подтвердите и откройте новый значок ESTUDIAX"],iphone:["Откройте ESTUDIAX в Safari","Нажмите «Поделиться»","Выберите «На экран Домой»","Нажмите «Добавить» и откройте значок ESTUDIAX"],ipad:["Откройте ESTUDIAX в Safari","Нажмите «Поделиться»","Выберите «На экран Домой»","Нажмите «Добавить» и откройте значок ESTUDIAX"],mac:["Откройте ESTUDIAX в Safari","Выберите Файл → Добавить в Dock","Подтвердите название и нажмите «Добавить»","Запускайте ESTUDIAX из Dock"],windows:["Откройте ESTUDIAX в Edge или Chrome","Откройте меню браузера","Выберите «Установить сайт как приложение», если доступно","Запускайте из меню «Пуск» или панели задач"],linux:["Откройте ESTUDIAX в совместимом Chrome или Chromium","Откройте меню браузера","Если доступно, выберите установку страницы как приложения","Иначе добавьте ESTUDIAX в закладки"]}
};

const DOWNLOAD_DONATION_COPY: Record<string, { eyebrow: string; title: string; message: string; button: string; dismiss: string }> = {
  es: { eyebrow: "APOYA ESTUDIAX", title: "Llevemos ESTUDIAX a la App Store", message: "Dona en criptomonedas para contribuir al pago de la licencia de desarrollador de Apple. Pulsa el botón para contactar al equipo de donaciones.", button: "Contactar al equipo de donaciones", dismiss: "Ahora no" },
  en: { eyebrow: "SUPPORT ESTUDIAX", title: "Help bring ESTUDIAX to the App Store", message: "Donate cryptocurrency to help cover Apple’s developer program fee. Press the button to contact the donations team.", button: "Contact the donations team", dismiss: "Not now" },
  fr: { eyebrow: "SOUTENEZ ESTUDIAX", title: "Aidons ESTUDIAX à arriver sur l’App Store", message: "Faites un don en cryptomonnaie pour contribuer aux frais du programme développeur Apple. Contactez l’équipe des dons avec le bouton.", button: "Contacter l’équipe des dons", dismiss: "Plus tard" },
  pt: { eyebrow: "APOIE O ESTUDIAX", title: "Ajude o ESTUDIAX a chegar à App Store", message: "Doe criptomoedas para ajudar a pagar a taxa do programa de desenvolvedores da Apple. Use o botão para falar com a equipe de doações.", button: "Contatar a equipe de doações", dismiss: "Agora não" },
  zh: { eyebrow: "支持 ESTUDIAX", title: "帮助 ESTUDIAX 登上 App Store", message: "欢迎捐赠加密货币，以分担 Apple 开发者计划的费用。点击按钮联系捐赠团队。", button: "联系捐赠团队", dismiss: "暂时不了" },
  it: { eyebrow: "SOSTIENI ESTUDIAX", title: "Portiamo ESTUDIAX sull’App Store", message: "Dona criptovalute per contribuire al costo del programma per sviluppatori Apple. Usa il pulsante per contattare il team donazioni.", button: "Contatta il team donazioni", dismiss: "Non ora" },
  de: { eyebrow: "UNTERSTÜTZE ESTUDIAX", title: "ESTUDIAX in den App Store bringen", message: "Spende Kryptowährungen, um die Gebühr für Apples Entwicklerprogramm mitzufinanzieren. Kontaktiere das Spendenteam über die Schaltfläche.", button: "Spendenteam kontaktieren", dismiss: "Nicht jetzt" },
  ru: { eyebrow: "ПОДДЕРЖИТЕ ESTUDIAX", title: "Помогите ESTUDIAX попасть в App Store", message: "Пожертвуйте криптовалюту, чтобы помочь оплатить программу разработчиков Apple. Нажмите кнопку, чтобы связаться с командой пожертвований.", button: "Связаться с командой пожертвований", dismiss: "Не сейчас" },
  ja: { eyebrow: "ESTUDIAXを応援", title: "ESTUDIAXのApp Store公開を応援してください", message: "Appleの開発者プログラム費用を支援するため、暗号資産で寄付できます。ボタンから寄付チームにお問い合わせください。", button: "寄付チームに連絡", dismiss: "今はしない" },
  ko: { eyebrow: "ESTUDIAX 후원", title: "ESTUDIAX의 App Store 출시를 도와주세요", message: "Apple 개발자 프로그램 비용을 지원하기 위해 암호화폐로 기부할 수 있습니다. 버튼을 눌러 기부팀에 문의하세요.", button: "기부팀에 문의", dismiss: "나중에" },
  sw: { eyebrow: "SAIDIA ESTUDIAX", title: "Saidia ESTUDIAX kufika kwenye App Store", message: "Changia sarafu za kidijitali kusaidia kulipia ada ya programu ya wasanidi wa Apple. Bonyeza kitufe kuwasiliana na timu ya michango.", button: "Wasiliana na timu ya michango", dismiss: "Si sasa" },
  ar: { eyebrow: "ادعم ESTUDIAX", title: "ساعد ESTUDIAX على الوصول إلى App Store", message: "تبرع بالعملات المشفرة للمساهمة في رسوم برنامج مطوري Apple. اضغط على الزر للتواصل مع فريق التبرعات.", button: "تواصل مع فريق التبرعات", dismiss: "ليس الآن" },
  hi: { eyebrow: "ESTUDIAX का समर्थन करें", title: "ESTUDIAX को App Store तक पहुँचाने में मदद करें", message: "Apple के डेवलपर प्रोग्राम की फीस में योगदान देने के लिए क्रिप्टोकरेंसी दान करें। दान टीम से संपर्क करने के लिए बटन दबाएँ।", button: "दान टीम से संपर्क करें", dismiss: "अभी नहीं" },
  id: { eyebrow: "DUKUNG ESTUDIAX", title: "Bantu ESTUDIAX hadir di App Store", message: "Donasikan mata uang kripto untuk membantu membayar biaya program pengembang Apple. Tekan tombol untuk menghubungi tim donasi.", button: "Hubungi tim donasi", dismiss: "Nanti saja" },
  tr: { eyebrow: "ESTUDIAX'I DESTEKLE", title: "ESTUDIAX'ın App Store'a gelmesine yardımcı olun", message: "Apple Geliştirici Programı ücretine katkıda bulunmak için kripto para bağışlayın. Bağış ekibiyle iletişim için düğmeye basın.", button: "Bağış ekibiyle iletişime geç", dismiss: "Şimdi değil" },
  vi: { eyebrow: "ỦNG HỘ ESTUDIAX", title: "Giúp ESTUDIAX có mặt trên App Store", message: "Quyên góp tiền mã hóa để góp phần chi trả phí chương trình nhà phát triển của Apple. Nhấn nút để liên hệ nhóm quyên góp.", button: "Liên hệ nhóm quyên góp", dismiss: "Để sau" },
  nl: { eyebrow: "STEUN ESTUDIAX", title: "Help ESTUDIAX naar de App Store te brengen", message: "Doneer cryptovaluta om bij te dragen aan de kosten van het Apple Developer-programma. Klik op de knop om contact op te nemen met het donatieteam.", button: "Contact met het donatieteam", dismiss: "Niet nu" },
};

function Dashboard() {
  const [gateVerified, setGateVerified] = useState(false);
  // Require the privacy/terms notice on every fresh site load. Acceptance only
  // unlocks this visit; it is intentionally not persisted across reloads.
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [donationPopupOpen, setDonationPopupOpen] = useState(false);
  useEffect(() => {
    // Show donations after consent on every fresh visit; dismissal is session-only.
    if (gateVerified && consentAccepted) setDonationPopupOpen(true);
  }, [gateVerified, consentAccepted]);
  const closeDonationPopup = () => {
    setDonationPopupOpen(false);
  };
  const [gateReady, setGateReady] = useState(false);
  const [gateBusy, setGateBusy] = useState(false);
  const [gateError, setGateError] = useState("");
  const [turnstileRetry, setTurnstileRetry] = useState(0);
  const turnstileHost = useRef<HTMLDivElement>(null);
  const turnstileWidget = useRef<string | null>(null);
  const turnstileToken = useRef("");

  useEffect(() => {
    // Installed PWA sessions skip the browser anti-abuse widget at startup.
    // Native apps never load this web-only Turnstile integration.
    if (isInstalledWebApp()) {
      setGateVerified(true);
      return;
    }
    // Browser website visits retain the existing server-verified anti-abuse gate.
    let cancelled = false;
    let pollId: number | undefined;
    let timeoutId: number | undefined;
    let script: HTMLScriptElement | null = null;
    const loadingError = () => lang === "en"
      ? "Cloudflare verification did not load. This can happen when a browser extension or network blocks it. Retry, or allow challenges.cloudflare.com and reload."
      : lang === "fr"
        ? "La vérification Cloudflare ne s’est pas chargée. Une extension ou le réseau peut la bloquer. Réessayez ou autorisez challenges.cloudflare.com puis rechargez."
        : lang === "pt"
          ? "A verificação do Cloudflare não carregou. Uma extensão ou a rede pode estar bloqueando. Tente novamente ou permita challenges.cloudflare.com e recarregue."
          : lang === "zh"
            ? "Cloudflare 验证未能加载，浏览器扩展或网络可能阻止了它。请重试，或允许 challenges.cloudflare.com 后刷新。"
            : "No se cargó la verificación de Cloudflare. Una extensión o la red podría estar bloqueándola. Inténtalo de nuevo o permite challenges.cloudflare.com y recarga.";
    const renderWidget = () => {
      if (cancelled || !window.turnstile || !turnstileHost.current || turnstileWidget.current) return false;
      try {
        turnstileWidget.current = window.turnstile.render(turnstileHost.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: localStorage.getItem("estudiax-mode") === "light" ? "light" : "dark",
          callback: (token) => { turnstileToken.current = token; setGateError(""); },
          "error-callback": () => {
            turnstileToken.current = "";
            setGateError(loadingError());
          },
          "expired-callback": () => {
            turnstileToken.current = "";
            setGateError(lang === "en" ? "Verification expired. Complete the CAPTCHA again." : lang === "fr" ? "La vérification a expiré. Recommencez le CAPTCHA." : lang === "pt" ? "A verificação expirou. Complete o CAPTCHA novamente." : lang === "zh" ? "验证已过期，请重新完成 CAPTCHA。" : "La verificación expiró. Completa el CAPTCHA otra vez.");
          },
        });
        setGateReady(true);
        setGateError("");
        return true;
      } catch {
        turnstileWidget.current = null;
        setGateReady(false);
        setGateError(loadingError());
        return false;
      }
    };
    const failLoading = () => {
      if (cancelled || window.turnstile) return;
      setGateReady(false);
      setGateError(loadingError());
    };
    if (!window.turnstile) {
      script = document.querySelector<HTMLScriptElement>('script[data-estudiax-turnstile="true"]');
      // A retry must not keep reusing a script tag that already failed to load.
      if (turnstileRetry > 0 && script) {
        script.remove();
        script = null;
      }
      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.estudiaxTurnstile = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("error", failLoading);
    }
    // Polling also handles an existing script whose load event fired before this route mounted.
    pollId = window.setInterval(() => {
      if (window.turnstile && renderWidget()) {
        if (pollId !== undefined) window.clearInterval(pollId);
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      }
    }, 250);
    timeoutId = window.setTimeout(() => {
      if (!window.turnstile || !turnstileWidget.current) failLoading();
      if (pollId !== undefined) window.clearInterval(pollId);
    }, 12000);
    if (window.turnstile) renderWidget();
    return () => {
      cancelled = true;
      if (pollId !== undefined) window.clearInterval(pollId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      script?.removeEventListener("error", failLoading);
      if (turnstileWidget.current && window.turnstile) window.turnstile.remove(turnstileWidget.current);
      turnstileWidget.current = null;
    };
  }, [turnstileRetry]);

  async function completeGate() {
    if (!turnstileToken.current || gateBusy) {
      setGateError(lang === "en" ? "Complete the Cloudflare CAPTCHA first." : lang === "fr" ? "Complétez d’abord le CAPTCHA Cloudflare." : lang === "pt" ? "Complete primeiro o CAPTCHA do Cloudflare." : lang === "zh" ? "请先完成 Cloudflare CAPTCHA。" : "Completa primero el CAPTCHA de Cloudflare.");
      return;
    }
    setGateBusy(true);
    setGateError("");
    try {
      const result = await verifyTurnstile({ data: { token: turnstileToken.current } });
      if (!result.ok) {
        setGateError(result.message);
        turnstileToken.current = "";
        if (turnstileWidget.current && window.turnstile) window.turnstile.reset(turnstileWidget.current);
        return;
      }
      setGateVerified(true);
    } catch {
      setGateError(lang === "en" ? "Server verification failed. Please try again." : lang === "fr" ? "La validation du serveur a échoué. Réessayez." : lang === "pt" ? "A validação do servidor falhou. Tente novamente." : lang === "zh" ? "服务器验证失败，请重试。" : "No se pudo validar con el servidor. Inténtalo otra vez.");
      turnstileToken.current = "";
      if (turnstileWidget.current && window.turnstile) window.turnstile.reset(turnstileWidget.current);
    } finally {
      setGateBusy(false);
    }
  }
  const [tasks, S] = useState<Task[]>([]),
    [ready, R] = useState(false),
    [page, P] = useState("Inicio"),
    [downloadPlatform, setDownloadPlatform] = useState<string | null>(null),
    [driveConnected, setDriveConnected] = useState(false),
    [driveEmail, setDriveEmail] = useState(""),
    [driveLoading, setDriveLoading] = useState(false),
    [driveSaving, setDriveSaving] = useState(false),
    [modal, M] = useState(false),
    [title, T] = useState(""),
    [subject, U] = useState(""),
    [instructions, IN] = useState(""),
    [due, D] = useState(day(1)),
    [kind, K] = useState<Task["kind"]>("Tarea"),
    [filter, F] = useState("Todas"),
    [notice, N] = useState(""),
    [question, Q] = useState(""),
    [answer, A] = useState(""),
    [busy, B] = useState(false),
    [apiStatus, AS] = useState("Sin comprobar"),
    [testingAPI, TA] = useState(false),
    [mode, SM] = useState("dark"),
    [color, SC] = useState("blue"),
    [lang, SL] = useState("es"),
    [dyslexicMode, SD] = useState(false),
    [fontFamily, SF] = useState<keyof typeof FONT_OPTIONS>("system"),
    [fontScale, SFS] = useState("100"),
    [lineSpacing, SLS] = useState("normal"),
    [highContrast, SHC] = useState(false),
    [reduceMotion, SRM] = useState(false),
    [notify, SN] = useState(false),
    [userName, SU] = useState(""),
    [tutorSubject, TS] = useState("General"),
    [tutorLevel, TL] = useState("Secundaria"),
    [calendarImportBusy, setCalendarImportBusy] = useState(false),
    [calendarImportStatus, setCalendarImportStatus] = useState(""),
    [calendarDrafts, setCalendarDrafts] = useState<CalendarDraft[]>([]),
    [calendarFileName, setCalendarFileName] = useState(""),
    [lofiOpen, setLofiOpen] = useState(false),
    [lofiError, setLofiError] = useState("");
  useEffect(() => {
    if (!downloadPlatform) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("download-install-steps")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [downloadPlatform]);
  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const lofiQueueRef = useRef<LofiTrack[]>([]);
  const lofiIndexRef = useRef(0);
  const lofiCurrentRef = useRef<LofiTrack | null>(null);
  const [lofiTrackTitle, setLofiTrackTitle] = useState("");
  const startLofiTrack = (audio: HTMLAudioElement, track: LofiTrack) => {
    lofiCurrentRef.current = track;
    setLofiTrackTitle("");
    audio.src = track.src;
    audio.preload = "auto";
    audio.volume = 0.72;
    audio.onended = () => playNextLofiTrack(audio);
    void audio.play().then(() => {
      setLofiOpen(true);
      setLofiError("");
    }).catch(() => {
      setLofiOpen(false);
      setLofiError(lang === "en" ? "Could not play audio. Please try again." : "No se pudo reproducir el audio. Inténtalo de nuevo.");
    });
  };
  const playNextLofiTrack = (existingAudio?: HTMLAudioElement) => {
    let audio = existingAudio || lofiAudioRef.current;
    if (!audio) {
      audio = new Audio();
      lofiAudioRef.current = audio;
    }
    if (lofiQueueRef.current.length === 0 || lofiIndexRef.current >= lofiQueueRef.current.length) {
      lofiQueueRef.current = shuffledTracks(LOFI_TRACKS, lofiCurrentRef.current?.title);
      lofiIndexRef.current = 0;
    }
    const nextTrack = lofiQueueRef.current[lofiIndexRef.current++];
    if (nextTrack) startLofiTrack(audio, nextTrack);
  };
  const randomizeLofiMoment = () => {
    let audio = lofiAudioRef.current;
    if (!audio) {
      audio = new Audio();
      lofiAudioRef.current = audio;
    }
    const currentSrc = lofiCurrentRef.current?.src || audio.src;
    const alternatives = LOFI_TRACKS.filter((track) => track.src !== currentSrc);
    const pool = alternatives.length ? alternatives : LOFI_TRACKS;
    const track = pool[Math.floor(Math.random() * pool.length)];
    if (!track) return;

    audio.pause();
    audio.onended = null;
    audio.onerror = () => {
      setLofiOpen(false);
      setLofiError(lang === "en" ? "Could not play audio. Please try again." : "No se pudo reproducir el audio. Inténtalo de nuevo.");
    };
    lofiCurrentRef.current = track;
    setLofiTrackTitle("");
    setLofiError("");

    const startAtRandomMoment = () => {
      audio?.removeEventListener("loadedmetadata", startAtRandomMoment);
      if (!audio) return;
      const duration = audio.duration;
      if (Number.isFinite(duration) && duration > 2) {
        audio.currentTime = Math.random() * Math.max(1, duration - 3);
      }
      audio.onended = () => playNextLofiTrack(audio);
      void audio.play().then(() => {
        setLofiOpen(true);
        setLofiError("");
      }).catch(() => {
        setLofiOpen(false);
        setLofiError(lang === "en" ? "Could not play audio. Please try again." : "No se pudo reproducir el audio. Inténtalo de nuevo.");
      });
    };

    audio.addEventListener("loadedmetadata", startAtRandomMoment, { once: true });
    audio.src = track.src;
    audio.preload = "auto";
    audio.volume = 0.72;
    audio.load();
  };
  const toggleLofi = () => {
    const audio = lofiAudioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setLofiOpen(false);
      return;
    }
    if (audio && audio.paused && audio.src) {
      void audio.play().then(() => { setLofiOpen(true); setLofiError(""); }).catch(() => {
        setLofiError(lang === "en" ? "Audio could not resume. Check the tab and system volume." : "No se pudo reanudar el audio. Revisa el volumen del navegador y del sistema.");
      });
      return;
    }
    playNextLofiTrack();
  };

  useEffect(() => {
    return () => {
      if (lofiAudioRef.current) { lofiAudioRef.current.pause(); lofiAudioRef.current.onended = null; lofiAudioRef.current = null; }
    };
  }, []);
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v) S(JSON.parse(v));
      SM(localStorage.getItem("estudiax-mode") || "dark");
      SC(localStorage.getItem("estudiax-color") || "blue");
      SL(localStorage.getItem("estudiax-lang") || "es");
      SD(localStorage.getItem("estudiax-dyslexic") === "true");
      SF((localStorage.getItem("estudiax-font") as keyof typeof FONT_OPTIONS) || "system");
      SFS(localStorage.getItem("estudiax-font-scale") || "100");
      SLS(localStorage.getItem("estudiax-line-spacing") || "normal");
      SHC(localStorage.getItem("estudiax-high-contrast") === "true");
      SRM(localStorage.getItem("estudiax-reduce-motion") === "true");
      SN(localStorage.getItem("estudiax-notify") === "true");
      SU(localStorage.getItem("estudiax-name") || "");
    } catch {}
    R(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then(reg => reg.update()).catch(() => {});
  }, []);
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.colorTheme = color;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.dyslexic = dyslexicMode ? "on" : "off";
    document.documentElement.dataset.font = fontFamily;
    document.documentElement.dataset.fontScale = fontScale;
    document.documentElement.dataset.lineSpacing = lineSpacing;
    document.documentElement.dataset.highContrast = String(highContrast);
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
    localStorage.setItem("estudiax-font", fontFamily);
    localStorage.setItem("estudiax-font-scale", fontScale);
    localStorage.setItem("estudiax-line-spacing", lineSpacing);
    localStorage.setItem("estudiax-high-contrast", String(highContrast));
    localStorage.setItem("estudiax-reduce-motion", String(reduceMotion));
    localStorage.setItem("estudiax-mode", mode);
    localStorage.setItem("estudiax-color", color);
    localStorage.setItem("estudiax-lang", lang);
    localStorage.setItem("estudiax-dyslexic", String(dyslexicMode));
  }, [mode, color, lang, dyslexicMode, fontFamily, fontScale, lineSpacing, highContrast, reduceMotion]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("google_drive");
    if (!result) return;
    P("Google Drive");
    if (result === "connected") { try { localStorage.setItem("estudiax-drive-linked", "true"); } catch {} N((DRIVE_COPY[lang] || DRIVE_COPY.es).connectedFallback); }
    else { try { localStorage.removeItem("estudiax-drive-linked"); } catch {} N(`Google OAuth: ${params.get("reason") || "error"}`); }
    window.history.replaceState({}, "", window.location.pathname);
  }, []);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let shouldCheckDrive = page === "Google Drive";
    try { shouldCheckDrive = shouldCheckDrive || localStorage.getItem("estudiax-drive-linked") === "true"; } catch {}
    if (!shouldCheckDrive) {
      setDriveLoading(false);
      setDriveConnected(false);
      setDriveEmail("");
      return;
    }
    setDriveLoading(true);
    fetch("/api/google/drive/status", { credentials: "same-origin", cache: "no-store" })
      .then(async r => { if (!r.ok) throw new Error("status"); return r.json(); })
      .then(data => { if (!cancelled) { setDriveConnected(Boolean(data.connected)); setDriveEmail(typeof data.email === "string" ? data.email : ""); } })
      .catch(() => { if (!cancelled) { setDriveConnected(false); setDriveEmail(""); } })
      .finally(() => { if (!cancelled) setDriveLoading(false); });
    return () => { cancelled = true; };
  }, [ready, page]);
  useEffect(() => {
    if (!ready || !driveConnected || driveSaving) return;
    const checkSchedule = () => {
      const now = new Date();
      if (now.getDay() !== 2) return;
      const dayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
      const lastSuccess = localStorage.getItem("estudiax-drive-backup-tuesday-last-success");
      const lastAttempt = localStorage.getItem("estudiax-drive-backup-tuesday-last-attempt");
      if (lastSuccess === dayKey || lastAttempt === dayKey) return;
      localStorage.setItem("estudiax-drive-backup-tuesday-last-attempt", dayKey);
      N(({es:"Hoy toca el respaldo semanal de ESTUDIAX.",en:"Your weekly ESTUDIAX backup is due today.",fr:"La sauvegarde hebdomadaire d’ESTUDIAX est prévue aujourd’hui.",pt:"Hoje é dia do backup semanal do ESTUDIAX.",zh:"今天是 ESTUDIAX 每周备份日。",it:"Oggi è il giorno del backup settimanale di ESTUDIAX.",de:"Heute ist dein wöchentlicher ESTUDIAX-Backup-Tag.",ru:"Сегодня день еженедельного резервного копирования ESTUDIAX."} as Record<string,string>)[lang] || "Hoy toca el respaldo semanal de ESTUDIAX.");
      void saveEncryptedBackupToDrive(true);
    };
    checkSchedule();
    const timer = window.setInterval(checkSchedule, 60000);
    return () => window.clearInterval(timer);
  }, [ready, driveConnected, driveSaving, lang]);
  useEffect(() => {
    localStorage.setItem("estudiax-notify", String(notify));
    if (!notify || !ready) return;
    let cancelled = false;
    const check = async () => {
      const d = today();
      const dueTasks = tasks.filter((t) => !t.done && t.due === d);
      const hasNativeApi = typeof window.Notification !== "undefined";
      const canNotifyNatively = hasNativeApi && window.Notification.permission === "granted" && "serviceWorker" in navigator;
      if (!canNotifyNatively) {
        const fresh = dueTasks.filter((t) => !localStorage.getItem(`estudiax-inapp-reminded-${d}-${t.id}`));
        if (fresh.length && !cancelled) {
          const titles = fresh.slice(0, 3).map((t) => t.title).join(" · ");
          const extra = fresh.length > 3 ? ` (+${fresh.length - 3})` : "";
          N(lang === "en" ? `Due today: ${titles}${extra}` : lang === "fr" ? `À rendre aujourd’hui : ${titles}${extra}` : lang === "pt" ? `Para hoje: ${titles}${extra}` : lang === "zh" ? `今日到期：${titles}${extra}` : `Tareas para hoy: ${titles}${extra}`);
          for (const t of fresh) localStorage.setItem(`estudiax-inapp-reminded-${d}-${t.id}`, "1");
        }
        return;
      }
      for (const t of dueTasks) {
        const k = `estudiax-notified-${d}-${t.id}`;
        if (localStorage.getItem(k) || cancelled) continue;
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(
            lang === "en" ? "Estudiax · Reminder" : lang === "fr" ? "Estudiax · Rappel" : lang === "pt" ? "Estudiax · Lembrete" : lang === "zh" ? "Estudiax · 学习提醒" : "Estudiax · Recordatorio",
            {
              body: `${lang === "en" ? "Due today" : lang === "fr" ? "Pour aujourd’hui" : lang === "pt" ? "Para hoje" : lang === "zh" ? "今日待办" : "Para hoy"}: ${t.title}${t.subject ? ` · ${t.subject}` : ""}`,
              tag: k, icon: "/icons/icon.svg", data: { url: "/" },
            },
          );
          localStorage.setItem(k, "1");
        } catch {
          if (!cancelled) N(lang === "en" ? `Reminder: ${t.title}` : `Recordatorio: ${t.title}`);
        }
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 60000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [notify, ready, tasks, lang]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, ready]);
  const open = tasks.filter((t) => !t.done),
    done = tasks.filter((t) => t.done),
    progress = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0,
    upcoming = open.filter((t) => t.kind === "Parcial").sort((a, b) => a.due.localeCompare(b.due)),
    shown = tasks
      .filter(
        (t) =>
          filter === "Todas" ||
          (filter === "Pendientes"
            ? !t.done
            : filter === "Completadas"
              ? t.done
              : t.kind === filter),
      )
      .sort((a, b) => a.due.localeCompare(b.due));
  async function importCalendarFile(file?: File) {
    if (!file) return;
    const isIcs = file.name.toLowerCase().endsWith(".ics") || file.type === "text/calendar";
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = ["image/png", "image/jpeg", "image/webp", "image/bmp"].includes(file.type) || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
    if (!isPdf && !isImage && !isIcs) { N(lang === "en" ? "Choose an ICS, PDF, PNG, JPG, WEBP or BMP file." : "Elige un archivo ICS, PDF, PNG, JPG, WEBP o BMP."); return; }
    if (file.size > 10 * 1024 * 1024) { N(lang === "en" ? "The file must be 10 MB or smaller." : "El archivo debe pesar 10 MB o menos."); return; }
    if (isIcs) {
      setCalendarImportBusy(true); setCalendarImportStatus(lang === "en" ? "Reading calendar events…" : "Leyendo eventos del calendario…"); setCalendarDrafts([]); setCalendarFileName(file.name);
      try {
        const raw = (await file.text()).replace(/\r?\n[ \t]/g, "");
        if (!/BEGIN:VCALENDAR/i.test(raw)) throw new Error(lang === "en" ? "This does not look like a valid iCalendar (.ics) file." : "El archivo no parece ser un calendario iCalendar (.ics) válido.");
        const unescapeIcs = (value: string) => value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
        const events = raw.split(/BEGIN:VEVENT/i).slice(1).map(block => block.split(/END:VEVENT/i)[0]).map(block => {
          const prop = (name: string) => { const line = block.split(/\r?\n/).find(row => row.toUpperCase().startsWith(name.toUpperCase()+";") || row.toUpperCase().startsWith(name.toUpperCase()+":")); return line ? line.slice(line.indexOf(":")+1).trim() : ""; };
          const title = unescapeIcs(prop("SUMMARY")); const start = prop("DTSTART");
          const dateMatch = start.match(/^(\d{4})(\d{2})(\d{2})/);
          const due = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : "";
          const description = unescapeIcs(prop("DESCRIPTION"));
          if (!title) return null;
          return { title, subject: "General", due, kind: /exam|test|parcial|exam(en)?/i.test(title) ? "Parcial" as const : "Tarea" as const, instructions: description, selected: true };
        }).filter((event): event is NonNullable<typeof event> => event !== null);
        if (!events.length) throw new Error(lang === "en" ? "No events with titles were found in this ICS file." : "No se encontraron eventos con título en este archivo ICS.");
        setCalendarDrafts(events); setCalendarImportStatus(lang === "en" ? `${events.length} events found. Review them before adding.` : `${events.length} eventos detectados. Revísalos antes de agregarlos.`);
      } catch (error) { setCalendarImportStatus(error instanceof Error ? error.message : "No se pudo leer el archivo ICS."); }
      finally { setCalendarImportBusy(false); }
      return;
    }
    setCalendarImportBusy(true);
    setCalendarImportStatus(lang === "en" ? "Reading your file…" : lang === "fr" ? "Lecture du fichier…" : lang === "pt" ? "Lendo o arquivo…" : "Leyendo el archivo…");
    setCalendarDrafts([]);
    setCalendarFileName(file.name);
    let ocrWorker: Awaited<ReturnType<typeof import("tesseract.js").createWorker>> | undefined;
    try {
      let extractedText = "";
      const recognizeImage = async (source: File | Blob | HTMLCanvasElement) => {
        setCalendarImportStatus(lang === "en" ? "Recognizing text with OCR…" : lang === "fr" ? "Reconnaissance du texte (OCR)…" : lang === "pt" ? "Reconhecendo texto (OCR)…" : "Reconociendo texto con OCR…");
        const { createWorker } = await import("tesseract.js");
        if (!ocrWorker) ocrWorker = await createWorker("spa+eng", 1, { logger: (message: { status?: string; progress?: number }) => {
          if (message.status === "recognizing text" && typeof message.progress === "number") setCalendarImportStatus(`${lang === "en" ? "Reading text" : "Leyendo texto"}… ${Math.round(message.progress * 100)}%`);
        } });
        return (await ocrWorker.recognize(source)).data.text;
      };
      if (isPdf) {
        setCalendarImportStatus(lang === "en" ? "Reading PDF pages…" : "Leyendo las páginas del PDF…");
        const pdfjs = await import("pdfjs-dist");
        const workerModule = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        if (pdf.numPages > 12) throw new Error(lang === "en" ? "Import PDFs with up to 12 pages at a time." : "Por ahora importa PDF de hasta 12 páginas.");
        const pageTexts: string[] = [];
        const pagesToRead = pdf.numPages;
        for (let pageNo = 1; pageNo <= pagesToRead; pageNo++) {
          const page = await pdf.getPage(pageNo);
          const content = await page.getTextContent();
          const text = content.items.map(item => "str" in item ? item.str : "").join(" ").trim();
          pageTexts.push(text);
        }
        extractedText = pageTexts.filter(Boolean).join("\n\n");
        if (extractedText.replace(/\s/g, "").length < 80) {
          extractedText = "";
          for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
            const page = await pdf.getPage(pageNo);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
            const context = canvas.getContext("2d");
            if (!context) continue;
            await page.render({ canvas, canvasContext: context, viewport }).promise;
            extractedText += `\n\n${await recognizeImage(canvas)}`;
            canvas.width = 0; canvas.height = 0;
          }
        }
      } else {
        extractedText = await recognizeImage(file);
      }
      extractedText = extractedText.replace(/\u0000/g, " ").slice(0, 20000).trim();
      if (extractedText.length < 20) throw new Error(lang === "en" ? "No readable text found. Try a clearer image or PDF." : "No se encontró texto legible. Prueba con una captura o PDF más nítido.");
      setCalendarImportStatus(lang === "en" ? "Organizing dates with your existing AI model…" : lang === "fr" ? "Organisation des dates avec le modèle IA actuel…" : lang === "pt" ? "Organizando datas com o modelo de IA atual…" : "Organizando fechas con tu modelo de IA actual…");
      const result = await parseCalendarImport({ data: { extractedText, language: ["es", "en", "fr", "pt", "zh", "it", "de", "ru", "ja", "ko", "ar", "sw", "hi", "id", "tr", "vi", "nl"].includes(lang) ? lang as "es" | "en" | "fr" | "pt" | "zh" | "it" | "de" | "ru" | "ja" | "ko" | "ar" | "sw" | "hi" | "id" | "tr" | "vi" | "nl" : "es" } });
      if (!result.events.length) throw new Error(lang === "en" ? "No calendar activities were found in this file." : "No se detectaron actividades en este archivo.");
      setCalendarDrafts(result.events.map(event => ({ ...event, selected: true })));
      setCalendarImportStatus(lang === "en" ? `${result.events.length} activities found. Review them before adding.` : `${result.events.length} actividades detectadas. Revísalas antes de agregarlas.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al procesar el archivo.";
      setCalendarImportStatus(message.slice(0, 220));
    } finally {
      try { await ocrWorker?.terminate(); } catch {}
      setCalendarImportBusy(false);
    }
  }
  function confirmCalendarImport() {
    const selected = calendarDrafts.filter(event => event.selected && event.title.trim());
    if (!selected.length) { N(lang === "en" ? "Select at least one activity." : "Selecciona al menos una actividad."); return; }
    const existing = new Set(tasks.map(task => `${task.title.toLocaleLowerCase()}|${task.due}`));
    const additions: Task[] = selected.filter(event => !existing.has(`${event.title.trim().toLocaleLowerCase()}|${event.due}`)).map(event => ({ id: uid(), title: event.title.trim(), subject: event.subject.trim() || "General", due: event.due, kind: event.kind, instructions: event.instructions.trim(), done: false }));
    S(previous => [...previous, ...additions]);
    setCalendarDrafts([]); setCalendarImportStatus(""); setCalendarFileName("");
    N(lang === "en" ? `${additions.length} activities added to your calendar.` : lang === "fr" ? `${additions.length} activités ajoutées au calendrier.` : lang === "pt" ? `${additions.length} atividades adicionadas ao calendário.` : `${additions.length} actividades agregadas a tu calendario.`);
  }
  function save(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    S((p) => [
      ...p,
      {
        id: uid(),
        title: title.trim(),
        subject: subject.trim() || "General",
        instructions: instructions.trim(),
        due,
        kind,
        done: false,
      },
    ]);
    T("");
    U("");
    IN("");
    M(false);
    N("Actividad guardada en este dispositivo.");
  }
  function createStudyPlan() {
    const exams = upcoming.filter(t => t.due >= today());
    if (!exams.length) { N(lang === "en" ? "Add an upcoming exam first to create a study plan." : lang === "fr" ? "Ajoute un examen à venir pour créer un plan." : lang === "pt" ? "Adicione uma prova futura para criar um plano." : lang === "zh" ? "请先添加即将到来的考试，再创建学习计划。" : "Agrega un parcial futuro para crear un plan de estudio."); return; }
    const planned: Task[] = [];
    const stages = [
      { es: "Organiza el tema", en: "Map the topic", fr: "Organiser le thème", pt: "Organize o tema", zh: "梳理主题", instructions: { es: "Divide el tema en 3–5 ideas clave. Revisa apuntes y marca lo que todavía no entiendes. Dedica unos 25 minutos.", en: "Break the topic into 3–5 key ideas. Review your notes and mark anything you still don't understand. Spend about 25 minutes.", fr: "Divise le sujet en 3 à 5 idées clés. Relis tes notes et marque ce que tu ne comprends pas encore. Environ 25 minutes.", pt: "Divida o tema em 3–5 ideias principais. Revise suas anotações e marque o que ainda não entende. Cerca de 25 minutos.", zh: "将主题拆分为 3–5 个关键点。复习笔记，并标记尚未理解的内容。建议学习约 25 分钟。" } },
      { es: "Recuerdo activo", en: "Active recall", fr: "Rappel actif", pt: "Recordação ativa", zh: "主动回忆", instructions: { es: "Cierra los apuntes y explica el tema con tus propias palabras. Después comprueba qué olvidaste y corrígelo. Dedica unos 25 minutos.", en: "Close your notes and explain the topic in your own words. Check what you forgot and correct it. Spend about 25 minutes.", fr: "Ferme tes notes et explique le sujet avec tes propres mots. Vérifie ce que tu as oublié et corrige-le. Environ 25 minutes.", pt: "Feche as anotações e explique o tema com suas próprias palavras. Confira o que esqueceu e corrija. Cerca de 25 minutos.", zh: "合上笔记，用自己的话解释主题。检查遗漏的内容并加以纠正。建议学习约 25 分钟。" } },
      { es: "Ejercicios de práctica", en: "Practice questions", fr: "Exercices pratiques", pt: "Exercícios práticos", zh: "练习题", instructions: { es: "Resuelve ejercicios o crea 5 preguntas sin mirar la respuesta. Revisa cada error y anota por qué ocurrió. Dedica unos 25 minutos.", en: "Solve practice problems or create five questions without looking at the answers. Review each mistake and note why it happened. Spend about 25 minutes.", fr: "Résous des exercices ou crée cinq questions sans regarder les réponses. Analyse chaque erreur et note sa cause. Environ 25 minutes.", pt: "Resolva exercícios ou crie cinco perguntas sem olhar as respostas. Revise cada erro e anote a causa. Cerca de 25 minutos.", zh: "完成练习，或在不看答案的情况下自拟 5 道题。检查每个错误并记录原因。建议学习约 25 分钟。" } },
      { es: "Repaso final", en: "Final review", fr: "Révision finale", pt: "Revisão final", zh: "最后复习", instructions: { es: "Haz un repaso breve de los puntos difíciles y responde 5 preguntas de memoria. Evita aprender todo de cero la noche anterior; prioriza descansar.", en: "Briefly review the hardest points and answer five questions from memory. Avoid relearning everything the night before; prioritize rest.", fr: "Revois brièvement les points difficiles et réponds à cinq questions de mémoire. Évite de tout réapprendre la veille et privilégie le repos.", pt: "Revise brevemente os pontos difíceis e responda a cinco perguntas de memória. Evite reaprender tudo na véspera; priorize o descanso.", zh: "简要复习难点，并凭记忆回答 5 个问题。不要在考试前一晚从头学习所有内容，优先保证休息。" } },
    ];
    for (const exam of exams) {
      const examDate = new Date(`${exam.due}T12:00:00`).getTime();
      const daysLeft = Math.max(0, Math.ceil((examDate - new Date(`${today()}T12:00:00`).getTime()) / 86400000));
      const count = Math.min(stages.length, Math.max(1, daysLeft));
      const selectedStages = count === 1 ? [stages[2]] : stages.slice(0, count);
      for (let i = 0; i < selectedStages.length; i++) {
        const offset = daysLeft === 0 ? 0 : Math.min(daysLeft - 1, Math.floor((daysLeft * (i + 1)) / (selectedStages.length + 1)));
        const sessionDay = day(offset);
        const marker = `[plan:${exam.id}:${sessionDay}]`;
        if (tasks.some(t => t.instructions.includes(marker)) || planned.some(t => t.instructions.includes(marker))) continue;
        const stage = selectedStages[i];
        const prefix = lang === "en" ? stage.en : lang === "fr" ? stage.fr : lang === "pt" ? stage.pt : lang === "zh" ? stage.zh : stage.es;
        const detail = (stage.instructions as Record<string, string>)[lang] || stage.instructions.es;
        planned.push({ id: uid(), title: `${prefix}: ${exam.title}`, subject: exam.subject, due: sessionDay, kind: "Estudio", instructions: `${marker} ${detail}`, done: false });
      }
    }
    if (!planned.length) { N(lang === "en" ? "Your study plan already exists." : lang === "fr" ? "Ton plan d’étude existe déjà." : lang === "pt" ? "Seu plano de estudos já existe." : lang === "zh" ? "学习计划已经存在。" : "Ya existe un plan para tus próximos parciales."); return; }
    S(prev => [...prev, ...planned]);
    N(lang === "en" ? `Study plan created: ${planned.length} spaced sessions added.` : lang === "fr" ? `Plan créé : ${planned.length} séances réparties dans le temps.` : lang === "pt" ? `Plano criado: ${planned.length} sessões distribuídas ao longo dos dias.` : lang === "zh" ? `学习计划已创建：添加了 ${planned.length} 个分散安排的学习时段。` : `Plan creado: se agregaron ${planned.length} sesiones variadas y espaciadas a tus actividades.`);
  }
  function toggle(t: Task) {
    S((p) => p.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
  }
  function del(t: Task) {
    S((p) => p.filter((x) => x.id !== t.id));
  }
  async function saveEncryptedBackupToDrive(scheduled = false) {
    const password = prompt(scheduled ? ({es:"Respaldo de los martes: introduce tu contraseña de respaldo (12 caracteres o más). No se guardará ni se enviará.",en:"Tuesday backup: enter your backup password (12+ characters). It will not be stored or uploaded.",fr:"Sauvegarde du mardi : saisissez votre mot de passe (12 caractères ou plus). Il ne sera ni enregistré ni envoyé.",pt:"Backup de terça-feira: digite sua senha (12 caracteres ou mais). Ela não será armazenada nem enviada.",zh:"周二备份：请输入备份密码（至少 12 个字符）。密码不会保存或上传。",it:"Backup del martedì: inserisci la password (almeno 12 caratteri). Non verrà salvata né caricata.",de:"Dienstags-Backup: Gib dein Passwort ein (mindestens 12 Zeichen). Es wird weder gespeichert noch hochgeladen.",ru:"Резервная копия во вторник: введите пароль (не менее 12 символов). Он не будет сохранён или отправлен."} as Record<string,string>)[lang] : ({es:"Elige una contraseña segura (12 caracteres o más). La contraseña no se sube a Drive.",en:"Choose a strong backup password (12+ characters). The password is not uploaded.",fr:"Choisissez un mot de passe fort (12 caractères ou plus). Il ne sera pas envoyé.",pt:"Escolha uma senha forte (12+ caracteres). Ela não será enviada.",zh:"请设置至少 12 个字符的强密码。密码不会上传。",it:"Scegli una password sicura (almeno 12 caratteri). La password non viene caricata.",de:"Wähle ein sicheres Backup-Passwort (mindestens 12 Zeichen). Das Passwort wird nicht hochgeladen.",ru:"Задайте надёжный пароль резервной копии (не менее 12 символов). Пароль не загружается."} as Record<string,string>)[lang]);
    if (!password) return;
    if (password.length < 12) { N(({es:"Usa al menos 12 caracteres.",en:"Use at least 12 characters.",fr:"Utilisez au moins 12 caractères.",pt:"Use pelo menos 12 caracteres.",zh:"请至少使用 12 个字符。",it:"Usa almeno 12 caratteri.",de:"Verwende mindestens 12 Zeichen.",ru:"Используйте не менее 12 символов."} as Record<string,string>)[lang] || "Usa al menos 12 caracteres."); return; }
    setDriveSaving(true);
    try {
      const payload = { version:1, exportedAt:new Date().toISOString(), tasks, settings:{mode,color,lang,fontFamily,fontScale,lineSpacing,highContrast,reduceMotion,dyslexicMode,userName}, localData:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith("estudiax-")&&!k.includes("notified-")).map(k=>[k,localStorage.getItem(k)])) };
      const content = await encryptBackup(payload,password);
      const response = await fetch("/api/google/drive/status",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({content})});
      const result = await response.json().catch(()=>({})) as {ok?:boolean;error?:string;url?:string|null};
      if (!response.ok || !result.ok) throw new Error(result.error || "upload_failed");
      N(({es:"Respaldo cifrado guardado en Google Drive.",en:"Encrypted backup saved to Google Drive.",fr:"Sauvegarde chiffrée enregistrée dans Google Drive.",pt:"Backup criptografado salvo no Google Drive.",zh:"加密备份已保存到 Google Drive。",it:"Backup crittografato salvato su Google Drive.",de:"Verschlüsseltes Backup in Google Drive gespeichert.",ru:"Зашифрованная копия сохранена в Google Drive."} as Record<string,string>)[lang] || "Respaldo cifrado guardado en Google Drive.");
      if (new Date().getDay() === 2) {
        const now = new Date();
        localStorage.setItem("estudiax-drive-backup-tuesday-last-success", `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`);
      }
    } catch {
      N(driveText.saveFailed);
    } finally { setDriveSaving(false); }
  }
  async function testAPI() {
    TA(true);
    try {
      const r = await testTutorConnection({ data: {} });
      AS(r.ok ? "Conectado" : "Revisar configuración");
      N(r.message);
    } catch {
      AS("Error de conexión");
      N("No se pudo comprobar la conexión. Verifica los secretos y vuelve a desplegar.");
    } finally {
      TA(false);
    }
  }
  async function tutor(e: FormEvent) {
    e.preventDefault();
    B(true);
    A("");
    try {
      const r = await askTutor({
        data: {
          question: `Materia: ${tutorSubject}. Nivel: ${tutorLevel}. Responde adaptándote a ese nivel.

${question}`,
          context: open
            .slice()
            .sort((a, b) => a.due.localeCompare(b.due))
            .slice(0, 5)
            .map((t) => {
              const details = `${t.kind} | ${t.subject.slice(0, 50)}: ${t.title.slice(0, 100)} (${t.due || "sin fecha"})`;
              const topics = t.instructions?.trim().slice(0, 140);
              return topics ? `${details}\nTemas: ${topics}` : details;
            })
            .join("\n"),
        },
      });
      A(r.answer);
      AS("Conectado");
    } catch {
      A(
        "No se pudo conectar. Configura GROQ_API_KEY como secreto del servidor y vuelve a desplegar. También puedes abrir ChatGPT por separado.",
      );
      AS("Revisar configuración");
    } finally {
      B(false);
    }
  }
  const words: Record<string, Record<string, string>> = {
    ar: {
      "Inicio":"الرئيسية", "Mis actividades":"مهامي", "Calendario":"التقويم", "Tutor IA":"معلّم الذكاء الاصطناعي", "Google Drive":"Google Drive", "Ajustes":"الإعدادات", "Tarjetas":"بطاقات تعليمية", "Exámenes":"الاختبارات", "Estadísticas":"الإحصاءات", "Enfoque":"التركيز", "Apuntes":"الملاحظات", "ESPACIO DE ESTUDIO":"مساحة الدراسة", "Privacidad":"الخصوصية", "Condiciones":"الشروط", "Tu espacio privado":"مساحتك الخاصة", "Datos guardados en este navegador.":"تُحفظ البيانات في هذا المتصفح.", "Vamos paso a paso.":"خطوة بخطوة.", "Organiza lo importante. Lo demás puede esperar.":"نظّم الأمور المهمة، ويمكن للباقي الانتظار.", "Nueva actividad":"مهمة جديدة", "Por hacer":"قيد الإنجاز", "actividades pendientes":"مهام معلّقة", "Para hoy":"اليوم", "con fecha de hoy":"موعدها اليوم", "Progreso general":"التقدم العام", "En tu radar":"قريبًا", "Lo próximo en tu lista":"التالي في قائمتك", "Ver todas ↗":"عرض الكل ↗", "Próximos parciales":"الاختبارات القادمة", "Prepárate con tiempo":"استعد مبكرًا", "Añadir parcial":"إضافة اختبار", "¿Algo no te queda claro?":"هل هناك شيء غير واضح؟", "Convierte una duda en explicación y ejercicios.":"حوّل سؤالك إلى شرح وتمارين.", "Estudiar con IA ↗":"الدراسة بالذكاء الاصطناعي ↗", "Marca lo que termines.":"حدّد ما أنجزته.", "Tus entregas y exámenes en orden cronológico.":"واجباتك واختباراتك مرتبة حسب التاريخ.", "Tu tutor de estudio":"مساعدك الدراسي", "Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.":"شروحات واضحة وأمثلة وتمارين للتأكد من الفهم.", "¿Qué vamos a aprender?":"ماذا سنتعلم؟", "Tu pregunta":"سؤالك", "Pide ejemplos, no solo la respuesta.":"اطلب أمثلة، وليس الإجابة فقط.", "Preguntar ↗":"اسأل ↗", "Respuesta del tutor":"إجابة المساعد", "¿Quieres continuar en ChatGPT?":"هل تريد المتابعة في ChatGPT؟", "Abrir ChatGPT ↗":"فتح ChatGPT ↗", "Controla tus datos y recordatorios.":"تحكّم في بياناتك وتذكيراتك.", "Conexión con Groq":"الاتصال بـ Groq", "Modelo IA":"نموذج الذكاء الاصطناعي", "Datos locales":"البيانات المحلية", "Exporta una copia de tus actividades.":"صدّر نسخة من مهامك.", "Exportar copia":"تصدير نسخة", "Notificaciones":"الإشعارات", "Borrar datos locales":"حذف البيانات المحلية", "Borrar datos":"حذف البيانات", "Todo en orden":"كل شيء على ما يرام", "No hay actividades en esta sección todavía.":"لا توجد مهام في هذا القسم بعد.", "Idioma":"اللغة", "Language":"اللغة", "Dyslexia-friendly mode":"وضع ملائم لعسر القراءة", "Appearance · mode":"المظهر · الوضع", "Choose how Estudiax looks.":"اختر مظهر Estudiax.", "Change the interface language.":"غيّر لغة الواجهة.", "Black":"أسود", "White":"أبيض", "Claro":"فاتح", "Oscuro":"داكن", "Conectado":"متصل", "Revisar configuración":"مراجعة الإعدادات", "Sin comprobar":"لم يتم التحقق", "Tarea":"مهمة", "Parcial":"اختبار", "Estudio":"دراسة", "Eliminar":"حذف", "Materia":"المادة", "Título":"العنوان", "Guardar":"حفظ", "Cancelar":"إلغاء", "Agregar pregunta":"إضافة سؤال", "Privacidad y seguridad":"الخصوصية والأمان", "Descargas de la app":"تنزيل التطبيق", "Colores":"الألوان", "Descarga e instalación":"التنزيل والتثبيت", "Elige tu dispositivo":"اختر جهازك", "Añadir a pantalla de inicio":"إضافة إلى الشاشة الرئيسية", "Instalar ESTUDIAX":"تثبيت ESTUDIAX", "Google Drive conectado":"Google Drive متصل", "Conectar Google Drive":"ربط Google Drive", "Desconectar":"قطع الاتصال", "Guardar respaldo cifrado en Drive":"حفظ نسخة احتياطية مشفرة في Drive", "Play smooth jazz":"تشغيل موسيقى الجاز الهادئة", "Pause smooth jazz":"إيقاف موسيقى الجاز مؤقتًا", "Play jazz":"تشغيل الجاز", "Pause jazz":"إيقاف الجاز مؤقتًا", "Reproducir jazz suave":"تشغيل الجاز الهادئ", "Pausar jazz suave":"إيقاف الجاز الهادئ مؤقتًا", "Reproducir otra pista aleatoria":"تشغيل مقطع عشوائي آخر", "Siguiente pista de jazz":"مقطع الجاز التالي"
    },
    sw: {
      "Inicio":"Nyumbani", "Mis actividades":"Shughuli zangu", "Calendario":"Kalenda", "Tutor IA":"Mkufunzi wa AI", "Google Drive":"Google Drive", "Ajustes":"Mipangilio", "Tarjetas":"Kadi za kujifunza", "Exámenes":"Mitihani", "Estadísticas":"Takwimu", "Enfoque":"Umakini", "Apuntes":"Dokezo", "ESPACIO DE ESTUDIO":"NAFASI YA KUSOMEA", "Privacidad":"Faragha", "Condiciones":"Masharti", "Tu espacio privado":"Nafasi yako binafsi", "Datos guardados en este navegador.":"Data huhifadhiwa kwenye kivinjari hiki.", "Vamos paso a paso.":"Twende hatua kwa hatua.", "Organiza lo importante. Lo demás puede esperar.":"Panga yaliyo muhimu. Mengine yanaweza kusubiri.", "Nueva actividad":"Shughuli mpya", "Por hacer":"Ya kufanya", "actividades pendientes":"shughuli ambazo hazijakamilika", "Para hoy":"Kwa leo", "con fecha de hoy":"zinazopaswa kukamilika leo", "Progreso general":"Maendeleo kwa ujumla", "En tu radar":"Yanayokuja", "Lo próximo en tu lista":"Jambo linalofuata", "Ver todas ↗":"Tazama yote ↗", "Próximos parciales":"Mitihani ijayo", "Prepárate con tiempo":"Jiandae mapema", "Añadir parcial":"Ongeza mtihani", "¿Algo no te queda claro?":"Kuna jambo haliko wazi?", "Convierte una duda en explicación y ejercicios.":"Badilisha swali kuwa maelezo na mazoezi.", "Estudiar con IA ↗":"Soma kwa kutumia AI ↗", "Marca lo que termines.":"Weka alama kwa ulichomaliza.", "Tus entregas y exámenes en orden cronológico.":"Kazi na mitihani yako kwa mpangilio wa tarehe.", "Tu tutor de estudio":"Mkufunzi wako wa masomo", "Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.":"Maelezo wazi, mifano na mazoezi ya kuthibitisha uelewa.", "¿Qué vamos a aprender?":"Tutajifunza nini?", "Tu pregunta":"Swali lako", "Pide ejemplos, no solo la respuesta.":"Omba mifano, si jibu pekee.", "Preguntar ↗":"Uliza ↗", "Respuesta del tutor":"Jibu la mkufunzi", "¿Quieres continuar en ChatGPT?":"Ungependa kuendelea kwenye ChatGPT?", "Abrir ChatGPT ↗":"Fungua ChatGPT ↗", "Controla tus datos y recordatorios.":"Dhibiti data na vikumbusho vyako.", "Conexión con Groq":"Muunganisho wa Groq", "Modelo IA":"Muundo wa AI", "Datos locales":"Data ya ndani", "Exporta una copia de tus actividades.":"Hamisha nakala ya shughuli zako.", "Exportar copia":"Hamisha nakala", "Notificaciones":"Arifa", "Borrar datos locales":"Futa data ya ndani", "Borrar datos":"Futa data", "Todo en orden":"Kila kitu kiko sawa", "No hay actividades en esta sección todavía.":"Bado hakuna shughuli katika sehemu hii.", "Idioma":"Lugha", "Language":"Lugha", "Dyslexia-friendly mode":"Fonti rafiki kwa dyslexia", "Appearance · mode":"Mwonekano · hali", "Choose how Estudiax looks.":"Chagua mwonekano wa Estudiax.", "Change the interface language.":"Badilisha lugha ya kiolesura.", "Black":"Nyeusi", "White":"Nyeupe", "Claro":"Mwanga", "Oscuro":"Giza", "Conectado":"Imeunganishwa", "Revisar configuración":"Kagua mipangilio", "Sin comprobar":"Haijakaguliwa", "Tarea":"Kazi", "Parcial":"Mtihani", "Estudio":"Kusoma", "Eliminar":"Futa", "Materia":"Somo", "Título":"Kichwa", "Guardar":"Hifadhi", "Cancelar":"Ghairi", "Agregar pregunta":"Ongeza swali", "Privacidad y seguridad":"Faragha na usalama"
    },
    ja: {
      'Inicio':'ホーム','Mis actividades':'自分のタスク','Calendario':'カレンダー','Tutor IA':'AIチューター','Google Drive':'Google ドライブ','Ajustes':'設定','Tarjetas':'単語カード','Exámenes':'テスト','Estadísticas':'学習統計','Enfoque':'集中タイマー','Apuntes':'ノート','ESPACIO DE ESTUDIO':'学習スペース','Privacidad':'プライバシー','Condiciones':'利用規約','Tu espacio privado':'あなたのプライベートスペース','Datos guardados en este navegador.':'データはこのブラウザーに保存されます。','Vamos paso a paso.':'一歩ずつ進もう。','Organiza lo importante. Lo demás puede esperar.':'大切なことから整理しよう。ほかのことは後回しで大丈夫。','Nueva actividad':'新しいタスク','Por hacer':'未完了','actividades pendientes':'件の未完了タスク','Para hoy':'今日','con fecha de hoy':'今日が期限','Progreso general':'全体の進捗','En tu radar':'近日中','Lo próximo en tu lista':'次の予定','Ver todas ↗':'すべて見る ↗','Próximos parciales':'今後のテスト','Prepárate con tiempo':'早めに準備しよう','Añadir parcial':'テストを追加','¿Algo no te queda claro?':'わからないことがある？','Convierte una duda en explicación y ejercicios.':'疑問を解説と練習問題に変えよう。','Estudiar con IA ↗':'AIで学習 ↗','Marca lo que termines.':'終わったタスクにチェックを付けよう。','Tus entregas y exámenes en orden cronológico.':'課題とテストを日付順に表示します。','Tu tutor de estudio':'学習チューター','Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.':'わかりやすい説明、例題、理解度を確かめる練習問題。','¿Qué vamos a aprender?':'何を学びますか？','Tu pregunta':'質問','Pide ejemplos, no solo la respuesta.':'答えだけでなく例も聞いてみよう。','Preguntar ↗':'質問する ↗','Respuesta del tutor':'チューターの回答','¿Quieres continuar en ChatGPT?':'ChatGPTで続けますか？','Abrir ChatGPT ↗':'ChatGPTを開く ↗','Controla tus datos y recordatorios.':'データとリマインダーを管理します。','Conexión con Groq':'Groq 接続','Modelo IA':'AIモデル','Datos locales':'ローカルデータ','Exporta una copia de tus actividades.':'タスクのバックアップをエクスポートします。','Exportar copia':'バックアップをエクスポート','Notificaciones':'通知','Borrar datos locales':'ローカルデータを削除','Borrar datos':'データを削除','Todo en orden':'問題ありません','No hay actividades en esta sección todavía.':'このセクションにはまだタスクがありません。','Idioma':'言語','Language':'言語','Dyslexia-friendly mode':'読みやすさサポートモード','Appearance · mode':'外観・モード','Choose how Estudiax looks.':'Estudiaxの外観を設定します。','Change the interface language.':'インターフェースの言語を変更します。','Black':'黒','White':'白','Claro':'ライト','Oscuro':'ダーク','Conectado':'接続済み','Revisar configuración':'設定を確認','Sin comprobar':'未確認','Tarea':'タスク','Parcial':'テスト','Estudio':'学習','Eliminar':'削除','Materia':'科目','Título':'タイトル','Guardar':'保存','Cancelar':'キャンセル','Agregar pregunta':'質問を追加','Privacidad y seguridad':'プライバシーとセキュリティ'
    },
    ko: {
      'Inicio':'홈','Mis actividades':'내 과제','Calendario':'캘린더','Tutor IA':'AI 튜터','Google Drive':'Google 드라이브','Ajustes':'설정','Tarjetas':'플래시카드','Exámenes':'시험','Estadísticas':'학습 통계','Enfoque':'집중 타이머','Apuntes':'노트','ESPACIO DE ESTUDIO':'학습 공간','Privacidad':'개인정보 보호','Condiciones':'이용 약관','Tu espacio privado':'나만의 비공개 공간','Datos guardados en este navegador.':'데이터는 이 브라우저에 저장됩니다.','Vamos paso a paso.':'한 걸음씩 나아가요.','Organiza lo importante. Lo demás puede esperar.':'중요한 일부터 정리하세요. 나머지는 기다려도 괜찮아요.','Nueva actividad':'새 과제','Por hacer':'할 일','actividades pendientes':'개의 미완료 과제','Para hoy':'오늘','con fecha de hoy':'오늘 마감','Progreso general':'전체 진행률','En tu radar':'다가오는 일정','Lo próximo en tu lista':'다음 일정','Ver todas ↗':'모두 보기 ↗','Próximos parciales':'다가오는 시험','Prepárate con tiempo':'미리 준비하세요','Añadir parcial':'시험 추가','¿Algo no te queda claro?':'이해가 안 되는 부분이 있나요?','Convierte una duda en explicación y ejercicios.':'궁금한 점을 설명과 연습 문제로 바꿔 보세요.','Estudiar con IA ↗':'AI로 공부하기 ↗','Marca lo que termines.':'완료한 과제를 표시하세요.','Tus entregas y exámenes en orden cronológico.':'과제와 시험을 날짜순으로 정리합니다.','Tu tutor de estudio':'학습 튜터','Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.':'명확한 설명, 예시, 이해도를 확인하는 연습 문제.','¿Qué vamos a aprender?':'무엇을 배울까요?','Tu pregunta':'질문','Pide ejemplos, no solo la respuesta.':'답뿐 아니라 예시도 요청해 보세요.','Preguntar ↗':'질문하기 ↗','Respuesta del tutor':'튜터 답변','¿Quieres continuar en ChatGPT?':'ChatGPT에서 계속할까요?','Abrir ChatGPT ↗':'ChatGPT 열기 ↗','Controla tus datos y recordatorios.':'데이터와 알림을 관리하세요.','Conexión con Groq':'Groq 연결','Modelo IA':'AI 모델','Datos locales':'로컬 데이터','Exporta una copia de tus actividades.':'과제 백업을 내보냅니다.','Exportar copia':'백업 내보내기','Notificaciones':'알림','Borrar datos locales':'로컬 데이터 삭제','Borrar datos':'데이터 삭제','Todo en orden':'모두 정상입니다','No hay actividades en esta sección todavía.':'이 섹션에는 아직 과제가 없습니다.','Idioma':'언어','Language':'언어','Dyslexia-friendly mode':'난독증 친화 모드','Appearance · mode':'모양 · 모드','Choose how Estudiax looks.':'Estudiax의 모양을 설정하세요.','Change the interface language.':'인터페이스 언어를 변경합니다.','Black':'검정','White':'흰색','Claro':'라이트','Oscuro':'다크','Conectado':'연결됨','Revisar configuración':'설정 확인','Sin comprobar':'확인되지 않음','Tarea':'과제','Parcial':'시험','Estudio':'학습','Eliminar':'삭제','Materia':'과목','Título':'제목','Guardar':'저장','Cancelar':'취소','Agregar pregunta':'질문 추가','Privacidad y seguridad':'개인정보 및 보안'
    },
    ru: {
      'Inicio': 'Главная',
      'Mis actividades': 'Мои задания',
      'Calendario': 'Календарь',
      'Tutor IA': 'ИИ-репетитор',
      'Google Drive': 'Google Диск',
      'Ajustes': 'Настройки',
      'Tarjetas': 'Карточки',
      'Exámenes': 'Пробные экзамены',
      'Estadísticas': 'Статистика',
      'Enfoque': 'Фокус-таймер',
      'Apuntes': 'Заметки',
      'ESPACIO DE ESTUDIO': 'УЧЕБНОЕ ПРОСТРАНСТВО',
      'Privacidad': 'Конфиденциальность',
      'Condiciones': 'Условия',
      'Tu espacio privado': 'Ваше личное пространство',
      'Datos guardados en este navegador.': 'Данные сохранены в этом браузере.',
      'Vamos paso a paso.': 'Шаг за шагом.',
      'Organiza lo importante. Lo demás puede esperar.': 'Расставьте приоритеты. Остальное подождёт.',
      'Nueva actividad': 'Новое задание',
      'Por hacer': 'Нужно сделать',
      'actividades pendientes': 'невыполненных заданий',
      'Para hoy': 'На сегодня',
      'con fecha de hoy': 'срок сегодня',
      'Progreso general': 'Общий прогресс',
      'En tu radar': 'Скоро',
      'Lo próximo en tu lista': 'Следующее в списке',
      'Ver todas ↗': 'Посмотреть все ↗',
      'Próximos parciales': 'Предстоящие экзамены',
      'Prepárate con tiempo': 'Подготовьтесь заранее',
      'Añadir parcial': 'Добавить экзамен',
      '¿Algo no te queda claro?': 'Что-то непонятно?',
      'Convierte una duda en explicación y ejercicios.': 'Превратите вопрос в объяснение и упражнения.',
      'Estudiar con IA ↗': 'Учиться с ИИ ↗',
      'Marca lo que termines.': 'Отмечайте выполненное.',
      'Tus entregas y exámenes en orden cronológico.': 'Задания и экзамены в хронологическом порядке.',
      'Tu tutor de estudio': 'Ваш учебный помощник',
      'Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.': 'Понятные объяснения, примеры и упражнения для проверки знаний.',
      '¿Qué vamos a aprender?': 'Чему будем учиться?',
      'Tu pregunta': 'Ваш вопрос',
      'Pide ejemplos, no solo la respuesta.': 'Просите примеры, а не только ответ.',
      'Preguntar ↗': 'Спросить ↗',
      'Respuesta del tutor': 'Ответ помощника',
      '¿Quieres continuar en ChatGPT?': 'Продолжить в ChatGPT?',
      'Abrir ChatGPT ↗': 'Открыть ChatGPT ↗',
      'Controla tus datos y recordatorios.': 'Управляйте данными и напоминаниями.',
      'Conexión con Groq': 'Подключение к Groq',
      'Modelo IA': 'Модель ИИ',
      'Datos locales': 'Локальные данные',
      'Exporta una copia de tus actividades.': 'Экспортируйте копию заданий.',
      'Exportar copia': 'Экспортировать копию',
      'Notificaciones': 'Уведомления',
      'Borrar datos locales': 'Удалить локальные данные',
      'Borrar datos': 'Удалить данные',
      'Todo en orden': 'Всё в порядке',
      'No hay actividades en esta sección todavía.': 'В этом разделе пока нет заданий.',
      'Idioma': 'Язык',
      'Language': 'Язык',
      'Dyslexia-friendly mode': 'Режим для людей с дислексией',
      'Appearance · mode': 'Внешний вид · режим',
      'Choose how Estudiax looks.': 'Настройте внешний вид Estudiax.',
    },
    it: {
      'Inicio': 'Home',
      'Mis actividades': 'Le mie attività',
      'Calendario': 'Calendario',
      'Tutor IA': 'Tutor IA',
      'Google Drive': 'Google Drive',
      'Ajustes': 'Impostazioni',
      'Tarjetas': 'Flashcard',
      'Exámenes': 'Esami',
      'Estadísticas': 'Statistiche',
      'Enfoque': 'Concentrazione',
      'Apuntes': 'Appunti',
      'ESPACIO DE ESTUDIO': 'SPAZIO DI STUDIO',
      'Privacidad': 'Privacy',
      'Condiciones': 'Termini',
      'Tu espacio privado': 'Il tuo spazio privato',
      'Datos guardados en este navegador.': 'Dati salvati in questo browser.',
      'Vamos paso a paso.': 'Un passo alla volta.',
      'Organiza lo importante. Lo demás puede esperar.': 'Organizza ciò che conta. Il resto può aspettare.',
      'Nueva actividad': 'Nuova attività',
      'Por hacer': 'Da fare',
      'actividades pendientes': 'attività in sospeso',
      'Para hoy': 'Per oggi',
      'con fecha de hoy': 'con scadenza oggi',
      'Progreso general': 'Progresso generale',
      'En tu radar': 'In arrivo',
      'Lo próximo en tu lista': 'Il prossimo nella lista',
      'Ver todas ↗': 'Vedi tutto ↗',
      'Próximos parciales': 'Prossimi esami',
      'Prepárate con tiempo': 'Preparati in anticipo',
      'Añadir parcial': 'Aggiungi esame',
      '¿Algo no te queda claro?': 'Qualcosa non è chiaro?',
      'Convierte una duda en explicación y ejercicios.': 'Trasforma un dubbio in spiegazioni ed esercizi.',
      'Estudiar con IA ↗': 'Studia con l’IA ↗',
      'Marca lo que termines.': 'Segna ciò che hai completato.',
      'Tu tutor de estudio': 'Il tuo tutor di studio',
      'Tu pregunta': 'La tua domanda',
      'Preguntar ↗': 'Chiedi ↗',
      'Respuesta del tutor': 'Risposta del tutor',
      'Abrir ChatGPT ↗': 'Apri ChatGPT ↗',
      'Controla tus datos y recordatorios.': 'Gestisci dati e promemoria.',
      'Conexión con Groq': 'Connessione a Groq',
      'Modelo IA': 'Modello IA',
      'Datos locales': 'Dati locali',
      'Exportar copia': 'Esporta copia',
      'Notificaciones': 'Notifiche',
      'Borrar datos locales': 'Elimina dati locali',
      'Borrar datos': 'Elimina dati',
      'Todo en orden': 'Tutto in ordine',
      'No hay actividades en esta sección todavía.': 'Non ci sono ancora attività in questa sezione.',
      'Idioma': 'Lingua',
      'Change the interface language.': 'Cambia la lingua dell’interfaccia.',
      'Black': 'Nero',
      'White': 'Bianco',
      'Dyslexia-friendly mode': 'Modalità adatta alla dislessia',
      'Language': 'Lingua',
      'Appearance · mode': 'Aspetto · modalità',
      'Choose how Estudiax looks.': 'Scegli l’aspetto di Estudiax.',
    },
    de: {
      'Inicio': 'Startseite',
      'Mis actividades': 'Meine Aufgaben',
      'Calendario': 'Kalender',
      'Tutor IA': 'KI-Lernhilfe',
      'Google Drive': 'Google Drive',
      'Ajustes': 'Einstellungen',
      'Tarjetas': 'Lernkarten',
      'Exámenes': 'Übungstests',
      'Estadísticas': 'Statistiken',
      'Enfoque': 'Fokus-Timer',
      'Apuntes': 'Notizen',
      'ESPACIO DE ESTUDIO': 'LERNBEREICH',
      'Privacidad': 'Datenschutz',
      'Condiciones': 'Nutzungsbedingungen',
      'Tu espacio privado': 'Dein privater Bereich',
      'Datos guardados en este navegador.': 'Daten werden in diesem Browser gespeichert.',
      'Vamos paso a paso.': 'Schritt für Schritt.',
      'Organiza lo importante. Lo demás puede esperar.': 'Ordne das Wichtige. Der Rest kann warten.',
      'Nueva actividad': 'Neue Aufgabe',
      'Por hacer': 'Zu erledigen',
      'actividades pendientes': 'offene Aufgaben',
      'Para hoy': 'Für heute',
      'con fecha de hoy': 'heute fällig',
      'Progreso general': 'Gesamtfortschritt',
      'En tu radar': 'Demnächst',
      'Lo próximo en tu lista': 'Als Nächstes',
      'Ver todas ↗': 'Alle anzeigen ↗',
      'Próximos parciales': 'Anstehende Prüfungen',
      'Prepárate con tiempo': 'Bereite dich rechtzeitig vor',
      'Añadir parcial': 'Prüfung hinzufügen',
      '¿Algo no te queda claro?': 'Ist etwas unklar?',
      'Convierte una duda en explicación y ejercicios.': 'Mach aus einer Frage Erklärungen und Übungen.',
      'Estudiar con IA ↗': 'Mit KI lernen ↗',
      'Marca lo que termines.': 'Markiere Erledigtes.',
      'Tu tutor de estudio': 'Deine Lernhilfe',
      'Tu pregunta': 'Deine Frage',
      'Preguntar ↗': 'Fragen ↗',
      'Respuesta del tutor': 'Antwort der Lernhilfe',
      'Abrir ChatGPT ↗': 'ChatGPT öffnen ↗',
      'Controla tus datos y recordatorios.': 'Verwalte deine Daten und Erinnerungen.',
      'Conexión con Groq': 'Groq-Verbindung',
      'Modelo IA': 'KI-Modell',
      'Datos locales': 'Lokale Daten',
      'Exportar copia': 'Kopie exportieren',
      'Notificaciones': 'Benachrichtigungen',
      'Borrar datos locales': 'Lokale Daten löschen',
      'Borrar datos': 'Daten löschen',
      'Todo en orden': 'Alles in Ordnung',
      'No hay actividades en esta sección todavía.': 'In diesem Bereich gibt es noch keine Aufgaben.',
      'Idioma': 'Sprache',
      'Change the interface language.': 'Sprache der Benutzeroberfläche ändern.',
      'Black': 'Schwarz',
      'White': 'Weiß',
      'Dyslexia-friendly mode': 'Legastheniefreundlicher Modus',
      'Language': 'Sprache',
      'Appearance · mode': 'Darstellung · Modus',
      'Choose how Estudiax looks.': 'Passe das Erscheinungsbild von Estudiax an.',
    },
    pt: {
      Inicio: "Início",
      "Mis actividades": "Minhas tarefas",
      Calendario: "Calendário",
      "Tutor IA": "Tutor IA",
      "Google Drive": "Google Drive",
      Ajustes: "Configurações",
      Tarjetas: "Cartões",
      Exámenes: "Provas",
      Estadísticas: "Estatísticas",
      Enfoque: "Foco",
      Apuntes: "Notas",
      "ESPACIO DE ESTUDIO": "ESPAÇO DE ESTUDO", "Privacidad": "Privacidade", "Condiciones": "Termos",
      "Tu espacio privado": "Seu espaço privado",
      "Datos guardados en este navegador.": "Dados salvos neste navegador.",
      "Vamos paso a paso.": "Um passo de cada vez.",
      "Organiza lo importante. Lo demás puede esperar.":
        "Organize o que importa. O resto pode esperar.",
      "Nueva actividad": "Nova tarefa",
      "Por hacer": "A fazer",
      "actividades pendientes": "tarefas pendentes",
      "Para hoy": "Para hoje",
      "con fecha de hoy": "com prazo para hoje",
      "Progreso general": "Progresso geral",
      "En tu radar": "No seu radar",
      "Lo próximo en tu lista": "O que vem a seguir",
      "Ver todas ↗": "Ver todas ↗",
      "Próximos parciales": "Próximas provas",
      "Prepárate con tiempo": "Prepare-se com antecedência",
      "Añade un parcial para empezar a contar los días.":
        "Adicione uma prova para iniciar a contagem regressiva.",
      "Añadir parcial": "Adicionar prova",
      "¿Algo no te queda claro?": "Ficou com alguma dúvida?",
      "Convierte una duda en explicación y ejercicios.":
        "Transforme uma dúvida em explicação e exercícios.",
      "Estudiar con IA ↗": "Estudar com IA ↗",
      "Marca lo que termines.": "Marque o que concluir.",
      "Tus entregas y exámenes en orden cronológico.":
        "Suas tarefas e provas em ordem cronológica.",
      "Tu tutor de estudio": "Seu tutor de estudos",
      "Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.":
        "Explicações claras, exemplos e exercícios para verificar seu aprendizado.",
      "¿Qué vamos a aprender?": "O que vamos aprender?",
      "Tu pregunta": "Sua pergunta",
      "Pide ejemplos, no solo la respuesta.": "Peça exemplos, não apenas a resposta.",
      "Preguntar ↗": "Perguntar ↗",
      "Respuesta del tutor": "Resposta do tutor",
      "¿Quieres continuar en ChatGPT?": "Quer continuar no ChatGPT?",
      "Abrir ChatGPT ↗": "Abrir ChatGPT ↗",
      "Controla tus datos y recordatorios.": "Gerencie seus dados e lembretes.",
      "Conexión con Groq": "Conexão com Groq",
      "Modelo IA": "Modelo de IA",
      "Datos locales": "Dados locais",
      "Exporta una copia de tus actividades.": "Exporte uma cópia das suas tarefas.",
      "Exportar copia": "Exportar cópia",
      Notificaciones: "Notificações",
      "Borrar datos locales": "Apagar dados locais",
      "Borrar datos": "Apagar dados",
      "Todo en orden": "Tudo em ordem",
      "No hay actividades en esta sección todavía.": "Ainda não há tarefas nesta seção.",
    },
    en: {
      Inicio: "Home",
      "Mis actividades": "My tasks",
      Calendario: "Calendar",
      "Tutor IA": "AI Tutor",
      "Google Drive": "Google Drive",
      Ajustes: "Settings",
      Tarjetas: "Flashcards",
      Exámenes: "Practice exams",
      Estadísticas: "Statistics",
      Enfoque: "Focus timer",
      Apuntes: "Notes",
      "ESPACIO DE ESTUDIO": "STUDY SPACE", "Privacidad": "Privacy", "Condiciones": "Terms",
      "Tu espacio privado": "Your private space",
      "Datos guardados en este navegador.": "Data saved in this browser.",
      "Vamos paso a paso.": "One step at a time.",
      "Organiza lo importante. Lo demás puede esperar.":
        "Organize what matters. The rest can wait.",
      "Nueva actividad": "New task",
      "Por hacer": "To do",
      "actividades pendientes": "pending tasks",
      "Para hoy": "Due today",
      "con fecha de hoy": "due today",
      "Progreso general": "Overall progress",
      "En tu radar": "Coming up",
      "Lo próximo en tu lista": "Next on your list",
      "Ver todas ↗": "View all ↗",
      "Próximos parciales": "Upcoming exams",
      "Prepárate con tiempo": "Prepare ahead",
      "Añade un parcial para empezar a contar los días.": "Add an exam to start counting down.",
      "Añadir parcial": "Add exam",
      "¿Algo no te queda claro?": "Something unclear?",
      "Convierte una duda en explicación y ejercicios.":
        "Turn a question into an explanation and practice.",
      "Estudiar con IA ↗": "Study with AI ↗",
      "Marca lo que termines.": "Mark tasks as you finish them.",
      "Tus entregas y exámenes en orden cronológico.":
        "Your assignments and exams in chronological order.",
      "Tu tutor de estudio": "Your study tutor",
      "Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.":
        "Clear explanations, examples, and practice to check your understanding.",
      "¿Qué vamos a aprender?": "What shall we learn?",
      "Tu pregunta": "Your question",
      "Pide ejemplos, no solo la respuesta.": "Ask for examples, not just the answer.",
      "Preguntar ↗": "Ask ↗",
      "Respuesta del tutor": "Tutor's answer",
      "¿Quieres continuar en ChatGPT?": "Want to continue in ChatGPT?",
      "Abrir ChatGPT ↗": "Open ChatGPT ↗",
      "Controla tus datos y recordatorios.": "Manage your data and reminders.",
      "Conexión con Groq": "Groq connection",
      "Modelo IA": "AI model",
      "Datos locales": "Local data",
      "Exporta una copia de tus actividades.": "Export a copy of your tasks.",
      "Exportar copia": "Export backup",
      Notificaciones: "Notifications",
      "Borrar datos locales": "Delete local data",
      "Borrar datos": "Delete data",
      "Todo en orden": "All clear",
      "No hay actividades en esta sección todavía.": "No tasks in this section yet.",
    },
    fr: {
      Inicio: "Accueil",
      "Mis actividades": "Mes tâches",
      Calendario: "Calendrier",
      "Tutor IA": "Tuteur IA",
      "Google Drive": "Google Drive",
      Ajustes: "Paramètres",
      Tarjetas: "Cartes mémoire",
      Exámenes: "Examens",
      Estadísticas: "Statistiques",
      Enfoque: "Concentration",
      Apuntes: "Notes",
      "ESPACIO DE ESTUDIO": "ESPACE D’ÉTUDE", "Privacidad": "Confidentialité", "Condiciones": "Conditions",
      "Tu espacio privado": "Votre espace privé",
      "Datos guardados en este navegador.": "Données enregistrées dans ce navigateur.",
      "Vamos paso a paso.": "Un pas à la fois.",
      "Organiza lo importante. Lo demás puede esperar.":
        "Organisez l’essentiel. Le reste peut attendre.",
      "Nueva actividad": "Nouvelle tâche",
      "Por hacer": "À faire",
      "actividades pendientes": "tâches en attente",
      "Para hoy": "Pour aujourd’hui",
      "con fecha de hoy": "prévues aujourd’hui",
      "Progreso general": "Progression générale",
      "En tu radar": "À venir",
      "Lo próximo en tu lista": "Les prochaines tâches",
      "Ver todas ↗": "Tout voir ↗",
      "Próximos parciales": "Prochains examens",
      "Prepárate con tiempo": "Préparez-vous à l’avance",
      "Añade un parcial para empezar a contar los días.":
        "Ajoutez un examen pour lancer le compte à rebours.",
      "Añadir parcial": "Ajouter un examen",
      "¿Algo no te queda claro?": "Quelque chose n’est pas clair ?",
      "Convierte una duda en explicación y ejercicios.":
        "Transformez une question en explication et exercices.",
      "Estudiar con IA ↗": "Étudier avec l’IA ↗",
      "Marca lo que termines.": "Cochez les tâches terminées.",
      "Tus entregas y exámenes en orden cronológico.":
        "Vos devoirs et examens par ordre chronologique.",
      "Tu tutor de estudio": "Votre tuteur d’étude",
      "Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.":
        "Des explications claires, des exemples et des exercices.",
      "¿Qué vamos a aprender?": "Qu’allons-nous apprendre ?",
      "Tu pregunta": "Votre question",
      "Pide ejemplos, no solo la respuesta.": "Demandez des exemples, pas seulement la réponse.",
      "Preguntar ↗": "Demander ↗",
      "Respuesta del tutor": "Réponse du tuteur",
      "¿Quieres continuar en ChatGPT?": "Continuer dans ChatGPT ?",
      "Abrir ChatGPT ↗": "Ouvrir ChatGPT ↗",
      "Controla tus datos y recordatorios.": "Gérez vos données et rappels.",
      "Conexión con Groq": "Connexion Groq",
      "Modelo IA": "Modèle IA",
      "Datos locales": "Données locales",
      "Exporta una copia de tus actividades.": "Exportez une copie de vos tâches.",
      "Exportar copia": "Exporter une copie",
      Notificaciones: "Notifications",
      "Borrar datos locales": "Supprimer les données locales",
      "Borrar datos": "Supprimer les données",
      "Todo en orden": "Tout est en ordre",
      "No hay actividades en esta sección todavía.": "Aucune tâche pour le moment.",
    },
    zh: {
      Inicio: "首页",
      "Mis actividades": "我的任务",
      Calendario: "日历",
      "Tutor IA": "AI 学习导师",
      "Google Drive": "Google 云端硬盘",
      Ajustes: "设置",
      Tarjetas: "记忆卡片",
      Exámenes: "练习考试",
      Estadísticas: "学习统计",
      Enfoque: "专注计时器",
      Apuntes: "笔记",
      "ESPACIO DE ESTUDIO": "学习空间", "Privacidad": "隐私", "Condiciones": "服务条款",
      "Tu espacio privado": "你的私人学习空间",
      "Datos guardados en este navegador.": "数据保存在此浏览器中。",
      "Vamos paso a paso.": "一步一步来。",
      "Organiza lo importante. Lo demás puede esperar.": "安排好重要的事，其他的可以稍后再做。",
      "Nueva actividad": "新任务",
      "Por hacer": "待办",
      "actividades pendientes": "项待办任务",
      "Para hoy": "今日到期",
      "con fecha de hoy": "今天到期",
      "Progreso general": "总体进度",
      "En tu radar": "即将到来",
      "Lo próximo en tu lista": "接下来要做",
      "Ver todas ↗": "查看全部 ↗",
      "Próximos parciales": "即将到来的考试",
      "Prepárate con tiempo": "提前做好准备",
      "Añade un parcial para empezar a contar los días.": "添加考试以开始倒计时。",
      "Añadir parcial": "添加考试",
      "¿Algo no te queda claro?": "有什么不明白的吗？",
      "Convierte una duda en explicación y ejercicios.": "把疑问变成讲解和练习。",
      "Estudiar con IA ↗": "使用 AI 学习 ↗",
      "Marca lo que termines.": "完成后标记任务。",
      "Tus entregas y exámenes en orden cronológico.": "按时间顺序查看作业和考试。",
      "Tu tutor de estudio": "你的学习导师",
      "Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.":
        "清晰的讲解、示例和练习，帮助你检验理解。",
      "¿Qué vamos a aprender?": "我们要学什么？",
      "Tu pregunta": "你的问题",
      "Pide ejemplos, no solo la respuesta.": "不仅要答案，也可以要求示例。",
      "Preguntar ↗": "提问 ↗",
      "Respuesta del tutor": "导师的回答",
      "¿Quieres continuar en ChatGPT?": "想在 ChatGPT 中继续吗？",
      "Abrir ChatGPT ↗": "打开 ChatGPT ↗",
      "Controla tus datos y recordatorios.": "管理你的数据和提醒。",
      "Conexión con Groq": "Groq 连接",
      "Modelo IA": "AI 模型",
      "Datos locales": "本地数据",
      "Exporta una copia de tus actividades.": "导出任务备份。",
      "Exportar copia": "导出备份",
      Notificaciones: "通知",
      "Borrar datos locales": "删除本地数据",
      "Borrar datos": "删除数据",
      "Todo en orden": "一切正常",
      "No hay actividades en esta sección todavía.": "此部分还没有任务。",
    },
  };
  Object.assign(words, {
    hi: { "Inicio":"होम", "Mis actividades":"मेरे कार्य", "Calendario":"कैलेंडर", "Tutor IA":"AI ट्यूटर", "Google Drive":"Google Drive", "Ajustes":"सेटिंग्स", "Tarjetas":"फ़्लैशकार्ड", "Exámenes":"परीक्षाएँ", "Estadísticas":"आँकड़े", "Enfoque":"फ़ोकस टाइमर", "Apuntes":"नोट्स", "ESPACIO DE ESTUDIO":"अध्ययन क्षेत्र", "Privacidad":"गोपनीयता", "Condiciones":"नियम और शर्तें", "Tu espacio privado":"आपका निजी स्थान", "Datos guardados en este navegador.":"डेटा इसी ब्राउज़र में सहेजा जाता है।", "Vamos paso a paso.":"एक-एक कदम आगे बढ़ें।", "Organiza lo importante. Lo demás puede esperar.":"ज़रूरी चीज़ें व्यवस्थित करें। बाकी बाद में।", "Nueva actividad":"नया कार्य", "Por hacer":"बाकी कार्य", "actividades pendientes":"लंबित कार्य", "Para hoy":"आज के लिए", "Progreso general":"कुल प्रगति", "En tu radar":"आगे आने वाले कार्य", "Próximos parciales":"आगामी परीक्षाएँ", "Prepárate con tiempo":"पहले से तैयारी करें", "Idioma":"भाषा", "Colores":"रंग", "Elige un color para toda la interfaz":"पूरे इंटरफ़ेस के लिए रंग चुनें" },
    id: { "Inicio":"Beranda", "Mis actividades":"Tugas saya", "Calendario":"Kalender", "Tutor IA":"Tutor AI", "Google Drive":"Google Drive", "Ajustes":"Pengaturan", "Tarjetas":"Kartu belajar", "Exámenes":"Ujian", "Estadísticas":"Statistik", "Enfoque":"Timer fokus", "Apuntes":"Catatan", "ESPACIO DE ESTUDIO":"RUANG BELAJAR", "Privacidad":"Privasi", "Condiciones":"Ketentuan", "Tu espacio privado":"Ruang pribadimu", "Datos guardados en este navegador.":"Data disimpan di browser ini.", "Vamos paso a paso.":"Selangkah demi selangkah.", "Organiza lo importante. Lo demás puede esperar.":"Atur hal yang penting. Sisanya bisa menunggu.", "Nueva actividad":"Tugas baru", "Por hacer":"Belum selesai", "actividades pendientes":"tugas tertunda", "Para hoy":"Untuk hari ini", "Progreso general":"Progres keseluruhan", "En tu radar":"Segera datang", "Próximos parciales":"Ujian mendatang", "Prepárate con tiempo":"Bersiaplah lebih awal", "Idioma":"Bahasa", "Colores":"Warna", "Elige un color para toda la interfaz":"Pilih warna untuk seluruh antarmuka" },
    tr: { "Inicio":"Ana sayfa", "Mis actividades":"Görevlerim", "Calendario":"Takvim", "Tutor IA":"Yapay zekâ öğretmeni", "Google Drive":"Google Drive", "Ajustes":"Ayarlar", "Tarjetas":"Bilgi kartları", "Exámenes":"Sınavlar", "Estadísticas":"İstatistikler", "Enfoque":"Odak sayacı", "Apuntes":"Notlar", "ESPACIO DE ESTUDIO":"ÇALIŞMA ALANI", "Privacidad":"Gizlilik", "Condiciones":"Koşullar", "Tu espacio privado":"Özel alanın", "Datos guardados en este navegador.":"Veriler bu tarayıcıda saklanır.", "Vamos paso a paso.":"Adım adım ilerle.", "Organiza lo importante. Lo demás puede esperar.":"Önemli olanı düzenle. Diğerleri bekleyebilir.", "Nueva actividad":"Yeni görev", "Por hacer":"Yapılacaklar", "actividades pendientes":"bekleyen görev", "Para hoy":"Bugün için", "Progreso general":"Genel ilerleme", "En tu radar":"Yaklaşanlar", "Próximos parciales":"Yaklaşan sınavlar", "Prepárate con tiempo":"Önceden hazırlan", "Idioma":"Dil", "Colores":"Renkler", "Elige un color para toda la interfaz":"Tüm arayüz için bir renk seç" },
    vi: { "Inicio":"Trang chủ", "Mis actividades":"Công việc của tôi", "Calendario":"Lịch", "Tutor IA":"Gia sư AI", "Google Drive":"Google Drive", "Ajustes":"Cài đặt", "Tarjetas":"Thẻ ghi nhớ", "Exámenes":"Bài kiểm tra", "Estadísticas":"Thống kê", "Enfoque":"Đồng hồ tập trung", "Apuntes":"Ghi chú", "ESPACIO DE ESTUDIO":"KHÔNG GIAN HỌC TẬP", "Privacidad":"Quyền riêng tư", "Condiciones":"Điều khoản", "Tu espacio privado":"Không gian riêng tư của bạn", "Datos guardados en este navegador.":"Dữ liệu được lưu trong trình duyệt này.", "Vamos paso a paso.":"Từng bước một.", "Organiza lo importante. Lo demás puede esperar.":"Sắp xếp điều quan trọng. Việc khác có thể chờ.", "Nueva actividad":"Công việc mới", "Por hacer":"Việc cần làm", "actividades pendientes":"việc đang chờ", "Para hoy":"Hôm nay", "Progreso general":"Tiến độ tổng thể", "En tu radar":"Sắp tới", "Próximos parciales":"Bài kiểm tra sắp tới", "Prepárate con tiempo":"Chuẩn bị từ sớm", "Idioma":"Ngôn ngữ", "Colores":"Màu sắc", "Elige un color para toda la interfaz":"Chọn màu cho toàn bộ giao diện" },
    nl: { "Inicio":"Startpagina", "Mis actividades":"Mijn taken", "Calendario":"Agenda", "Tutor IA":"AI-studiebegeleider", "Google Drive":"Google Drive", "Ajustes":"Instellingen", "Tarjetas":"Flashcards", "Exámenes":"Oefentoetsen", "Estadísticas":"Statistieken", "Enfoque":"Focustimer", "Apuntes":"Aantekeningen", "ESPACIO DE ESTUDIO":"STUDIERUIMTE", "Privacidad":"Privacy", "Condiciones":"Voorwaarden", "Tu espacio privado":"Je privéruimte", "Datos guardados en este navegador.":"Gegevens worden in deze browser opgeslagen.", "Vamos paso a paso.":"Stap voor stap.", "Organiza lo importante. Lo demás puede esperar.":"Orden het belangrijke. De rest kan wachten.", "Nueva actividad":"Nieuwe taak", "Por hacer":"Te doen", "actividades pendientes":"openstaande taken", "Para hoy":"Voor vandaag", "Progreso general":"Totale voortgang", "En tu radar":"Binnenkort", "Próximos parciales":"Aankomende toetsen", "Prepárate con tiempo":"Bereid je op tijd voor", "Idioma":"Taal", "Colores":"Kleuren", "Elige un color para toda la interfaz":"Kies een accentkleur voor de hele interface" },
  });
  const extraWords: Record<string, Record<string, string>> = {
    sw: { "Descargas de la app":"Pakua programu", "Colores":"Rangi", "Descarga e instalación":"Kupakua na kusakinisha", "Elige tu dispositivo":"Chagua kifaa chako", "Añadir a pantalla de inicio":"Ongeza kwenye skrini ya mwanzo", "Instalar ESTUDIAX":"Sakinisha ESTUDIAX", "Abre ESTUDIAX en tu navegador":"Fungua ESTUDIAX kwenye kivinjari", "Usa el menú Compartir o del navegador":"Tumia menyu ya Kushiriki au ya kivinjari", "Si aparece Instalar, selecciónalo":"Ukiona Sakinisha, ichague", "Si no, usa Añadir a pantalla de inicio":"La sivyo, chagua Ongeza kwenye skrini ya mwanzo", "No necesitas descargar un archivo desde una tienda":"Huhitaji kupakua faili kutoka dukani", "Elige un color para toda la interfaz":"Chagua rangi ya kiolesura chote", "Guardar color":"Hifadhi rangi", "Google Drive conectado":"Google Drive imeunganishwa", "Conectar Google Drive":"Unganisha Google Drive", "Desconectar":"Tenganisha", "Guardar respaldo cifrado en Drive":"Hifadhi nakala iliyosimbwa kwenye Drive", "Conecta tu cuenta de Google para continuar.":"Unganisha akaunti yako ya Google ili kuendelea.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"Nakala husimbwa kwenye kifaa chako kabla ya kutumwa.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Maelekezo ya kusakinisha ESTUDIAX kama programu ya wavuti kwenye kifaa chako." },
    ja: { "Descargas de la app":"アプリのインストール", "Colores":"カラー", "Descarga e instalación":"ダウンロードとインストール", "Elige tu dispositivo":"デバイスを選択", "Añadir a pantalla de inicio":"ホーム画面に追加", "Instalar ESTUDIAX":"ESTUDIAXをインストール", "Abre ESTUDIAX en tu navegador":"ブラウザーでESTUDIAXを開く", "Usa el menú Compartir o del navegador":"共有メニューまたはブラウザーメニューを使う", "Si aparece Instalar, selecciónalo":"「インストール」が表示されたら選択", "Si no, usa Añadir a pantalla de inicio":"表示されない場合は「ホーム画面に追加」を選択", "No necesitas descargar un archivo desde una tienda":"ストアからファイルをダウンロードする必要はありません", "Elige un color para toda la interfaz":"インターフェース全体の色を選択", "Guardar color":"色を保存", "Google Drive conectado":"Google Driveに接続済み", "Conectar Google Drive":"Google Driveに接続", "Desconectar":"接続解除", "Guardar respaldo cifrado en Drive":"暗号化バックアップをDriveに保存", "Conecta tu cuenta de Google para continuar.":"続行するにはGoogleアカウントを接続してください。", "El respaldo se cifra en tu dispositivo antes de enviarse.":"バックアップは送信前にデバイス上で暗号化されます。", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"デバイスにESTUDIAXをウェブアプリとしてインストールする手順。" },
    ko: { "Descargas de la app":"앱 설치", "Colores":"색상", "Descarga e instalación":"다운로드 및 설치", "Elige tu dispositivo":"기기 선택", "Añadir a pantalla de inicio":"홈 화면에 추가", "Instalar ESTUDIAX":"ESTUDIAX 설치", "Abre ESTUDIAX en tu navegador":"브라우저에서 ESTUDIAX 열기", "Usa el menú Compartir o del navegador":"공유 메뉴 또는 브라우저 메뉴 사용", "Si aparece Instalar, selecciónalo":"‘설치’가 표시되면 선택하세요", "Si no, usa Añadir a pantalla de inicio":"표시되지 않으면 ‘홈 화면에 추가’를 선택하세요", "No necesitas descargar un archivo desde una tienda":"앱 스토어에서 파일을 다운로드할 필요가 없습니다", "Elige un color para toda la interfaz":"전체 인터페이스 색상 선택", "Guardar color":"색상 저장", "Google Drive conectado":"Google Drive 연결됨", "Conectar Google Drive":"Google Drive 연결", "Desconectar":"연결 해제", "Guardar respaldo cifrado en Drive":"암호화된 백업을 Drive에 저장", "Conecta tu cuenta de Google para continuar.":"계속하려면 Google 계정을 연결하세요.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"백업은 전송 전에 기기에서 암호화됩니다.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"기기에 ESTUDIAX를 웹 앱으로 설치하는 안내." },
    es: { "Descargas de la app":"Descargas de la app", "Colores":"Colores", "Descarga e instalación":"Descarga e instalación", "Elige tu dispositivo":"Elige tu dispositivo", "Añadir a pantalla de inicio":"Añadir a pantalla de inicio", "Instalar ESTUDIAX":"Instalar ESTUDIAX", "Abre ESTUDIAX en tu navegador":"Abre ESTUDIAX en tu navegador", "Usa el menú Compartir o del navegador":"Usa el menú Compartir o del navegador", "Si aparece Instalar, selecciónalo":"Si aparece Instalar, selecciónalo", "Si no, usa Añadir a pantalla de inicio":"Si no, usa Añadir a pantalla de inicio", "No necesitas descargar un archivo desde una tienda":"No necesitas descargar un archivo desde una tienda", "Elige un color para toda la interfaz":"Elige un color para toda la interfaz", "Guardar color":"Guardar color", "Google Drive conectado":"Google Drive conectado", "Conectar Google Drive":"Conectar Google Drive", "Desconectar":"Desconectar", "Guardar respaldo cifrado en Drive":"Guardar respaldo cifrado en Drive", "Conecta tu cuenta de Google para continuar.":"Conecta tu cuenta de Google para continuar.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"El respaldo se cifra en tu dispositivo antes de enviarse.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Instrucciones para instalar ESTUDIAX como app web en tu dispositivo." },
    en: { "Descargas de la app":"Get the app", "Colores":"Colors", "Descarga e instalación":"Install ESTUDIAX", "Elige tu dispositivo":"Choose your device", "Añadir a pantalla de inicio":"Add to Home Screen", "Instalar ESTUDIAX":"Install ESTUDIAX", "Abre ESTUDIAX en tu navegador":"Open ESTUDIAX in your browser", "Usa el menú Compartir o del navegador":"Use the Share or browser menu", "Si aparece Instalar, selecciónalo":"If Install appears, select it", "Si no, usa Añadir a pantalla de inicio":"Otherwise, choose Add to Home Screen", "No necesitas descargar un archivo desde una tienda":"No store download is required", "Elige un color para toda la interfaz":"Choose an accent color for the whole interface", "Guardar color":"Save color", "Google Drive conectado":"Google Drive connected", "Conectar Google Drive":"Connect Google Drive", "Desconectar":"Disconnect", "Guardar respaldo cifrado en Drive":"Save encrypted backup to Drive", "Conecta tu cuenta de Google para continuar.":"Connect your Google account to continue.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"The backup is encrypted on your device before upload.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Instructions to install ESTUDIAX as a web app on your device." },
    fr: { "Descargas de la app":"Installer l’application", "Colores":"Couleurs", "Descarga e instalación":"Installer ESTUDIAX", "Elige tu dispositivo":"Choisissez votre appareil", "Añadir a pantalla de inicio":"Ajouter à l’écran d’accueil", "Instalar ESTUDIAX":"Installer ESTUDIAX", "Abre ESTUDIAX en tu navegador":"Ouvrez ESTUDIAX dans votre navigateur", "Usa el menú Compartir o del navegador":"Utilisez le menu Partager ou le menu du navigateur", "Si aparece Instalar, selecciónalo":"Si « Installer » apparaît, sélectionnez-le", "Si no, usa Añadir a pantalla de inicio":"Sinon, choisissez l’ajout à l’écran d’accueil", "No necesitas descargar un archivo desde una tienda":"Aucun téléchargement depuis une boutique n’est nécessaire", "Elige un color para toda la interfaz":"Choisissez une couleur pour toute l’interface", "Guardar color":"Enregistrer la couleur", "Google Drive conectado":"Google Drive connecté", "Conectar Google Drive":"Connecter Google Drive", "Desconectar":"Déconnecter", "Guardar respaldo cifrado en Drive":"Enregistrer la sauvegarde chiffrée dans Drive", "Conecta tu cuenta de Google para continuar.":"Connectez votre compte Google pour continuer.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"La sauvegarde est chiffrée sur votre appareil avant l’envoi.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Instructions pour installer ESTUDIAX comme application web sur votre appareil." },
    pt: { "Descargas de la app":"Instalar o app", "Colores":"Cores", "Descarga e instalación":"Instalar o ESTUDIAX", "Elige tu dispositivo":"Escolha seu dispositivo", "Añadir a pantalla de inicio":"Adicionar à tela inicial", "Instalar ESTUDIAX":"Instalar o ESTUDIAX", "Abre ESTUDIAX en tu navegador":"Abra o ESTUDIAX no navegador", "Usa el menú Compartir o del navegador":"Use o menu Compartilhar ou o menu do navegador", "Si aparece Instalar, selecciónalo":"Se aparecer Instalar, selecione essa opção", "Si no, usa Añadir a pantalla de inicio":"Caso contrário, escolha Adicionar à tela inicial", "No necesitas descargar un archivo desde una tienda":"Não é necessário baixar pela loja de aplicativos", "Elige un color para toda la interfaz":"Escolha uma cor para toda a interface", "Guardar color":"Salvar cor", "Google Drive conectado":"Google Drive conectado", "Conectar Google Drive":"Conectar Google Drive", "Desconectar":"Desconectar", "Guardar respaldo cifrado en Drive":"Salvar backup criptografado no Drive", "Conecta tu cuenta de Google para continuar.":"Conecte sua conta Google para continuar.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"O backup é criptografado no dispositivo antes do envio.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Instruções para instalar o ESTUDIAX como aplicativo web no dispositivo." },
    zh: { "Descargas de la app":"安装应用", "Colores":"颜色", "Descarga e instalación":"安装 ESTUDIAX", "Elige tu dispositivo":"选择设备", "Añadir a pantalla de inicio":"添加到主屏幕", "Instalar ESTUDIAX":"安装 ESTUDIAX", "Abre ESTUDIAX en tu navegador":"在浏览器中打开 ESTUDIAX", "Usa el menú Compartir o del navegador":"使用分享菜单或浏览器菜单", "Si aparece Instalar, selecciónalo":"如果出现“安装”，请选择它", "Si no, usa Añadir a pantalla de inicio":"否则选择“添加到主屏幕”", "No necesitas descargar un archivo desde una tienda":"无需从应用商店下载文件", "Elige un color para toda la interfaz":"为整个界面选择强调色", "Guardar color":"保存颜色", "Google Drive conectado":"Google Drive 已连接", "Conectar Google Drive":"连接 Google Drive", "Desconectar":"断开连接", "Guardar respaldo cifrado en Drive":"将加密备份保存到 Drive", "Conecta tu cuenta de Google para continuar.":"请连接 Google 账号以继续。", "El respaldo se cifra en tu dispositivo antes de enviarse.":"备份会先在设备上加密，再上传。", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"如何在设备上将 ESTUDIAX 安装为网页应用。" },
    it: { "Descargas de la app":"Installa l’app", "Colores":"Colori", "Descarga e instalación":"Installa ESTUDIAX", "Elige tu dispositivo":"Scegli il dispositivo", "Añadir a pantalla de inicio":"Aggiungi alla schermata Home", "Instalar ESTUDIAX":"Installa ESTUDIAX", "Abre ESTUDIAX en tu navegador":"Apri ESTUDIAX nel browser", "Usa el menú Compartir o del navegador":"Usa il menu Condividi o il menu del browser", "Si aparece Instalar, selecciónalo":"Se compare Installa, selezionalo", "Si no, usa Añadir a pantalla de inicio":"Altrimenti scegli Aggiungi alla schermata Home", "No necesitas descargar un archivo desde una tienda":"Non serve scaricare un file da uno store", "Elige un color para toda la interfaz":"Scegli un colore per tutta l’interfaccia", "Guardar color":"Salva colore", "Google Drive conectado":"Google Drive connesso", "Conectar Google Drive":"Connetti Google Drive", "Desconectar":"Disconnetti", "Guardar respaldo cifrado en Drive":"Salva il backup cifrato su Drive", "Conecta tu cuenta de Google para continuar.":"Collega il tuo account Google per continuare.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"Il backup viene cifrato sul dispositivo prima dell’invio.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Istruzioni per installare ESTUDIAX come app web sul dispositivo." },
    de: { "Descargas de la app":"App installieren", "Colores":"Farben", "Descarga e instalación":"ESTUDIAX installieren", "Elige tu dispositivo":"Gerät auswählen", "Añadir a pantalla de inicio":"Zum Startbildschirm hinzufügen", "Instalar ESTUDIAX":"ESTUDIAX installieren", "Abre ESTUDIAX en tu navegador":"Öffne ESTUDIAX im Browser", "Usa el menú Compartir o del navegador":"Nutze das Teilen- oder Browsermenü", "Si aparece Instalar, selecciónalo":"Wenn „Installieren“ erscheint, wähle es aus", "Si no, usa Añadir a pantalla de inicio":"Wähle andernfalls Zum Startbildschirm hinzufügen", "No necesitas descargar un archivo desde una tienda":"Ein Download aus einem App-Store ist nicht nötig", "Elige un color para toda la interfaz":"Wähle eine Akzentfarbe für die gesamte Oberfläche", "Guardar color":"Farbe speichern", "Google Drive conectado":"Google Drive verbunden", "Conectar Google Drive":"Google Drive verbinden", "Desconectar":"Trennen", "Guardar respaldo cifrado en Drive":"Verschlüsseltes Backup in Drive speichern", "Conecta tu cuenta de Google para continuar.":"Verbinde dein Google-Konto, um fortzufahren.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"Das Backup wird vor dem Upload auf deinem Gerät verschlüsselt.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Anleitung zur Installation von ESTUDIAX als Web-App auf deinem Gerät." },
    ru: { "Descargas de la app":"Установить приложение", "Colores":"Цвета", "Descarga e instalación":"Установка ESTUDIAX", "Elige tu dispositivo":"Выберите устройство", "Añadir a pantalla de inicio":"Добавить на главный экран", "Instalar ESTUDIAX":"Установить ESTUDIAX", "Abre ESTUDIAX en tu navegador":"Откройте ESTUDIAX в браузере", "Usa el menú Compartir o del navegador":"Используйте меню «Поделиться» или меню браузера", "Si aparece Instalar, selecciónalo":"Если есть пункт «Установить», выберите его", "Si no, usa Añadir a pantalla de inicio":"Иначе выберите добавление на главный экран", "No necesitas descargar un archivo desde una tienda":"Не нужно скачивать файл из магазина приложений", "Elige un color para toda la interfaz":"Выберите акцентный цвет интерфейса", "Guardar color":"Сохранить цвет", "Google Drive conectado":"Google Drive подключён", "Conectar Google Drive":"Подключить Google Drive", "Desconectar":"Отключить", "Guardar respaldo cifrado en Drive":"Сохранить зашифрованную копию в Drive", "Conecta tu cuenta de Google para continuar.":"Подключите аккаунт Google, чтобы продолжить.", "El respaldo se cifra en tu dispositivo antes de enviarse.":"Резервная копия шифруется на устройстве перед отправкой.", "Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.":"Инструкция по установке ESTUDIAX как веб-приложения.", "Ajustes":"Настройки", "Calendario":"Календарь", "Notificaciones":"Уведомления", "Añade un parcial para empezar a contar los días.":"Добавьте экзамен, чтобы запустить обратный отсчёт.", "Exporta una copia de tus actividades.":"Экспортируйте копию заданий.", "Pide ejemplos, no solo la respuesta.":"Просите примеры, а не только ответ.", "Tus entregas y exámenes en orden cronológico.":"Задания и экзамены в хронологическом порядке.", "¿Quieres continuar en ChatGPT?":"Продолжить в ChatGPT?" },
  };

const tr = (s: string) => extraWords[lang]?.[s] || words[lang]?.[s] || s;
  const driveText = DRIVE_COPY[lang] || DRIVE_COPY.es;
  const nav = [
    "Inicio",
    "Mis actividades",
    "Calendario",
    "Tutor IA",
    "Tarjetas",
    "Exámenes",
    "Estadísticas",
    "Enfoque",
    "Mindfulness",
    "Apuntes",
    "Google Drive",
    "Ajustes",
    "Descargas de la app",
    "Colores",
  ];
  const toggleDyslexicMode = () => {
    const next = !dyslexicMode;
    document.documentElement.dataset.dyslexic = next ? "on" : "off";
    if (next && "fonts" in document) {
      void Promise.all([
        document.fonts.load('400 16px "OpenDyslexic"'),
        document.fonts.load('700 16px "OpenDyslexic"'),
        document.fonts.ready,
      ]).then(() => {
        if (!document.fonts.check('400 16px "OpenDyslexic"') || !document.fonts.check('700 16px "OpenDyslexic"')) {
          document.documentElement.dataset.dyslexicFontError = "true";
          N(lang === "en" ? "OpenDyslexic could not load. Check your connection and reload ESTUDIAX." : lang === "sw" ? "Fonti ya OpenDyslexic haikupakia. Angalia muunganisho na upakie ESTUDIAX upya." : "No se pudo cargar OpenDyslexic. Revisa tu conexión y vuelve a cargar ESTUDIAX.");
        } else {
          delete document.documentElement.dataset.dyslexicFontError;
          N(lang === "en" ? "OpenDyslexic Bold is active." : lang === "sw" ? "OpenDyslexic Bold imewashwa." : "OpenDyslexic Bold está activada.");
        }
      }).catch(() => {
        document.documentElement.dataset.dyslexicFontError = "true";
        N(lang === "en" ? "OpenDyslexic could not load. Check your connection and reload ESTUDIAX." : "No se pudo cargar OpenDyslexic. Revisa tu conexión y vuelve a cargar ESTUDIAX.");
      });
    } else {
      delete document.documentElement.dataset.dyslexicFontError;
    }
    try { localStorage.setItem("estudiax-dyslexic", String(next)); } catch {}
    SD(next);
  };
  return (
    <main className="app-shell">
      {!gateVerified && (
        <div className="turnstile-gate" role="dialog" aria-modal="true" aria-labelledby="turnstile-title">
          <section className="turnstile-card">
            <div className="turnstile-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M3.5 5.5c3.1-.9 5.9-.4 8.5 1.5v13c-2.6-1.9-5.4-2.4-8.5-1.5zM20.5 5.5c-3.1-.9-5.9-.4-8.5 1.5v13c2.6-1.9 5.4-2.4 8.5-1.5z" />
                <path d="M12 7v13" />
              </svg>
            </div>
            <p className="turnstile-eyebrow">ESTUDIAX · {lang === "en" ? "ACCESS PROTECTION" : lang === "fr" ? "PROTECTION D’ACCÈS" : lang === "pt" ? "PROTEÇÃO DE ACESSO" : lang === "zh" ? "访问保护" : "PROTECCIÓN DE ACCESO"}</p>
            <h1 id="turnstile-title">{lang === "en" ? "Before you enter…" : lang === "fr" ? "Avant d’entrer…" : lang === "pt" ? "Antes de entrar…" : lang === "zh" ? "进入之前…" : "Antes de entrar…"}</h1>
            <p className="turnstile-description">{lang === "en" ? "Verify that you are human to continue to your study space." : lang === "fr" ? "Vérifiez que vous êtes une personne pour accéder à votre espace d’étude." : lang === "pt" ? "Verifique que você é uma pessoa para acessar seu espaço de estudo." : lang === "zh" ? "请完成人机验证以进入学习空间。" : "Verifica que eres una persona para continuar a tu espacio de estudio."}</p>
            <div className="turnstile-widget" ref={turnstileHost} />
            {!gateReady && !gateError && <p className="turnstile-status">{lang === "en" ? "Loading secure verification…" : lang === "fr" ? "Chargement de la vérification sécurisée…" : lang === "pt" ? "Carregando verificação segura…" : lang === "zh" ? "正在加载安全验证…" : "Cargando verificación segura…"}</p>}
            {gateError && <p className="turnstile-error" role="alert">{gateError}</p>}
            {gateError && !gateReady && <button className="secondary-btn turnstile-continue" type="button" onClick={() => { setGateError(""); setGateReady(false); setTurnstileRetry((n) => n + 1); }}>{lang === "en" ? "Retry verification" : lang === "fr" ? "Réessayer la vérification" : lang === "pt" ? "Tentar a verificação novamente" : lang === "zh" ? "重试验证" : "Reintentar verificación"}</button>}
            <button className="primary-btn turnstile-continue" type="button" onClick={completeGate} disabled={gateBusy || !gateReady}>
              {gateBusy ? (lang === "en" ? "Verifying…" : lang === "fr" ? "Vérification…" : lang === "pt" ? "Verificando…" : lang === "zh" ? "正在验证…" : "Verificando…") : (lang === "en" ? "Enter ESTUDIAX →" : lang === "fr" ? "Entrer dans ESTUDIAX →" : lang === "pt" ? "Entrar no ESTUDIAX →" : lang === "zh" ? "进入 ESTUDIAX →" : "Entrar a ESTUDIAX →")}
            </button>
            <p className="turnstile-footnote">{lang === "en" ? "Protected by Cloudflare Turnstile" : lang === "fr" ? "Protégé par Cloudflare Turnstile" : lang === "pt" ? "Protegido pelo Cloudflare Turnstile" : lang === "zh" ? "由 Cloudflare Turnstile 保护" : "Protegido con Cloudflare Turnstile"}</p>
          </section>
        </div>
      )}
      {gateVerified && !consentAccepted && (
        <div className="turnstile-gate consent-gate" role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <section className="turnstile-card consent-card">
            <div className="turnstile-brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M3.5 5.5c3.1-.9 5.9-.4 8.5 1.5v13c-2.6-1.9-5.4-2.4-8.5-1.5zM20.5 5.5c-3.1-.9-5.9-.4-8.5 1.5v13c2.6-1.9 5.4-2.4 8.5-1.5z"/><path d="M12 7v13"/></svg></div>
            <p className="turnstile-eyebrow">ESTUDIAX · {lang === "en" ? "PRIVACY & TRANSPARENCY" : lang === "fr" ? "CONFIDENTIALITÉ ET TRANSPARENCE" : lang === "pt" ? "PRIVACIDADE E TRANSPARÊNCIA" : lang === "zh" ? "隐私与透明度" : "PRIVACIDAD Y TRANSPARENCIA"}</p>
            <h1 id="consent-title">{lang === "en" ? "Before you continue" : lang === "fr" ? "Avant de continuer" : lang === "pt" ? "Antes de continuar" : lang === "zh" ? "继续之前" : "Antes de continuar"}</h1>
            <p className="turnstile-description">{lang === "en" ? "By selecting ‘Accept and continue’, you acknowledge that you have read our Privacy Policy and Terms of Service. Estudiax stores some data on this device and sends content you submit to AI features to the configured provider. Do not enter passwords or sensitive information." : lang === "fr" ? "En cliquant sur « Accepter et continuer », vous confirmez avoir lu notre Politique de confidentialité et nos Conditions d’utilisation. Estudiax conserve certaines données sur cet appareil et transmet le contenu envoyé aux fonctions IA au fournisseur configuré. Ne saisissez pas de mots de passe ni de données sensibles." : lang === "pt" ? "Ao clicar em ‘Aceitar e continuar’, você confirma que leu nossa Política de Privacidade e os Termos de Serviço. O Estudiax armazena alguns dados neste dispositivo e envia o conteúdo usado nas funções de IA ao provedor configurado. Não insira senhas nem informações sensíveis." : lang === "zh" ? "点击“接受并继续”即表示您确认已阅读我们的隐私政策和服务条款。Estudiax 会在此设备上保存部分数据，并将 AI 功能中提交的内容发送给相应服务提供商。请勿输入密码或敏感信息。" : "Al pulsar «Aceptar y continuar», confirmas que has leído nuestra Política de privacidad y las Condiciones de servicio. ESTUDIAX guarda parte de tus datos en este dispositivo y envía el contenido que escribes en las funciones de IA al proveedor correspondiente. No introduzcas contraseñas ni datos sensibles."}</p>
            <div className="consent-links"><a href="/privacy" target="_blank" rel="noreferrer">{lang === "en" ? "Read Privacy Policy ↗" : lang === "fr" ? "Lire la politique de confidentialité ↗" : lang === "pt" ? "Ler a Política de Privacidade ↗" : lang === "zh" ? "阅读隐私政策 ↗" : "Leer Política de privacidad ↗"}</a><a href="/terms" target="_blank" rel="noreferrer">{lang === "en" ? "Read Terms of Service ↗" : lang === "fr" ? "Lire les conditions d’utilisation ↗" : lang === "pt" ? "Ler os Termos de Serviço ↗" : lang === "zh" ? "阅读服务条款 ↗" : "Leer Condiciones de servicio ↗"}</a></div>
            <button className="primary-btn turnstile-continue" type="button" onClick={() => setConsentAccepted(true)}>{lang === "en" ? "Accept and continue →" : lang === "fr" ? "Accepter et continuer →" : lang === "pt" ? "Aceitar e continuar →" : lang === "zh" ? "接受并继续 →" : "Aceptar y continuar →"}</button>
            <p className="turnstile-footnote">{lang === "en" ? "This notice appears each time you open ESTUDIAX. You can read the full documents using the links above." : lang === "fr" ? "Cet avis apparaît à chaque ouverture d’ESTUDIAX. Vous pouvez lire les documents complets via les liens ci-dessus." : lang === "pt" ? "Este aviso aparece sempre que você abre o ESTUDIAX. Leia os documentos completos pelos links acima." : lang === "zh" ? "每次打开 ESTUDIAX 时都会显示此提示。您可以通过上方链接阅读完整文件。" : "Este aviso aparece cada vez que abres ESTUDIAX. Puedes leer los documentos completos en los enlaces de arriba."}</p>
          </section>
        </div>
      )}
      {gateVerified && consentAccepted && donationPopupOpen && (() => {
        const donationCopy = DOWNLOAD_DONATION_COPY[lang] || DOWNLOAD_DONATION_COPY.es;
        return (
          <div className="turnstile-gate donation-gate" role="dialog" aria-modal="true" aria-labelledby="donation-popup-title" dir={lang === "ar" ? "rtl" : "ltr"}>
            <section className="turnstile-card donation-popup-card">
              <button type="button" className="donation-popup-close" aria-label={donationCopy.dismiss} onClick={closeDonationPopup}>×</button>
              <div className="turnstile-brand-mark donation-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><path d="M3.5 5.5c3.1-.9 5.9-.4 8.5 1.5v13c-2.6-1.9-5.4-2.4-8.5-1.5zM20.5 5.5c-3.1-.9-5.9-.4-8.5 1.5v13c2.6-1.9 5.4-2.4 8.5-1.5z"/><path d="M12 7v13"/></svg>
              </div>
              <p className="turnstile-eyebrow">{donationCopy.eyebrow}</p>
              <h1 id="donation-popup-title">{donationCopy.title}</h1>
              <p className="turnstile-description donation-popup-description">{donationCopy.message}</p>
              <a className="primary-btn turnstile-continue donation-popup-cta" href="mailto:estudiaxia@gmail.com?subject=ESTUDIAX%20crypto%20donation%20inquiry" onClick={closeDonationPopup}>{donationCopy.button} ↗</a>
              <button className="secondary-btn donation-popup-later" type="button" onClick={closeDonationPopup}>{donationCopy.dismiss}</button>
            </section>
          </div>
        );
      })()}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-label="Estudiax, libro">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 5.5c3.1-.9 5.9-.4 8.5 1.5v13c-2.6-1.9-5.4-2.4-8.5-1.5zM20.5 5.5c-3.1-.9-5.9-.4-8.5 1.5v13c2.6-1.9 5.4-2.4 8.5-1.5z" />
              <path d="M12 7v13" />
            </svg>
          </div>
          <div>
            <strong>Estudiax</strong>
            <small>ACADEMIC ASSISTANT</small>
          </div>
        </div>
        <div className="side-label">{tr("ESPACIO DE ESTUDIO")}</div>
        <nav>
          {nav.map((n, i) => (
            <button
              key={n}
              className={`nav-item ${page === n ? "active" : ""}`}
              onClick={() => P(n)}
            >
              <span>{({"Inicio":"⌂","Mis actividades":"☷","Calendario":"▦","Tutor IA":"✳","Tarjetas":"▤","Exámenes":"✓","Estadísticas":"◴","Enfoque":"◷","Mindfulness":"☯","Apuntes":"✎","Google Drive":"☁","Ajustes":"⚙","Descargas de la app":"↓","Colores":"◉"} as Record<string,string>)[n]}</span>
              {tr(n)}
              {i === 1 && <b>{open.length}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-accessibility">
          <button
            type="button"
            className={`sidebar-dyslexia-toggle${dyslexicMode ? " enabled" : ""}`}
            role="switch"
            aria-checked={dyslexicMode}
            onClick={toggleDyslexicMode}
            title={lang === "en" ? "Toggle OpenDyslexic font" : lang === "fr" ? "Activer ou désactiver la police OpenDyslexic" : lang === "pt" ? "Ativar ou desativar a fonte OpenDyslexic" : lang === "zh" ? "切换 OpenDyslexic 字体" : "Activar o desactivar la fuente OpenDyslexic"}
          >
            <span className="sidebar-dyslexia-icon" aria-hidden="true">Aa</span>
            <span className="sidebar-dyslexia-label">
              <strong>{lang === "en" ? "Dyslexia-friendly mode" : lang === "fr" ? "Mode dyslexie" : lang === "pt" ? "Modo dislexia" : lang === "zh" ? "阅读友好模式" : "Modo disléxico"}</strong>
              <small>{dyslexicMode ? (lang === "en" ? "On · Click to turn off" : lang === "fr" ? "Activé · Cliquer pour désactiver" : lang === "pt" ? "Ativo · Clique para desativar" : lang === "zh" ? "已开启 · 点击关闭" : "Activado · Pulsa para apagar") : (lang === "en" ? "Off · Click to turn on" : lang === "fr" ? "Désactivé · Cliquer pour activer" : lang === "pt" ? "Desativado · Clique para ativar" : lang === "zh" ? "已关闭 · 点击开启" : "Desactivado · Pulsa para activar")}</small>
            </span>
            <span className="sidebar-dyslexia-switch" aria-hidden="true"><i /></span>
          </button>
        </div>
      {gateVerified && consentAccepted && <div className={`lofi-widget${lofiOpen ? " is-open" : ""}`}>
        <div className="lofi-player-title">{lofiError || (lofiAudioRef.current?.src ? (lofiOpen ? (lang === "en" ? "♫ Ambient audio playing" : "♫ Audio ambiental reproduciéndose") : (lang === "en" ? "♫ Ambient audio paused" : "♫ Audio ambiental en pausa")) : "")}</div>
        <div className="lofi-player-controls">
          <button type="button" className="lofi-toggle" aria-pressed={lofiOpen} onClick={toggleLofi}>{lofiOpen ? "Ⅱ" : "♫"} {lofiOpen ? (lang === "en" ? "Pause lo-fi" : lang === "sw" ? "Sitisha jazz laini" : lang === "ar" ? "إيقاف موسيقى الجاز مؤقتًا" : lang === "en" ? "Pause smooth jazz" : "Pausar jazz suave") : (lang === "en" ? "Play smooth jazz" : lang === "sw" ? "Cheza jazz laini" : lang === "ar" ? "تشغيل موسيقى الجاز الهادئة" : "Reproducir jazz suave")}</button>
          <button type="button" className="lofi-next" onClick={randomizeLofiMoment} title={lang === "en" ? "Random track and moment" : lang === "sw" ? "Wimbo na muda wa nasibu" : lang === "ar" ? "مقطع ولحظة عشوائيان" : "Otra pista y un momento aleatorio"} aria-label={lang === "en" ? "Play a random track from a random moment" : lang === "sw" ? "Cheza wimbo wa nasibu kuanzia muda wa nasibu" : lang === "ar" ? "تشغيل مقطع عشوائي من لحظة عشوائية" : "Reproducir otra pista desde un momento aleatorio"}>↻</button>
        </div>
      </div>}
        <div className="sidebar-bottom">
          <div className="privacy-mark">◈</div>
          <div>
            <strong>{tr("Tu espacio privado")}</strong>
            <p>{tr("Datos guardados en este navegador.")}</p>
          </div>
        </div>
        <a className="sidebar-donate" href={`mailto:estudiaxia@gmail.com?subject=${encodeURIComponent(({es:"Donación para ESTUDIAX",en:"Donation for ESTUDIAX",fr:"Don pour ESTUDIAX",pt:"Doação para o ESTUDIAX",zh:"支持 ESTUDIAX 的捐赠",it:"Donazione per ESTUDIAX",de:"Spende für ESTUDIAX",ru:"Пожертвование для ESTUDIAX"} as Record<string,string>)[lang] || "Donation for ESTUDIAX")}&body=${encodeURIComponent(({es:"Hola, me gustaría recibir información para apoyar ESTUDIAX mediante una donación en criptomonedas. ¿Podrían indicarme las opciones disponibles y la red compatible?",en:"Hello, I would like information on supporting ESTUDIAX with a cryptocurrency donation. Could you share the available options and supported network?",fr:"Bonjour, je souhaite soutenir ESTUDIAX par un don en cryptomonnaie. Pourriez-vous m’indiquer les options disponibles et le réseau compatible ?",pt:"Olá, gostaria de apoiar o ESTUDIAX com uma doação em criptomoedas. Poderiam informar as opções disponíveis e a rede compatível?",zh:"您好，我想通过加密货币捐赠支持 ESTUDIAX。请告知可用方式和支持的网络。",it:"Salve, vorrei sostenere ESTUDIAX con una donazione in criptovaluta. Potreste indicarmi le opzioni disponibili e la rete supportata?",de:"Hallo, ich möchte ESTUDIAX mit einer Kryptowährungsspende unterstützen. Könnten Sie mir die verfügbaren Optionen und das unterstützte Netzwerk mitteilen?",ru:"Здравствуйте! Я хотел(а) бы поддержать ESTUDIAX пожертвованием в криптовалюте. Подскажите, пожалуйста, доступные варианты и поддерживаемую сеть."} as Record<string,string>)[lang] || "Hello, I would like information about supporting ESTUDIAX with cryptocurrency.")}`}>
          <span aria-hidden="true">♡</span>
          {({es:"Donar en crypto",en:"Donate with crypto",fr:"Faire un don en crypto",pt:"Doar em cripto",zh:"加密货币捐赠",it:"Dona in crypto",de:"Mit Krypto spenden",ru:"Поддержать криптовалютой"} as Record<string,string>)[lang] || "Donar en crypto"}
        </a>
        <div className="sidebar-copyright">© {new Date().getFullYear()} Matías M. Eb · ESTUDIAX · { ({es:"Todos los derechos reservados",en:"All rights reserved",fr:"Tous droits réservés",pt:"Todos os direitos reservados",zh:"版权所有",it:"Tutti i diritti riservati",de:"Alle Rechte vorbehalten",ru:"Все права защищены"} as Record<string,string>)[lang] || "All rights reserved" }</div>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <div className="crumb">
            {lang === "en"
              ? "My space"
              : lang === "fr"
                ? "Mon espace"
                : lang === "pt"
                  ? "Meu espaço"
                  : lang === "zh"
                    ? "我的空间"
                    : "Mi espacio"}{" "}
            <span>/</span> <b>{tr(page)}</b>
          </div>
          <span className="local-status">
            <i />{" "}
            {lang === "en"
              ? "Saved locally"
              : lang === "fr"
                ? "Enregistré localement"
                : lang === "pt"
                  ? "Salvo localmente"
                  : lang === "zh"
                    ? "已本地保存"
                    : "Guardado local"}
          </span>
        </header>
        <div className="content">
          {notice && (
            <div className="notice">
              {notice}
              <button onClick={() => N("")}>×</button>
            </div>
          )}
          {page === "Inicio" && (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">
                    {new Date().toLocaleDateString(
                      lang === "en"
                        ? "en-US"
                        : lang === "fr"
                          ? "fr-FR"
                          : lang === "pt"
                            ? "pt-BR"
                            : lang === "zh"
                              ? "zh-CN"
                              : "es-MX",
                      { weekday: "long", day: "numeric", month: "long" },
                    )}
                  </p>
                  <h1>
                    {userName.trim()
                      ? lang === "en"
                        ? `${userName.trim()}'s Board`
                        : lang === "fr"
                          ? `Le tableau de ${userName.trim()}`
                          : lang === "pt"
                            ? `Quadro de ${userName.trim()}`
                            : lang === "zh"
                              ? `${userName.trim()}的学习板`
                              : `El tablón de ${userName.trim()}`
                      : tr("Vamos paso a paso.")}
                  </h1>
                  <p className="muted">{tr("Organiza lo importante. Lo demás puede esperar.")}</p>
                  <label className="board-name-label">
                    {lang === "en"
                      ? "Personalize your board"
                      : lang === "fr"
                        ? "Personnalisez votre tableau"
                        : lang === "pt"
                          ? "Personalize seu quadro"
                          : lang === "zh"
                            ? "自定义你的学习板"
                            : "Personaliza tu tablón"}
                    <input
                      aria-label={
                        lang === "en"
                          ? "Board name"
                          : lang === "fr"
                            ? "Nom du tableau"
                            : lang === "pt"
                              ? "Nome do quadro"
                              : "Nombre del tablón"
                      }
                      value={userName}
                      maxLength={40}
                      placeholder={
                        lang === "en"
                          ? "Your name"
                          : lang === "fr"
                            ? "Votre nom"
                            : lang === "pt"
                              ? "Seu nome"
                              : "Escribe tu nombre"
                      }
                      onChange={(e) => {
                        SU(e.target.value);
                        localStorage.setItem("estudiax-name", e.target.value);
                      }}
                    />
                  </label>
                </div>
                <button className="primary-btn" onClick={() => M(true)}>
                  {"＋ " + tr("Nueva actividad")}
                </button>
              </div>
              <div className="stats-grid">
                <Stat
                  title={tr("Por hacer")}
                  value={String(open.length).padStart(2, "0")}
                  detail={tr("actividades pendientes")}
                  progress={100 - progress}
                />
                <Stat
                  title={tr("Para hoy")}
                  value={String(open.filter((t) => t.due === today()).length).padStart(2, "0")}
                  detail={tr("con fecha de hoy")}
                />
                <Stat
                  title={tr("Progreso general")}
                  value={`${progress}%`}
                  detail={
                    lang === "en"
                      ? `${done.length} of ${tasks.length} completed`
                      : lang === "fr"
                        ? `${done.length} sur ${tasks.length} terminées`
                        : `${done.length} de ${tasks.length} completadas`
                  }
                  progress={progress}
                />
              </div>
              <div className="dashboard-grid">
                <section className="panel">
                  <Head
                    title="En tu radar"
                    sub="Lo próximo en tu lista"
                    action={
                      <button className="text-btn" onClick={() => P("Mis actividades")}>
                        {tr("Ver todas ↗")}
                      </button>
                    }
                  />
                  {open.length ? (
                    open
                      .slice()
                      .sort((a, b) => a.due.localeCompare(b.due))
                      .slice(0, 6)
                      .map((t) => <TaskRow key={t.id} t={t} toggle={toggle} del={del} lang={lang} />)
                  ) : (
                    <Empty lang={lang} />
                  )}
                </section>
                <section className="panel">
                  <Head title={lang === "en" ? "Upcoming exams" : lang === "fr" ? "Prochains examens" : lang === "pt" ? "Próximas provas" : lang === "zh" ? "即将到来的考试" : "Próximos parciales"} sub={lang === "en" ? "Prepare ahead of time" : lang === "fr" ? "Préparez-vous à l’avance" : lang === "pt" ? "Prepare-se com antecedência" : lang === "zh" ? "提前做好准备" : "Prepárate con tiempo"} action={<button className="text-btn" onClick={createStudyPlan}>{lang === "en" ? "✦ Make study plan" : lang === "fr" ? "✦ Créer un plan" : lang === "pt" ? "✦ Criar plano" : lang === "zh" ? "✦ 制定计划" : "✦ Crear plan"}</button>} />
                  {upcoming.length ? (
                    upcoming.slice(0, 4).map((t) => (
                      <div className="exam-row" key={t.id}>
                        <div className="exam-date">
                          <b>{t.due ? new Date(`${t.due}T12:00:00`).getDate() : "—"}</b>
                          <small>{date(t.due)}</small>
                        </div>
                        <div className="exam-info">
                          <strong>{t.subject}</strong>
                          <p>{t.title}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state small">
                      <p>{tr("Añade un parcial para empezar a contar los días.")}</p>
                      <button
                        className="text-btn"
                        onClick={() => {
                          K("Parcial");
                          M(true);
                        }}
                      >
                        ＋ Añadir parcial
                      </button>
                    </div>
                  )}
                </section>
              </div>
              <section className="tutor-banner">
                <div className="tutor-glyph">✳</div>
                <div>
                  <h2>{tr("¿Algo no te queda claro?")}</h2>
                  <p>{tr("Convierte una duda en explicación y ejercicios.")}</p>
                </div>
                <button className="secondary-btn" onClick={() => P("Tutor IA")}>
                  {tr("Estudiar con IA ↗")}
                </button>
              </section>
              <QuoteCard section="home" lang={lang} />
            </>
          )}
          {page === "Mis actividades" && (
            <>
              <PageHeading
                title={tr("Mis actividades")}
                sub={tr("Marca lo que termines.")}
                action={
                  <button className="primary-btn" onClick={() => M(true)}>
                    {"＋ " + tr("Nueva actividad")}
                  </button>
                }
              />
              <QuoteCard section="tasks" lang={lang} />
              <div className="filter-bar">
                {["Todas", "Pendientes", "Completadas", "Tarea", "Parcial", "Estudio"].map((f) => (
                  <button
                    key={f}
                    className={`filter ${filter === f ? "active-filter" : ""}`}
                    onClick={() => F(f)}
                  >
                    {tr(f)}
                  </button>
                ))}
              </div>
              <section className="panel">
                {shown.length ? (
                  shown.map((t) => <TaskRow key={t.id} t={t} toggle={toggle} del={del} lang={lang} />)
                ) : (
                  <Empty lang={lang} />
                )}
              </section>
            </>
          )}
          {page === "Calendario" && (
            <>
              <PageHeading
                title={tr("Calendario")}
                sub={tr("Tus entregas y exámenes en orden cronológico.")}
                action={
                  <button className="primary-btn" onClick={() => M(true)}>
                    {"＋ " + tr("Nueva actividad")}
                  </button>
                }
              />
              <QuoteCard section="calendar" lang={lang} />
              <section className="panel calendar-import-panel">
                <div className="calendar-import-heading"><div className="calendar-import-icon">⇧</div><div><h2>{({es:"Importar calendario con IA",en:"Import calendar with AI",fr:"Importer un calendrier avec l’IA",pt:"Importar calendário com IA",zh:"使用 AI 导入日历",it:"Importa calendario con IA",de:"Kalender mit KI importieren",ru:"Импорт календаря с ИИ",ja:"AIでカレンダーを読み込む",ko:"AI로 캘린더 가져오기"} as Record<string,string>)[lang] || "Importar calendario con IA"}</h2><p>{({es:"Sube una captura o PDF. Extraeremos las fechas y prepararemos las actividades para tu calendario.",en:"Upload a screenshot or PDF. We’ll extract dates and prepare activities for your calendar.",fr:"Importez une capture ou un PDF. Nous extrairons les dates et préparerons les activités.",pt:"Envie uma captura ou PDF. Vamos extrair as datas e preparar as atividades.",zh:"上传截图或 PDF，提取日期并整理日历活动。",it:"Carica uno screenshot o PDF: estrarremo le date e prepareremo le attività.",de:"Lade einen Screenshot oder ein PDF hoch. Wir extrahieren Termine und bereiten Aktivitäten vor.",ru:"Загрузите снимок экрана или PDF — мы извлечём даты и подготовим события.",ja:"スクリーンショットまたはPDFをアップロードして日付を抽出します。",ko:"스크린샷이나 PDF를 업로드하면 날짜를 추출해 일정을 준비합니다."} as Record<string,string>)[lang] || "Sube una captura o PDF para extraer las fechas."}</p></div></div>
                <label className={`calendar-upload ${calendarImportBusy ? "is-busy" : ""}`}>
                  <input type="file" accept="text/calendar,.ics,application/pdf,.pdf,image/png,image/jpeg,image/webp,image/bmp,.png,.jpg,.jpeg,.webp,.bmp" disabled={calendarImportBusy} onChange={event => { void importCalendarFile(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
                  <span>{calendarImportBusy ? "◌" : "＋"}</span><strong>{calendarImportBusy ? (lang === "en" ? "Processing file…" : "Procesando archivo…") : (lang === "en" ? "Choose an ICS, PDF or image" : lang === "fr" ? "Choisir ICS, PDF ou image" : lang === "pt" ? "Escolher ICS, PDF ou imagem" : "Elegir ICS, PDF o imagen")}</strong><small>ICS · PDF · PNG · JPG · WEBP · BMP · 10 MB</small>
                </label>
                {calendarImportStatus && <p className={`calendar-import-status ${calendarImportBusy ? "working" : ""}`} role="status">{calendarImportStatus}</p>}
                {calendarFileName && <p className="calendar-file-name">{calendarFileName}</p>}
                {calendarDrafts.length > 0 && <div className="calendar-review"><div className="calendar-review-top"><strong>{lang === "en" ? "Review detected activities" : lang === "fr" ? "Vérifier les activités détectées" : lang === "pt" ? "Revise as atividades detectadas" : "Revisa las actividades detectadas"}</strong><button type="button" className="text-btn" onClick={() => setCalendarDrafts(drafts => drafts.map(draft => ({ ...draft, selected: !drafts.every(item => item.selected) })))}>{calendarDrafts.every(item => item.selected) ? (lang === "en" ? "Deselect all" : "Desmarcar todo") : (lang === "en" ? "Select all" : "Seleccionar todo")}</button></div>
                  {calendarDrafts.map((event, index) => <div className="calendar-review-item" key={`${event.title}-${index}`}><label className="calendar-review-check"><input type="checkbox" checked={event.selected} onChange={e => setCalendarDrafts(drafts => drafts.map((draft, i) => i === index ? { ...draft, selected: e.target.checked } : draft))} /></label><div className="calendar-review-fields"><input aria-label="Título" value={event.title} onChange={e => setCalendarDrafts(drafts => drafts.map((draft, i) => i === index ? { ...draft, title: e.target.value } : draft))} /><div className="calendar-review-meta"><input aria-label="Materia" value={event.subject} placeholder={lang === "en" ? "Subject" : "Materia"} onChange={e => setCalendarDrafts(drafts => drafts.map((draft, i) => i === index ? { ...draft, subject: e.target.value } : draft))} /><input aria-label="Fecha" type="date" value={event.due} onChange={e => setCalendarDrafts(drafts => drafts.map((draft, i) => i === index ? { ...draft, due: e.target.value } : draft))} /><select aria-label="Tipo" value={event.kind} onChange={e => setCalendarDrafts(drafts => drafts.map((draft, i) => i === index ? { ...draft, kind: e.target.value as Task["kind"] } : draft))}><option value="Tarea">{tr("Tarea")}</option><option value="Parcial">{tr("Parcial")}</option><option value="Estudio">{tr("Estudio")}</option></select></div>{event.instructions && <small>{event.instructions}</small>}{!event.due && <small className="calendar-date-warning">{lang === "en" ? "Date unclear — please set it." : "Fecha dudosa: corrígela antes de importar."}</small>}</div></div>)}
                  <div className="feature-actions"><button type="button" className="primary-btn" onClick={confirmCalendarImport}>{lang === "en" ? "Add selected to calendar" : lang === "fr" ? "Ajouter au calendrier" : lang === "pt" ? "Adicionar ao calendário" : "Agregar seleccionadas al calendario"}</button><button type="button" className="secondary-btn" onClick={() => { setCalendarDrafts([]); setCalendarImportStatus(""); setCalendarFileName(""); }}>{lang === "en" ? "Cancel" : "Cancelar"}</button></div>
                </div>}
                <p className="calendar-import-privacy">{lang === "en" ? "Files are read in your browser; only extracted text is sent to the existing AI model for structuring." : lang === "fr" ? "Le fichier est lu dans votre navigateur ; seul le texte extrait est envoyé au modèle IA actuel." : lang === "pt" ? "O arquivo é lido no navegador; somente o texto extraído é enviado ao modelo de IA atual." : "El archivo se procesa en tu navegador; solo el texto extraído se envía al modelo de IA actual."}</p>
              </section>
              <section className="panel">
                {tasks.length ? (
                  tasks
                    .slice()
                    .sort((a, b) => a.due.localeCompare(b.due))
                    .map((t) => (
                      <div className="calendar-row" key={t.id}>
                        <div className="calendar-date">
                          <b>{t.due ? new Date(`${t.due}T12:00:00`).getDate() : "—"}</b>
                          <small>{date(t.due)}</small>
                        </div>
                        <TaskRow t={t} toggle={toggle} del={del} lang={lang} />
                      </div>
                    ))
                ) : (
                  <Empty lang={lang} />
                )}
              </section>
            </>
          )}
          {page === "Tutor IA" && (
            <>
              <PageHeading
                title={tr("Tu tutor de estudio")}
                sub={tr(
                  "Explicaciones claras, ejemplos y ejercicios para comprobar que entendiste.",
                )}
              />
              <QuoteCard section="tutor" lang={lang} />
              <section className="panel tutor-workspace">
                <Head
                  title="¿Qué vamos a aprender?"
                  sub={`Estado de API: ${apiStatus}`}
                  action={
                    <button
                      type="button"
                      className="secondary-btn"
                      disabled={testingAPI}
                      onClick={testAPI}
                    >
                      {testingAPI ? "Comprobando…" : "Probar conexión"}
                    </button>
                  }
                />
                <form className="tutor-form" onSubmit={tutor}>
                  <TutorContext
                    lang={lang}
                    subject={tutorSubject}
                    setSubject={TS}
                    level={tutorLevel}
                    setLevel={TL}
                  />
                  <label htmlFor="question">{tr("Tu pregunta")}</label>
                  <textarea
                    id="question"
                    value={question}
                    onChange={(e) => Q(e.target.value)}
                    rows={5}
                    placeholder={
                      lang === "en"
                        ? "E.g. Explain Newton’s second law and give me three exercises…"
                        : lang === "fr"
                          ? "Ex. Expliquez la deuxième loi de Newton avec trois exercices…"
                          : "Ej. Explícame la segunda ley de Newton y ponme tres ejercicios..."
                    }
                  />
                  <div className="tutor-form-bottom">
                    <span>{tr("Pide ejemplos, no solo la respuesta.")}</span>
                    <button className="primary-btn" disabled={busy || !question.trim()}>
                      {busy ? "Pensando…" : "Preguntar ↗"}
                    </button>
                  </div>
                </form>
                {answer && (
                  <div className="answer-box">
                    <h3>{tr("Respuesta del tutor")}</h3>
                    <p>{answer}</p>
                  </div>
                )}
                <div className="chatgpt-link">
                  <strong>{tr("¿Quieres continuar en ChatGPT?")}</strong>
                  <a
                    className="text-btn"
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {tr("Abrir ChatGPT ↗")}
                  </a>
                </div>
              </section>
              <p className="muted">
                La API requiere una clave secreta en el servidor. Nunca la pegues en esta página ni
                en el chat.
              </p>
            </>
          )}
          {page === "Tarjetas" && <FlashcardsPage lang={lang} />}
          {page === "Exámenes" && <ExamsPage lang={lang} />}
          {page === "Estadísticas" && <StatsPage lang={lang} tasks={tasks} />}
          {page === "Enfoque" && <FocusPage lang={lang} />}
          {page === "Mindfulness" && <MindfulnessPage lang={lang} />}
          {page === "Apuntes" && <NotesPage lang={lang} />}
          {page === "Google Drive" && (
            <>
              <PageHeading title={tr("Google Drive")} sub={driveText.subtitle} />
              <section className="panel drive-page-panel">
                <div className="drive-hero-icon" aria-hidden="true">☁</div>
                <span className="eyebrow">GOOGLE DRIVE · BACKUPS</span>
                <h2>{driveText.headline}</h2>
                <p className="drive-page-description">{driveText.description}</p>
                <div className="drive-feature-grid">
                  <div><span>01</span><strong>{driveText.account}</strong><p>{driveText.accountDesc}</p></div>
                  <div><span>02</span><strong>{driveText.encrypted}</strong><p>{driveText.encryptedDesc}</p></div>
                  <div><span>03</span><strong>{driveText.schedule}</strong><p>{driveText.scheduleDesc}</p></div>
                </div>
                <div className="drive-coming-soon"><span className="drive-status-dot" style={{background:driveConnected?"#4ade80":"#f59e0b"}}></span><div><strong>{driveConnected ? tr("Google Drive conectado") : driveText.notConnected}</strong><p>{driveLoading ? driveText.checking : driveConnected ? (driveEmail || driveText.connectedFallback) : driveText.description}</p></div>{driveConnected ? <button className="secondary-btn" type="button" disabled={driveLoading} onClick={async()=>{setDriveLoading(true);try{const r=await fetch("/api/google/drive/disconnect",{method:"POST",credentials:"same-origin"});if(!r.ok)throw new Error();setDriveConnected(false);setDriveEmail("");try { localStorage.removeItem("estudiax-drive-linked"); } catch {}}catch{N(driveText.disconnectFailed);}finally{setDriveLoading(false);}}}>{driveText.disconnect}</button> : <button className="secondary-btn" type="button" onClick={() => { try { localStorage.setItem("estudiax-drive-linked", "true"); } catch {} window.location.assign("/api/google/oauth/start"); }}>{driveText.connect}</button>}</div>
                {driveConnected && <div className="drive-backup-action"><p>{driveText.encryptedLocal}</p><button className="primary-btn" type="button" disabled={driveSaving} onClick={() => saveEncryptedBackupToDrive(false)}>{driveSaving ? driveText.saving : driveText.save}</button></div>}
              </section>
              <QuoteCard section="drive" lang={lang} />
            </>
          )}
          {page === "Descargas de la app" && (
            <>
              <PageHeading title={tr("Descarga e instalación")} sub={tr("Instrucciones para instalar ESTUDIAX como app web en tu dispositivo.")} />
              <section className="panel download-panel">
                <div className="download-donation" dir={lang === "ar" ? "rtl" : "ltr"}>
                  <div className="download-donation-icon" aria-hidden="true">₿</div>
                  <p>{(DOWNLOAD_DONATION_COPY[lang] || DOWNLOAD_DONATION_COPY.es).message}</p>
                  <a className="primary-btn" href="mailto:estudiaxia@gmail.com?subject=ESTUDIAX%20crypto%20donation%20inquiry">{(DOWNLOAD_DONATION_COPY[lang] || DOWNLOAD_DONATION_COPY.es).button} ↗</a>
                </div>
                <div className="download-intro"><span aria-hidden="true">↗</span><div><h2>{tr("Instalar ESTUDIAX")}</h2><p>{lang === "en" ? "Choose a native app download for your platform, or install the web app." : "Elige la descarga nativa para tu dispositivo o instala la app web."}</p></div></div>
                <div className="download-safe-callout" role="note"><strong>{lang === "en" ? "Native apps and web app" : "Aplicaciones nativas y app web"}</strong><p>{lang === "en" ? "Native packages are built from the public ESTUDIAX source. A missing publisher signature does not mean an app is malware; it means the operating system cannot verify a trusted publisher. We are preparing signed releases. Do not disable system protections." : "Los paquetes nativos se compilan desde el código público de ESTUDIAX. Que falte una firma de editor no significa que una app sea malware; significa que el sistema no puede verificar un editor de confianza. Estamos preparando las versiones firmadas. No desactives las protecciones del sistema."}</p><a className="primary-btn" href="https://estudiax.higgsfield.app" target="_blank" rel="noopener noreferrer">{lang === "en" ? "Open web app ↗" : "Abrir app web ↗"}</a></div>
                <div className="download-platform-grid">
                  <div className="download-platform-card"><div className="download-platform-icon">🤖</div><h3>Android</h3><p>{lang === "en" ? "Native Android APK. Current release uses a test signing key." : "APK nativo de Android. La versión actual usa una clave de firma de prueba."}</p><a className="primary-btn" href="https://github.com/ebmatias-droid/ESTUDIAX-native/releases/download/continuous/ESTUDIAX-Android-debug.apk">{lang === "en" ? "Download APK ↓" : "Descargar APK ↓"}</a><button className="secondary-btn" type="button" aria-expanded={downloadPlatform === "android"} onClick={() => setDownloadPlatform(downloadPlatform === "android" ? null : "android")}>{lang === "en" ? "Web app install steps" : "Pasos para instalar la app web"}</button></div>
                  <div className="download-platform-card"><div className="download-platform-icon">🍎</div><h3>iPhone</h3><p>{lang === "en" ? "Native TestFlight distribution is being configured; the web app can be added to your Home Screen now." : "Se está configurando la distribución nativa por TestFlight; puedes añadir la app web a tu pantalla de inicio."}</p><button className="secondary-btn" type="button" aria-expanded={downloadPlatform === "iphone"} onClick={() => setDownloadPlatform(downloadPlatform === "iphone" ? null : "iphone")}>{lang === "en" ? "Show install steps" : "Ver pasos de instalación"}</button></div>
                  <div className="download-platform-card"><div className="download-platform-icon">▣</div><h3>iPad</h3><p>{lang === "en" ? "Native TestFlight distribution is being configured; install the web app meanwhile." : "Se está configurando TestFlight para la app nativa; mientras tanto puedes instalar la app web."}</p><button className="secondary-btn" type="button" aria-expanded={downloadPlatform === "ipad"} onClick={() => setDownloadPlatform(downloadPlatform === "ipad" ? null : "ipad")}>{lang === "en" ? "Show install steps" : "Ver pasos de instalación"}</button></div>
                  <div className="download-platform-card"><div className="download-platform-icon">⌚</div><h3>Apple Watch</h3><p>{lang === "en" ? "Watch calendar and local reminders · source code" : "Calendario y recordatorios locales · código fuente"}</p><a className="secondary-btn" href="https://github.com/ebmatias-droid/ESTUDIAX-native/blob/main/AppleApps/ESTUDIAXWatch/ESTUDIAXWatchApp.swift" target="_blank" rel="noopener noreferrer">{lang === "en" ? "View Watch code ↗" : "Ver código del reloj ↗"}</a></div>
                  <div className="download-platform-card"><div className="download-platform-icon">💻</div><h3>macOS</h3><p>{lang === "en" ? "Native Mac app. The current DMG still needs Developer ID signing and Apple notarization to pass Gatekeeper normally." : "App nativa para Mac. El DMG actual aún necesita firma Developer ID y notarización de Apple para que Gatekeeper lo acepte normalmente."}</p><a className="primary-btn" href="https://github.com/ebmatias-droid/ESTUDIAX-native/releases/download/continuous/ESTUDIAX-macOS.dmg">{lang === "en" ? "Download macOS DMG ↓" : "Descargar DMG para Mac ↓"}</a><button className="secondary-btn" type="button" aria-expanded={downloadPlatform === "mac"} onClick={() => setDownloadPlatform(downloadPlatform === "mac" ? null : "mac")}>{lang === "en" ? "Web app install steps" : "Pasos para instalar la app web"}</button></div>
                  <div className="download-platform-card"><div className="download-platform-icon">🪟</div><h3>Windows</h3><p>{lang === "en" ? "Native Windows installer. A trusted publisher signature is being configured." : "Instalador nativo de Windows. Se está configurando la firma de editor de confianza."}</p><a className="primary-btn" href="https://github.com/ebmatias-droid/ESTUDIAX-native/releases/download/continuous/ESTUDIAX-Windows-Setup.exe">{lang === "en" ? "Download Windows EXE ↓" : "Descargar EXE para Windows ↓"}</a><button className="secondary-btn" type="button" aria-expanded={downloadPlatform === "windows"} onClick={() => setDownloadPlatform(downloadPlatform === "windows" ? null : "windows")}>{lang === "en" ? "Web app install steps" : "Pasos para instalar la app web"}</button></div>
                  <div className="download-platform-card"><div className="download-platform-icon">🐧</div><h3>Linux</h3><p>{lang === "en" ? "Choose AppImage or Debian package." : "Elige AppImage o paquete Debian."}</p><div className="download-file-links"><a href="https://github.com/ebmatias-droid/ESTUDIAX-native/releases/download/continuous/ESTUDIAX-Linux.AppImage">AppImage ↓</a><a href="https://github.com/ebmatias-droid/ESTUDIAX-native/releases/download/continuous/ESTUDIAX-Linux.deb">DEB ↓</a></div><button className="secondary-btn" type="button" aria-expanded={downloadPlatform === "linux"} onClick={() => setDownloadPlatform(downloadPlatform === "linux" ? null : "linux")}>{lang === "en" ? "Web app install steps" : "Pasos para instalar la app web"}</button></div>
                </div>
                {downloadPlatform && <div className="download-native-status" id="download-install-steps" aria-live="polite"><h3>{({android:"Android",iphone:"iPhone",ipad:"iPad",mac:"macOS",windows:"Windows",linux:"Linux"} as Record<string,string>)[downloadPlatform]} · {lang === "en" ? "Install as a web app" : "Instalar como app web"}</h3><div className="download-steps">{((DOWNLOAD_STEPS[lang] || DOWNLOAD_STEPS.es)[downloadPlatform] || DOWNLOAD_STEPS.es[downloadPlatform]).map((step,i)=><div className="download-step" key={step}><span>{i+1}</span><p>{step}</p></div>)}</div><button className="secondary-btn" type="button" onClick={() => setDownloadPlatform(null)}>{lang === "en" ? "Close instructions" : "Cerrar instrucciones"}</button></div>}
                <p className="download-note">{lang === "en" ? "The Mac DMG and Windows installer need publisher signing, and macOS also requires notarization. The Android APK is currently debug-signed. These are distribution requirements, not proof that the source is malicious. The signed-release workflow is documented in the public native repository." : "El DMG de Mac y el instalador de Windows necesitan firma de editor; macOS también requiere notarización. El APK de Android está firmado en modo debug. Son requisitos de distribución, no pruebas de que el código sea malicioso. El proceso de firma está documentado en el repositorio nativo público."}</p>
                <div className="download-release-link"><a href="https://github.com/ebmatias-droid/ESTUDIAX-native/releases" target="_blank" rel="noreferrer">{lang === "en" ? "All releases ↗" : "Todas las versiones ↗"}</a><a href="https://github.com/ebmatias-droid/ESTUDIAX-native/releases/download/continuous/SHA256SUMS.txt" target="_blank" rel="noreferrer">{lang === "en" ? "SHA-256 checksums ↓" : "Verificar SHA-256 ↓"}</a><a href="https://github.com/ebmatias-droid/ESTUDIAX-native/actions" target="_blank" rel="noreferrer">{lang === "en" ? "Build status ↗" : "Estado de compilación ↗"}</a><a href="https://github.com/ebmatias-droid/ESTUDIAX-native/blob/main/docs/SIGNING-SETUP.md" target="_blank" rel="noreferrer">{lang === "en" ? "Signing setup ↗" : "Configuración de firmas ↗"}</a></div>
              </section>
              <QuoteCard section="downloads" lang={lang} />
            </>
          )}
          {page === "Colores" && (
            <>
              <PageHeading title={tr("Colores")} sub={tr("Elige un color para toda la interfaz")} />
              <section className="panel theme-picker-panel">
                <p className="muted">{tr("Elige un color para toda la interfaz")}</p>
                <div className="theme-swatches">
                  {([{id:"blue",hex:"#60a5fa",label:{es:"Azul",en:"Blue",fr:"Bleu",pt:"Azul",zh:"蓝色",it:"Blu",de:"Blau",ru:"Синий"}},{id:"red",hex:"#f87171",label:{es:"Rojo",en:"Red",fr:"Rouge",pt:"Vermelho",zh:"红色",it:"Rosso",de:"Rot",ru:"Красный"}},{id:"green",hex:"#4ade80",label:{es:"Verde",en:"Green",fr:"Vert",pt:"Verde",zh:"绿色",it:"Verde",de:"Grün",ru:"Зелёный"}},{id:"yellow",hex:"#facc15",label:{es:"Amarillo",en:"Yellow",fr:"Jaune",pt:"Amarelo",zh:"黄色",it:"Giallo",de:"Gelb",ru:"Жёлтый"}},{id:"purple",hex:"#c084fc",label:{es:"Morado",en:"Purple",fr:"Violet",pt:"Roxo",zh:"紫色",it:"Viola",de:"Lila",ru:"Фиолетовый"}},{id:"pink",hex:"#f472b6",label:{es:"Rosa",en:"Pink",fr:"Rose",pt:"Rosa",zh:"粉色",it:"Rosa",de:"Rosa",ru:"Розовый"}},{id:"orange",hex:"#f97316",label:{es:"Naranja",en:"Orange",fr:"Orange",pt:"Laranja",zh:"橙色",it:"Arancione",de:"Orange",ru:"Оранжевый"}},{id:"black",hex:"#737b87",label:{es:"Grafito",en:"Graphite",fr:"Graphite",pt:"Grafite",zh:"石墨色",it:"Grafite",de:"Graphit",ru:"Графит"}},{id:"white",hex:"#e5e7eb",label:{es:"Blanco",en:"White",fr:"Blanc",pt:"Branco",zh:"白色",it:"Bianco",de:"Weiß",ru:"Белый"}},{id:"teal",hex:"#2dd4bf",label:{es:"Verde azulado",en:"Teal",fr:"Sarcelle",pt:"Verde-azulado",zh:"蓝绿色",it:"Verde petrolio",de:"Blaugrün",ru:"Бирюзовый"}},{id:"cyan",hex:"#22d3ee",label:{es:"Cian",en:"Cyan",fr:"Cyan",pt:"Ciano",zh:"青色",it:"Ciano",de:"Cyan",ru:"Циан"}},{id:"indigo",hex:"#818cf8",label:{es:"Índigo",en:"Indigo",fr:"Indigo",pt:"Índigo",zh:"靛蓝",it:"Indaco",de:"Indigo",ru:"Индиго"}},{id:"lime",hex:"#a3e635",label:{es:"Lima",en:"Lime",fr:"Citron vert",pt:"Lima",zh:"青柠绿",it:"Lime",de:"Limette",ru:"Лайм"}},{id:"coral",hex:"#fb7185",label:{es:"Coral",en:"Coral",fr:"Corail",pt:"Coral",zh:"珊瑚色",it:"Corallo",de:"Koralle",ru:"Коралловый"}}] as Array<{id:string;hex:string;label:Record<string,string>}>).map(theme=><button type="button" key={theme.id} className={`theme-swatch${color===theme.id?" selected":""}`} onClick={()=>SC(theme.id)} aria-pressed={color===theme.id}><span className="theme-swatch-dot" style={{background:theme.hex}}/><strong>{themeLabels[lang]?.[theme.id] || theme.label[lang] || theme.label.es}</strong>{color===theme.id&&<span className="theme-swatch-check" aria-hidden="true">✓</span>}</button>)}
                </div>
                <div className="theme-preview"><span className="theme-preview-dot"/><div><strong>{({es:"Vista previa en vivo",en:"Live preview",fr:"Aperçu en direct",pt:"Prévia ao vivo",zh:"实时预览",it:"Anteprima dal vivo",de:"Live-Vorschau",ru:"Предварительный просмотр"} as Record<string,string>)[lang] || "Vista previa en vivo"}</strong><p>{({es:"El color de acento se aplica en toda la interfaz, también al pasar el cursor.",en:"Your accent color updates throughout the interface, including hover states.",fr:"La couleur d’accent est appliquée à toute l’interface, y compris au survol.",pt:"A cor de destaque é aplicada em toda a interface, inclusive ao passar o cursor.",zh:"强调色会应用于整个界面，包括鼠标悬停状态。",it:"Il colore principale si applica a tutta l’interfaccia, anche al passaggio del puntatore.",de:"Die Akzentfarbe wird in der gesamten Oberfläche verwendet, auch beim Darüberfahren.",ru:"Акцентный цвет применяется ко всему интерфейсу, включая состояние при наведении."} as Record<string,string>)[lang] || "El color de acento se aplica en toda la interfaz, también al pasar el cursor."}</p></div></div>
              </section>
            </>
          )}
          {page === "Ajustes" && (
            <>
              <PageHeading title={tr("Ajustes")} sub={tr("Controla tus datos y recordatorios.")} />
              <QuoteCard section="settings" lang={lang} />
              <section className="panel settings-panel">
                <Setting
                  title={
                    lang === "en"
                      ? "Your name"
                      : lang === "fr"
                        ? "Votre nom"
                        : lang === "pt"
                          ? "Seu nome"
                          : "Tu nombre"
                  }
                  text={
                    lang === "en"
                      ? "Personalize your home board title."
                      : lang === "fr"
                        ? "Personnalisez le titre de votre tableau d’accueil."
                        : lang === "pt"
                          ? "Personalize o título do seu quadro inicial."
                          : "Personaliza el título de tu tablón de inicio."
                  }
                  action={
                    <input
                      aria-label={
                        lang === "en"
                          ? "Your name"
                          : lang === "fr"
                            ? "Votre nom"
                            : lang === "pt"
                              ? "Seu nome"
                              : "Tu nombre"
                      }
                      value={userName}
                      maxLength={40}
                      placeholder={
                        lang === "en"
                          ? "Type your name"
                          : lang === "fr"
                            ? "Entrez votre nom"
                            : lang === "pt"
                              ? "Digite seu nome"
                              : "Escribe tu nombre"
                      }
                      onChange={(e) => {
                        SU(e.target.value);
                        localStorage.setItem("estudiax-name", e.target.value);
                      }}
                    />
                  }
                />
                <Setting
                  title={tr("Conexión con Groq")}
                  text="La clave solo vive en los secretos del servidor. Añade GROQ_API_KEY en los secretos del sitio y vuelve a desplegar; no la escribas aquí."
                  action={
                    <button className="secondary-btn" disabled={testingAPI} onClick={testAPI}>
                      {testingAPI ? "Comprobando…" : "Probar conexión"}
                    </button>
                  }
                />
                <Setting
                  title={tr("Modelo IA")}
                  text="Por defecto se usa openai/gpt-oss-120b. Opcionalmente define GROQ_MODEL como secreto del servidor para cambiar el modelo."
                  action={<span className="connection-pill">{apiStatus}</span>}
                />
                <Setting
                  title={
                    lang === "en"
                      ? "Appearance · mode"
                      : lang === "fr"
                        ? "Apparence · mode"
                        : lang === "pt"
                          ? "Aparência · modo"
                          : "Apariencia · modo"
                  }
                  text={
                    lang === "en"
                      ? "Choose how Estudiax looks."
                      : lang === "fr"
                        ? "Choisissez l’apparence d’Estudiax."
                        : lang === "pt"
                          ? "Escolha a aparência do Estudiax."
                          : "Elige cómo se ve Estudiax."
                  }
                  action={
                    <select
                      aria-label="Modo claro u oscuro"
                      value={mode}
                      onChange={(e) => SM(e.target.value)}
                    >
                      <option value="dark">
                        {lang === "en"
                          ? "Dark"
                          : lang === "fr"
                            ? "Sombre"
                            : lang === "pt"
                              ? "Escuro"
                              : lang === "zh"
                                ? "深色"
                                : "Oscuro"}
                      </option>
                      <option value="light">
                        {lang === "en"
                          ? "Light"
                          : lang === "fr"
                            ? "Clair"
                            : lang === "pt"
                              ? "Claro"
                              : lang === "zh"
                                ? "浅色"
                                : "Claro"}
                      </option>
                    </select>
                  }
                />
                <Setting
                  title={
                    lang === "en"
                      ? "Language"
                      : lang === "fr"
                        ? "Langue"
                        : lang === "pt"
                          ? "Idioma"
                          : lang === "zh"
                            ? "语言"
                            : lang === "ja"
                              ? "言語"
                              : lang === "ko"
                                ? "언어"
                                : lang === "sw"
                                  ? "Lugha"
                                  : "Idioma"
                  }
                  text={
                    lang === "en"
                      ? "Change the interface language."
                      : lang === "fr"
                        ? "Changer la langue de l’interface."
                        : lang === "pt"
                          ? "Altere o idioma da interface."
                          : lang === "zh"
                            ? "更改界面语言。"
                            : lang === "ja"
                              ? "インターフェースの言語を変更します。"
                              : lang === "ko"
                                ? "인터페이스 언어를 변경합니다."
                                : lang === "sw"
                                  ? "Badilisha lugha ya kiolesura."
                                  : "Cambia el idioma de la interfaz."
                  }
                  action={
                    <select aria-label="Idioma" value={lang} onChange={(e) => SL(e.target.value)}>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="pt">Português</option>
                      <option value="zh">中文（简体）</option>
                      <option value="it">Italiano</option>
                      <option value="de">Deutsch</option>
                      <option value="ru">Русский</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                      <option value="sw">Kiswahili</option>
                      <option value="ar">العربية</option>
                      <option value="hi">हिन्दी</option>
                      <option value="id">Bahasa Indonesia</option>
                      <option value="tr">Türkçe</option>
                      <option value="vi">Tiếng Việt</option>
                      <option value="nl">Nederlands</option>
                    </select>
                  }
                />
                <Setting
                  title={
                    lang === "en"
                      ? "Dyslexia-friendly mode"
                      : lang === "fr"
                        ? "Mode adapté à la dyslexie"
                        : lang === "pt"
                          ? "Modo amigável para dislexia"
                          : lang === "zh"
                            ? "阅读友好模式（阅读障碍）"
                            : lang === "ja"
                              ? "ディスレクシアに配慮したモード"
                              : lang === "ko"
                                ? "난독증 친화 모드"
                                : "Modo disléxico"
                  }
                  text={
                    lang === "en"
                      ? "Switch the interface to OpenDyslexic Bold. You can turn it off any time."
                      : lang === "fr"
                        ? "Passe l’interface en OpenDyslexic Bold. Vous pouvez le désactiver à tout moment."
                        : lang === "pt"
                          ? "Muda a interface para OpenDyslexic Bold. Você pode desativar quando quiser."
                          : lang === "zh"
                            ? "将界面字体切换为 OpenDyslexic Bold，可随时关闭。"
                            : "Cambia toda la interfaz a OpenDyslexic Bold. Puedes apagarlo cuando quieras."
                  }
                  action={
                    <button
                      type="button"
                      className={dyslexicMode ? "primary-btn" : "secondary-btn"}
                      role="switch"
                      aria-checked={dyslexicMode}
                      onClick={toggleDyslexicMode}
                    >
                      {dyslexicMode
                        ? lang === "en" ? "On · Turn off" : lang === "fr" ? "Activé · Désactiver" : lang === "pt" ? "Ativo · Desativar" : lang === "zh" ? "已开启 · 关闭" : "Activado · Apagar"
                        : lang === "en" ? "Off · Turn on" : lang === "fr" ? "Désactivé · Activer" : lang === "pt" ? "Desativado · Ativar" : lang === "zh" ? "已关闭 · 开启" : "Desactivado · Activar"}
                    </button>
                  }
                />
                <div className="settings-section-title"><h2>{lang === "en" ? "Advanced accessibility" : lang === "fr" ? "Accessibilité avancée" : lang === "pt" ? "Acessibilidade avançada" : lang === "zh" ? "高级无障碍设置" : "Accesibilidad avanzada"}</h2><p>{lang === "en" ? "Personalize reading comfort. These settings are saved on this device." : lang === "fr" ? "Personnalisez le confort de lecture. Ces réglages restent sur cet appareil." : lang === "pt" ? "Personalize o conforto de leitura. Estas opções ficam neste dispositivo." : lang === "zh" ? "自定义阅读体验。设置保存在此设备上。" : "Personaliza la lectura. Estos ajustes se guardan en este dispositivo."}</p></div>
                <Setting title={lang === "en" ? "Typeface" : lang === "fr" ? "Police" : lang === "pt" ? "Fonte" : lang === "zh" ? "字体" : "Tipografía"} text={lang === "en" ? "Choose a font for the whole interface." : lang === "fr" ? "Choisissez la police de toute l’interface." : lang === "pt" ? "Escolha a fonte de toda a interface." : lang === "zh" ? "选择整个界面的字体。" : "Elige la fuente de toda la interfaz."} action={<select aria-label="Tipografía" value={fontFamily} onChange={e => SF(e.target.value as keyof typeof FONT_OPTIONS)}><option value="system">Sistema · predeterminada</option><option value="serif">Serif · clásica</option><option value="rounded">Redondeada</option><option value="mono">Monoespaciada</option><option value="dyslexic">OpenDyslexic</option></select>} />
                <Setting title={lang === "en" ? "Text size" : lang === "fr" ? "Taille du texte" : lang === "pt" ? "Tamanho do texto" : lang === "zh" ? "文字大小" : "Tamaño del texto"} text={lang === "en" ? "Increase or decrease interface text." : lang === "fr" ? "Agrandissez ou réduisez le texte." : lang === "pt" ? "Aumente ou diminua o texto." : lang === "zh" ? "放大或缩小界面文字。" : "Aumenta o reduce el tamaño del texto."} action={<select aria-label="Tamaño del texto" value={fontScale} onChange={e => SFS(e.target.value)}><option value="90">90%</option><option value="100">100% · predeterminado</option><option value="110">110%</option><option value="125">125%</option><option value="140">140%</option></select>} />
                <Setting title={lang === "en" ? "Line spacing" : lang === "fr" ? "Interligne" : lang === "pt" ? "Espaçamento entre linhas" : lang === "zh" ? "行距" : "Espaciado entre líneas"} text={lang === "en" ? "Add more space between lines when reading." : lang === "fr" ? "Ajoutez de l’espace entre les lignes." : lang === "pt" ? "Adicione espaço entre as linhas." : lang === "zh" ? "增加行间距以便阅读。" : "Añade espacio entre líneas para leer mejor."} action={<select aria-label="Espaciado" value={lineSpacing} onChange={e => SLS(e.target.value)}><option value="normal">Normal</option><option value="relaxed">Relajado</option><option value="wide">Amplio</option></select>} />
                <Setting title={lang === "en" ? "High contrast" : lang === "fr" ? "Contraste élevé" : lang === "pt" ? "Alto contraste" : lang === "zh" ? "高对比度" : "Alto contraste"} text={lang === "en" ? "Strengthen text and border contrast." : lang === "fr" ? "Renforcez le contraste du texte et des bordures." : lang === "pt" ? "Aumente o contraste do texto e das bordas." : lang === "zh" ? "增强文字和边框对比度。" : "Refuerza el contraste del texto y los bordes."} action={<button className={highContrast ? "primary-btn" : "secondary-btn"} role="switch" aria-checked={highContrast} onClick={() => SHC(v => !v)}>{highContrast ? "Activado" : "Desactivado"}</button>} />
                <Setting title={lang === "en" ? "Reduce motion" : lang === "fr" ? "Réduire les animations" : lang === "pt" ? "Reduzir movimento" : lang === "zh" ? "减少动画" : "Reducir movimiento"} text={lang === "en" ? "Reduce interface transitions and animation." : lang === "fr" ? "Réduisez les transitions et animations." : lang === "pt" ? "Reduza transições e animações." : lang === "zh" ? "减少界面过渡和动画。" : "Reduce las transiciones y animaciones de la interfaz."} action={<button className={reduceMotion ? "primary-btn" : "secondary-btn"} role="switch" aria-checked={reduceMotion} onClick={() => SRM(v => !v)}>{reduceMotion ? "Activado" : "Desactivado"}</button>} />
                <div className="settings-section-title"><h2>{lang === "en" ? "Privacy & security" : lang === "fr" ? "Confidentialité et sécurité" : lang === "pt" ? "Privacidade e segurança" : lang === "zh" ? "隐私与安全" : "Privacidad y seguridad"}</h2><p>{lang === "en" ? "What Estudiax protects, and what stays on your device." : lang === "fr" ? "Ce qu’Estudiax protège et ce qui reste sur votre appareil." : lang === "pt" ? "O que o Estudiax protege e o que fica no dispositivo." : lang === "zh" ? "了解 Estudiax 的保护措施以及保留在设备上的数据。" : "Qué protege ESTUDIAX y qué permanece en tu dispositivo."}</p></div>
                <Setting title="HTTPS · Tráfico cifrado" text={lang === "en" ? "This site is served over HTTPS. HTTPS encrypts data in transit, but does not encrypt your local browser storage." : lang === "fr" ? "Ce site utilise HTTPS. HTTPS chiffre le transit, pas le stockage local du navigateur." : lang === "pt" ? "Este site usa HTTPS. HTTPS cifra o tráfego, mas não o armazenamento local." : lang === "zh" ? "本站使用 HTTPS 加密传输，但不会加密浏览器本地存储。" : "El sitio usa HTTPS: cifra los datos en tránsito, no el almacenamiento local del navegador."} action={<span className="security-status">HTTPS · activo en producción</span>} />
                <Setting title={lang === "en" ? "Server-side API keys" : lang === "fr" ? "Clés API côté serveur" : lang === "pt" ? "Chaves de API no servidor" : lang === "zh" ? "服务器端 API 密钥" : "Claves API del servidor"} text={lang === "en" ? "Groq and Turnstile secrets are configured server-side and must never be pasted into this app or a public repository." : lang === "fr" ? "Les secrets Groq et Turnstile restent côté serveur. Ne les collez jamais dans l’app ou un dépôt public." : lang === "pt" ? "Os segredos Groq e Turnstile ficam no servidor; nunca os cole no app nem em repositórios públicos." : lang === "zh" ? "Groq 和 Turnstile 密钥仅保存在服务器端，请勿粘贴到应用或公开仓库。" : "Los secretos de Groq y Turnstile viven en el servidor: nunca los pegues en la app ni en un repositorio público."} action={<span className="security-status">Servidor</span>} />
                <Setting title={lang === "en" ? "Local data" : lang === "fr" ? "Données locales" : lang === "pt" ? "Dados locais" : lang === "zh" ? "本地数据" : "Datos locales"} text={lang === "en" ? "Tasks, notes and study records are stored in this browser. Anyone with access to this browser profile may be able to read them." : lang === "fr" ? "Les tâches et notes sont stockées dans ce navigateur. Une personne ayant accès à ce profil peut les consulter." : lang === "pt" ? "Tarefas e notas ficam neste navegador. Quem acessar este perfil pode conseguir lê-las." : lang === "zh" ? "任务和笔记保存在此浏览器中。能够访问此浏览器配置文件的人可能会读取它们。" : "Las tareas y notas se guardan en este navegador. Quien tenga acceso a este perfil podría leerlas."} action={<span className="security-status">Solo este navegador</span>} />
                <Setting title={lang === "en" ? "Security headers" : lang === "fr" ? "En-têtes de sécurité" : lang === "pt" ? "Cabeçalhos de segurança" : lang === "zh" ? "安全响应标头" : "Cabeceras de seguridad"} text={lang === "en" ? "The app sends anti-sniffing, referrer, framing, permissions and HSTS headers. A strict CSP needs a separate compatibility audit for Turnstile." : lang === "fr" ? "L’app envoie des en-têtes anti-sniffing, de référent, de cadrage, de permissions et HSTS. La CSP stricte nécessite un audit de compatibilité Turnstile." : lang === "pt" ? "O app envia cabeçalhos anti-sniffing, de referência, enquadramento, permissões e HSTS. Uma CSP estrita exige auditoria de compatibilidade com Turnstile." : lang === "zh" ? "应用发送防嗅探、来源、框架、权限和 HSTS 标头。严格 CSP 需要单独检查 Turnstile 兼容性。" : "La app envía cabeceras anti-sniffing, referente, marcos, permisos y HSTS. Una CSP estricta requiere auditar compatibilidad con Turnstile."} action={<span className="security-status">Configurado</span>} />
                <Setting title={lang === "en" ? "Encrypted backup" : lang === "fr" ? "Sauvegarde chiffrée" : lang === "pt" ? "Backup criptografado" : lang === "zh" ? "加密备份" : "Respaldo cifrado"} text={lang === "en" ? "Export your study data in an AES-GCM encrypted file protected by a password you choose." : lang === "fr" ? "Exportez vos données dans un fichier chiffré AES-GCM protégé par un mot de passe." : lang === "pt" ? "Exporte seus dados em um arquivo AES-GCM protegido por senha." : lang === "zh" ? "将学习数据导出为由自设密码保护的 AES-GCM 加密文件。" : "Exporta tus datos en un archivo cifrado con AES-GCM y una contraseña que tú eliges."} action={<button className="secondary-btn" onClick={async () => { const password = prompt(lang === "en" ? "Choose a strong backup password (12+ characters)." : "Elige una contraseña fuerte para el respaldo (12 caracteres o más).") ; if (!password) return; if (password.length < 12) { N("Usa al menos 12 caracteres para proteger el respaldo."); return; } try { const payload = { version: 1, exportedAt: new Date().toISOString(), tasks, settings: { mode, color, lang, fontFamily, fontScale, lineSpacing, highContrast, reduceMotion, dyslexicMode, userName }, localData: Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith("estudiax-") && !k.includes("notified-")).map(k => [k, localStorage.getItem(k)])) }; const blob = await encryptBackup(payload, password); const url = URL.createObjectURL(new Blob([blob], {type:"application/json"})); const a = document.createElement("a"); a.href = url; a.download = "estudiax-respaldo-cifrado.estudiax"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); N("Respaldo cifrado creado. Guarda tu contraseña: no se puede recuperar si la olvidas."); } catch { N("No se pudo crear el respaldo cifrado en este navegador."); } }}>{lang === "en" ? "Export encrypted" : lang === "fr" ? "Exporter chiffré" : lang === "pt" ? "Exportar criptografado" : lang === "zh" ? "导出加密备份" : "Exportar cifrado"}</button>} />
                <Setting title={lang === "en" ? "Restore encrypted backup" : lang === "fr" ? "Restaurer une sauvegarde" : lang === "pt" ? "Restaurar backup" : lang === "zh" ? "恢复加密备份" : "Restaurar respaldo cifrado"} text={lang === "en" ? "Restore an Estudiax encrypted backup from a file. It replaces current Estudiax data on this device." : lang === "fr" ? "Restaurez une sauvegarde chiffrée. Elle remplacera les données Estudiax actuelles sur cet appareil." : lang === "pt" ? "Restaure um backup criptografado. Ele substituirá os dados atuais neste dispositivo." : lang === "zh" ? "从文件恢复加密备份，将替换此设备上的现有 Estudiax 数据。" : "Restaura un respaldo cifrado. Reemplazará los datos actuales de ESTUDIAX en este dispositivo."} action={<button className="secondary-btn" onClick={() => { const picker = document.createElement("input"); picker.type = "file"; picker.accept = ".estudiax,.json,application/json"; picker.onchange = async () => { const file = picker.files?.[0]; if (!file) return; const password = prompt("Escribe la contraseña del respaldo cifrado."); if (!password) return; try { const restored = await decryptBackup(await file.text(), password); if (!confirm("Esto reemplazará los datos actuales de Estudiax en este dispositivo. ¿Continuar?")) return; const localData = restored.localData; if (localData && typeof localData === "object") { for (const k of Object.keys(localStorage)) if (k.startsWith("estudiax-") && !k.includes("notified-")) localStorage.removeItem(k); for (const [k,v] of Object.entries(localData as Record<string, unknown>)) if (k.startsWith("estudiax-") && typeof v === "string") localStorage.setItem(k,v); } if (Array.isArray(restored.tasks)) { S(restored.tasks as Task[]); localStorage.setItem(key, JSON.stringify(restored.tasks)); } N("Respaldo restaurado. Recargando para aplicar todas las preferencias."); window.location.reload(); } catch { N("No se pudo descifrar el respaldo. Comprueba la contraseña y el archivo."); } }; picker.click(); }}>{lang === "en" ? "Import encrypted" : lang === "fr" ? "Importer" : lang === "pt" ? "Importar" : lang === "zh" ? "导入" : "Importar cifrado"}</button>} />
                <Setting
                  title={tr("Notificaciones")}
                  text={
                    notify
                      ? lang === "en"
                        ? "Reminders are enabled for tasks due today while Estudiax is open."
                        : lang === "fr"
                          ? "Rappels activés pour les tâches du jour tant qu’Estudiax est ouvert."
                          : lang === "pt"
                            ? "Lembretes ativados para tarefas com vencimento hoje enquanto o Estudiax estiver aberto."
                            : lang === "zh"
                              ? "Estudiax 打开时会提醒你今天到期的任务。"
                              : "Recordatorios activados para tareas con fecha de hoy mientras Estudiax esté abierto."
                      : lang === "en"
                        ? "Enable browser reminders for tasks due today."
                        : lang === "fr"
                          ? "Activez les rappels du navigateur pour les tâches du jour."
                          : lang === "pt"
                            ? "Ative lembretes do navegador para tarefas que vencem hoje."
                            : lang === "zh"
                              ? "启用浏览器提醒，通知你今天到期的任务。"
                              : "Activa recordatorios del navegador para las tareas que vencen hoy."
                  }
                  action={
                    <button
                      className="primary-btn"
                      onClick={async () => {
                        // Safari exposes web notifications for installed web apps; guide users to install first.
                        if (isSafari() && !isInstalledWebApp()) {
                          const mobileApple = isIOSDevice();
                          N(
                            lang === "en"
                              ? mobileApple
                                ? "On iPhone/iPad, tap Share → Add to Home Screen, open Estudiax from its new icon, then enable notifications here."
                                : "On Mac, use Safari → File → Add to Dock, open the Estudiax app from the Dock, then enable notifications here."
                              : lang === "fr"
                                ? mobileApple
                                  ? "Sur iPhone/iPad, touchez Partager → Sur l’écran d’accueil, ouvrez Estudiax depuis la nouvelle icône, puis activez les notifications ici."
                                  : "Sur Mac, choisissez Safari → Fichier → Ajouter au Dock, ouvrez Estudiax depuis le Dock, puis activez les notifications ici."
                                : lang === "pt"
                                  ? mobileApple
                                    ? "No iPhone/iPad, toque em Compartilhar → Adicionar à Tela de Início, abra o Estudiax pelo novo ícone e ative as notificações aqui."
                                    : "No Mac, use Safari → Arquivo → Adicionar ao Dock, abra o Estudiax pelo Dock e ative as notificações aqui."
                                  : lang === "zh"
                                    ? mobileApple
                                      ? "在 iPhone/iPad 上，点按“分享 → 添加到主屏幕”，从新图标打开 Estudiax，然后在此启用通知。"
                                      : "在 Mac 上，选择 Safari → 文件 → 添加到程序坞，从程序坞打开 Estudiax，然后在此启用通知。"
                                    : mobileApple
                                      ? "En iPhone/iPad, pulsa Compartir → Añadir a pantalla de inicio, abre ESTUDIAX desde el nuevo icono y activa aquí las notificaciones."
                                      : "En Mac, usa Safari → Archivo → Añadir al Dock, abre ESTUDIAX desde el Dock y activa aquí las notificaciones.",
                          );
                          return;
                        }
                        if (notify) {
                          SN(false);
                          N(
                            lang === "en"
                              ? "Browser reminders disabled."
                              : lang === "fr"
                                ? "Rappels désactivés."
                                : lang === "pt"
                                  ? "Lembretes desativados."
                                  : lang === "zh"
                                    ? "浏览器提醒已关闭。"
                                    : "Recordatorios desactivados.",
                          );
                          return;
                        }
                        if (typeof window.Notification === "undefined") {
                          const installed = isInstalledWebApp();
                          const sw = "serviceWorker" in navigator;
                          const secure = window.isSecureContext;
                          const diagnostic = `Diagnóstico ESTUDIAX: host=${location.host}; standalone=${installed}; secure=${secure}; Notification=${typeof window.Notification}; ServiceWorker=${sw}; Safari=${isSafari()}`;
                          SN(true);
                          N(
                            lang === "en"
                              ? `Native notifications are unavailable in this window, so in-app reminders are enabled instead. They work while ESTUDIAX is open. Close ESTUDIAX completely, reopen it from the Dock, and check System Settings → Notifications. Diagnostic: ${diagnostic}`
                              : lang === "fr"
                                ? `L’app web Safari ne fournit toujours pas l’API de notifications. Fermez complètement ESTUDIAX, rouvrez-le depuis le Dock et vérifiez Réglages Système → Notifications. Diagnostic : ${diagnostic}`
                                : lang === "pt"
                                  ? `O app web do Safari ainda não disponibiliza a API de notificações. Feche o ESTUDIAX completamente, abra-o pelo Dock e confira Ajustes do Sistema → Notificações. Diagnóstico: ${diagnostic}`
                                  : lang === "zh"
                                    ? `Safari 网页应用仍未提供通知 API。请完全退出 ESTUDIAX，再从程序坞打开，并检查系统设置 → 通知。诊断信息：${diagnostic}`
                                    : `Esta ventana no permite notificaciones nativas; activé recordatorios dentro de ESTUDIAX como alternativa mientras la app esté abierta. Cierra la app por completo, vuelve a abrirla desde el Dock y revisa Ajustes del Sistema → Notificaciones. Diagnóstico: ${diagnostic}`,
                          );
                          return;
                        }
                        try {
                          let p = Notification.permission;
                          if (p !== "granted") p = await Notification.requestPermission();
                          if (p !== "granted") {
                            N(
                              lang === "en"
                                ? "Permission was not granted. Allow notifications for this site in your browser settings, then try again."
                                : lang === "zh"
                                  ? "未获得通知权限。请在浏览器的网站设置中允许此网站发送通知，然后重试。"
                                  : "No se concedió el permiso. Permite las notificaciones para este sitio en los ajustes del navegador y vuelve a intentarlo.",
                            );
                            return;
                          }
                          if ("serviceWorker" in navigator) {
                            await navigator.serviceWorker.register("/sw.js", {
                              updateViaCache: "none",
                            });
                            const reg = await navigator.serviceWorker.ready;
                            await reg.showNotification(
                              lang === "en"
                                ? "Estudiax notifications enabled"
                                : lang === "fr"
                                  ? "Notifications Estudiax activées"
                                  : lang === "pt"
                                    ? "Notificações Estudiax ativadas"
                                    : lang === "zh"
                                      ? "Estudiax 通知已启用"
                                      : "Notificaciones de Estudiax activadas",
                              {
                                body:
                                  lang === "en"
                                    ? "You'll receive reminders for tasks due today while the app is open."
                                    : lang === "fr"
                                      ? "Vous recevrez des rappels pour les tâches du jour lorsque l’application est ouverte."
                                      : lang === "pt"
                                        ? "Você receberá lembretes das tarefas de hoje enquanto o app estiver aberto."
                                        : lang === "zh"
                                          ? "应用打开时，你会收到今日待办任务的提醒。"
                                          : "Recibirás recordatorios de tareas que vencen hoy mientras la app esté abierta.",
                                icon: "/icons/icon.svg",
                                tag: "estudiax-notification-test",
                              },
                            );
                          } else {
                            new Notification("Estudiax", { body: "Notificaciones activadas." });
                          }
                          SN(true);
                          N(
                            lang === "en"
                              ? "Notifications are working. Keep Estudiax open to receive due-today reminders."
                              : lang === "fr"
                                ? "Les notifications fonctionnent. Gardez Estudiax ouvert pour les rappels du jour."
                                : lang === "pt"
                                  ? "As notificações funcionam. Mantenha o Estudiax aberto para receber lembretes de hoje."
                                  : lang === "zh"
                                    ? "通知已正常启用。请保持 Estudiax 打开以接收今日任务提醒。"
                                    : "¡Notificaciones funcionando! Mantén Estudiax abierto para recibir avisos de tareas que vencen hoy.",
                          );
                        } catch {
                          N(
                            lang === "en"
                              ? "The browser allowed permission but couldn't display a notification. Check site notifications and operating-system focus settings, then try again."
                              : lang === "fr"
                                ? "Le navigateur a autorisé les notifications mais n’a pas pu les afficher. Vérifiez les réglages du site et le mode concentration du système."
                                : lang === "pt"
                                  ? "O navegador permitiu as notificações, mas não conseguiu exibi-las. Verifique as configurações do site e o modo Foco do sistema."
                                  : lang === "zh"
                                    ? "浏览器已允许权限，但无法显示通知。请检查网站通知和系统专注模式设置，然后重试。"
                                    : "El navegador permitió el acceso, pero no pudo mostrar la notificación. Revisa los permisos del sitio y el modo concentración del sistema.",
                          );
                        }
                      }}
                    >
                      {notify
                        ? lang === "en"
                          ? "Disable reminders"
                          : lang === "fr"
                            ? "Désactiver les rappels"
                            : lang === "pt"
                              ? "Desativar lembretes"
                              : lang === "zh"
                                ? "关闭通知"
                                : "Desactivar avisos"
                        : lang === "en"
                          ? "Enable reminders"
                          : lang === "fr"
                            ? "Activer les rappels"
                            : lang === "pt"
                              ? "Ativar lembretes"
                              : lang === "zh"
                                ? "启用通知"
                                : "Activar avisos"}
                    </button>
                  }
                />
                <Setting
                  title={tr("Datos locales")}
                  text={tr("Exporta una copia de tus actividades.")}
                  action={
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        const a = document.createElement("a"),
                          u = URL.createObjectURL(
                            new Blob(
                              [
                                JSON.stringify(
                                  {
                                    version: 1,
                                    exportedAt: new Date().toISOString(),
                                    tasks,
                                    flashcards: JSON.parse(
                                      localStorage.getItem("estudiax-flashcards-v1") || "[]",
                                    ),
                                    quizzes: JSON.parse(
                                      localStorage.getItem("estudiax-quizzes-v1") || "[]",
                                    ),
                                    notes: JSON.parse(
                                      localStorage.getItem("estudiax-notes-v1") || "[]",
                                    ),
                                    focusSessions: Number(
                                      localStorage.getItem("estudiax-focus-sessions-v1") || "0",
                                    ),
                                  },
                                  null,
                                  2,
                                ),
                              ],
                              {
                                type: "application/json",
                              },
                            ),
                          );
                        a.href = u;
                        a.download = "estudiax-respaldo.json";
                        a.click();
                        URL.revokeObjectURL(u);
                      }}
                    >
                      {tr("Exportar copia")}
                    </button>
                  }
                />
                <Setting
                  title={tr("Borrar datos locales")}
                  text="Elimina las actividades de este dispositivo."
                  action={
                    <button
                      className="danger-btn"
                      onClick={() => {
                        if (confirm("¿Borrar todas tus actividades locales?")) {
                          S([]);
                          localStorage.removeItem(key);
                          N("Datos borrados.");
                        }
                      }}
                    >
                      {tr("Borrar datos")}
                    </button>
                  }
                />
              </section>
            </>
          )}
        </div>
        <footer className="footer">
          <a className="cloudflare-credit" href="https://www.cloudflare.com/" target="_blank" rel="noreferrer noopener" aria-label={
            lang === "en" ? "Cloudflare protection information" :
            lang === "fr" ? "Informations sur la protection Cloudflare" :
            lang === "pt" ? "Informações sobre a proteção Cloudflare" :
            lang === "zh" ? "Cloudflare 保护信息" :
            lang === "it" ? "Informazioni sulla protezione Cloudflare" :
            lang === "de" ? "Informationen zum Cloudflare-Schutz" :
            lang === "ru" ? "Информация о защите Cloudflare" :
            lang === "ja" ? "Cloudflare の保護に関する情報" :
            lang === "ko" ? "Cloudflare 보호 정보" : "Información sobre la protección de Cloudflare"
          }>
            <img src="https://www.cloudflare.com/img/logo-cloudflare.svg" alt="Cloudflare" loading="lazy" />
            <span className="cloudflare-credit-copy">
              <strong>{lang === "en" ? "Protected by Cloudflare" : lang === "fr" ? "Protégé par Cloudflare" : lang === "pt" ? "Protegido pela Cloudflare" : lang === "zh" ? "由 Cloudflare 提供保护" : lang === "it" ? "Protetto da Cloudflare" : lang === "de" ? "Durch Cloudflare geschützt" : lang === "ru" ? "Защищено Cloudflare" : lang === "ja" ? "Cloudflare による保護" : lang === "ko" ? "Cloudflare 보호 적용" : "Protegido por Cloudflare"}</strong>
              <small>{lang === "en" ? "ESTUDIAX uses Cloudflare infrastructure and Turnstile anti-bot verification." : lang === "fr" ? "ESTUDIAX utilise l’infrastructure Cloudflare et la vérification anti-bots Turnstile." : lang === "pt" ? "O ESTUDIAX usa a infraestrutura da Cloudflare e a verificação anti-bots Turnstile." : lang === "zh" ? "ESTUDIAX 使用 Cloudflare 基础设施和 Turnstile 反机器人验证。" : lang === "it" ? "ESTUDIAX utilizza l’infrastruttura Cloudflare e la verifica anti-bot Turnstile." : lang === "de" ? "ESTUDIAX nutzt die Cloudflare-Infrastruktur und die Turnstile-Bot-Prüfung." : lang === "ru" ? "ESTUDIAX использует инфраструктуру Cloudflare и проверку ботов Turnstile." : lang === "ja" ? "ESTUDIAX は Cloudflare のインフラストラクチャと Turnstile のボット対策認証を使用しています。" : lang === "ko" ? "ESTUDIAX는 Cloudflare 인프라와 Turnstile 봇 방지 인증을 사용합니다." : "ESTUDIAX utiliza la infraestructura de Cloudflare y la verificación anti-bots mediante Turnstile."}</small>
            </span>
          </a>
          <span className="footer-tagline">
            {lang === "en"
              ? "Designed for calm, focused study."
              : lang === "fr"
                ? "Conçu pour étudier sereinement."
                : lang === "pt"
                  ? "Feito para estudar com tranquilidade."
                  : lang === "zh"
                    ? "专为安心、专注的学习而设计。"
                    : lang === "it"
                      ? "Progettato per studiare con tranquillità."
                      : lang === "de"
                        ? "Für ruhiges und konzentriertes Lernen entwickelt."
                        : lang === "ru"
                          ? "Создано для спокойной и сосредоточенной учёбы."
                          : lang === "ja"
                            ? "落ち着いて集中して学べるように設計。"
                            : lang === "ko"
                              ? "차분하고 집중력 있는 학습을 위해 설계되었습니다."
                              : "Diseñado para estudiar con calma."}
          </span>
          <span className="footer-brand">ESTUDIAX IA</span>
        </footer>
      </section>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) M(false);
          }}
        >
          <form className="task-modal" onSubmit={save}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  {lang === "en"
                    ? "NEW TASK"
                    : lang === "fr"
                      ? "NOUVELLE TÂCHE"
                      : "NUEVA ACTIVIDAD"}
                </p>
                <h2>
                  {lang === "en"
                    ? "Add to your list"
                    : lang === "fr"
                      ? "Ajouter à votre liste"
                      : "Agregar a tu lista"}
                </h2>
              </div>
              <button type="button" className="close-btn" onClick={() => M(false)}>
                ×
              </button>
            </div>
            <label htmlFor="title">
              {lang === "en"
                ? "Task name"
                : lang === "fr"
                  ? "Nom de la tâche"
                  : "Nombre de actividad"}
            </label>
            <input
              id="title"
              autoFocus
              required
              value={title}
              onChange={(e) => T(e.target.value)}
              placeholder={
                lang === "en"
                  ? "E.g. Submit lab report"
                  : lang === "fr"
                    ? "Ex. Remettre le rapport de laboratoire"
                    : "Ej. Entregar reporte de laboratorio"
              }
            />
            <label htmlFor="subject">
              {lang === "en" ? "Subject" : lang === "fr" ? "Matière" : "Materia"}
            </label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => U(e.target.value)}
              placeholder={
                lang === "en" ? "E.g. Physics" : lang === "fr" ? "Ex. Physique" : "Ej. Física"
              }
            />
            <label htmlFor="instructions">
              {lang === "en"
                ? "Instructions / topics"
                : lang === "fr"
                  ? "Consignes / sujets"
                  : "Instrucciones / temas que entran"}
            </label>
            <textarea
              id="instructions"
              rows={3}
              value={instructions}
              onChange={(e) => IN(e.target.value)}
              placeholder={
                lang === "en"
                  ? "What to submit, exam topics, pages, materials…"
                  : lang === "fr"
                    ? "À rendre, sujets d’examen, pages, matériel…"
                    : "Qué hay que entregar, temas del parcial, páginas, materiales…"
              }
            />
            <div className="form-two">
              <div>
                <label htmlFor="due">
                  {lang === "en" ? "Date" : lang === "fr" ? "Date" : "Fecha"}
                </label>
                <input id="due" type="date" value={due} onChange={(e) => D(e.target.value)} />
              </div>
              <div>
                <label htmlFor="kind">
                  {lang === "en" ? "Type" : lang === "fr" ? "Type" : "Tipo"}
                </label>
                <select id="kind" value={kind} onChange={(e) => K(e.target.value as Task["kind"])}>
                  <option>{lang === "en" ? "Task" : lang === "fr" ? "Devoir" : "Tarea"}</option>
                  <option>{lang === "en" ? "Exam" : lang === "fr" ? "Examen" : "Parcial"}</option>
                  <option>
                    {lang === "en" ? "Study" : lang === "fr" ? "Révision" : "Estudio"}
                  </option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => M(false)}>
                {lang === "en" ? "Cancel" : lang === "fr" ? "Annuler" : "Cancelar"}
              </button>
              <button className="primary-btn">
                {lang === "en" ? "Save task" : lang === "fr" ? "Enregistrer" : "Guardar actividad"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
function TaskRow({
  t,
  toggle,
  del,
  lang = "es",
}: {
  t: Task;
  toggle: (t: Task) => void;
  del: (t: Task) => void;
  lang?: string;
}) {
  const ui: Record<string, Record<string, string>> = { it: { Tarea: "Attività", Parcial: "Esame", Estudio: "Studio", Eliminar: "Elimina" }, de: { Tarea: "Aufgabe", Parcial: "Prüfung", Estudio: "Lernen", Eliminar: "Löschen" }, ru: { Tarea: "Задание", Parcial: "Экзамен", Estudio: "Учёба", Eliminar: "Удалить" }, en: { Tarea: "Task", Parcial: "Exam", Estudio: "Study", Eliminar: "Delete" }, fr: { Tarea: "Tâche", Parcial: "Examen", Estudio: "Révision", Eliminar: "Supprimer" }, pt: { Tarea: "Tarefa", Parcial: "Prova", Estudio: "Estudo", Eliminar: "Excluir" }, zh: { Tarea: "任务", Parcial: "考试", Estudio: "学习", Eliminar: "删除" } };
  return (
    <div className={`task-row ${t.done ? "task-done" : ""}`}>
      <button className={`task-check ${t.done ? "checked" : ""}`} onClick={() => toggle(t)}>
        {t.done ? "✓" : ""}
      </button>
      <div className="task-main">
        <strong>{t.title}</strong>
        {t.instructions && <p className="task-instructions">{t.instructions}</p>}
        <div className="task-meta">
          <span>{t.subject}</span>
          <span>·</span>
          <span>{date(t.due)}</span>
        </div>
      </div>
      <span className={`kind-tag ${t.kind.toLowerCase()}`}>{ui[lang]?.[t.kind] || t.kind}</span>
      <button className="delete-task" aria-label={ui[lang]?.Eliminar || "Eliminar"} title={ui[lang]?.Eliminar || "Eliminar"} onClick={() => del(t)}>
        ×
      </button>
    </div>
  );
}
function Empty({ lang = "es" }: { lang?: string }) {
  const copy: Record<string, [string, string]> = { en: ["All caught up", "There are no tasks in this section yet."], fr: ["Tout est en ordre", "Il n’y a pas encore d’activité dans cette section."], pt: ["Tudo em ordem", "Ainda não há atividades nesta seção."], zh: ["一切就绪", "此部分暂时没有任务。"], it: ["Tutto in ordine", "Non ci sono ancora attività in questa seção."], de: ["Alles erledigt", "In diesem Bereich gibt es noch keine Aufgaben."], ru: ["Всё в порядке", "В этом разделе пока нет заданий."] };
  const [title, message] = copy[lang] || ["Todo en orden", "No hay actividades en esta sección todavía."];
  return (
    <div className="empty-state">
      <span>✓</span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
function Head({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
function Stat({
  title,
  value,
  detail,
  progress,
}: {
  title: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        {title}
        <span>◈</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
      {progress !== undefined && (
        <div className="mini-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
function PageHeading({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">TU ESPACIO</p>
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
      </div>
      {action}
    </div>
  );
}
function Setting({ title, text, action }: { title: string; text: string; action: ReactNode }) {
  return (
    <div className="setting-row">
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

function QuoteCard({ section, lang }: { section: string; lang: string }) {
  const quotes: Record<string, Record<string, { quote: string; author: string }>> = {
    home: {
      es: { quote: "Nada en la vida debe ser temido, solo comprendido.", author: "Marie Curie" },
      pt: { quote: "Nada na vida deve ser temido, apenas compreendido.", author: "Marie Curie" },
      en: {
        quote: "Nothing in life is to be feared, it is only to be understood.",
        author: "Marie Curie",
      },
      fr: {
        quote: "Rien dans la vie n’est à craindre, tout doit être compris.",
        author: "Marie Curie",
      },
      zh: { quote: "生活中没有什么值得恐惧，只有值得理解。", author: "玛丽·居里" },
    },
    tasks: {
      es: {
        quote: "Las grandes cosas se hacen reuniendo pequeñas cosas.",
        author: "Vincent van Gogh",
      },
      pt: {
        quote: "Grandes coisas são feitas de pequenas coisas reunidas.",
        author: "Vincent van Gogh",
      },
      en: {
        quote: "Great things are done by a series of small things brought together.",
        author: "Vincent van Gogh",
      },
      fr: {
        quote: "Les grandes choses sont faites d’une série de petites choses réunies.",
        author: "Vincent van Gogh",
      },
      zh: { quote: "伟大的成就来自许多小事的汇聚。", author: "文森特·梵高" },
    },
    calendar: {
      es: {
        quote: "No basta con estar ocupado; la pregunta es: ¿en qué estamos ocupados?",
        author: "Henry David Thoreau",
      },
      pt: {
        quote: "Não basta estar ocupado; a pergunta é: com o que estamos ocupados?",
        author: "Henry David Thoreau",
      },
      en: {
        quote: "It is not enough to be busy; the question is: what are we busy about?",
        author: "Henry David Thoreau",
      },
      fr: {
        quote: "Il ne suffit pas d’être occupé ; la question est : à quoi sommes-nous occupés ?",
        author: "Henry David Thoreau",
      },
      zh: { quote: "忙碌还不够，关键是我们在忙些什么。", author: "亨利·戴维·梭罗" },
    },
    tutor: {
      es: {
        quote: "No tengo ningún talento especial. Solo soy apasionadamente curioso.",
        author: "Albert Einstein",
      },
      pt: {
        quote: "Não tenho nenhum talento especial. Sou apenas apaixonadamente curioso.",
        author: "Albert Einstein",
      },
      en: {
        quote: "I have no special talent. I am only passionately curious.",
        author: "Albert Einstein",
      },
      fr: {
        quote: "Je n’ai aucun talent particulier. Je suis seulement passionnément curieux.",
        author: "Albert Einstein",
      },
      zh: { quote: "我没有特别的天赋，只是充满了强烈的好奇心。", author: "阿尔伯特·爱因斯坦" },
    },
    drive: {
      es:{quote:"La confianza se construye con transparencia y control.",author:"ESTUDIAX"}, en:{quote:"Trust grows when transparency and control go together.",author:"ESTUDIAX"}, fr:{quote:"La confiance grandit avec la transparence et le contrôle.",author:"ESTUDIAX"}, pt:{quote:"A confiança cresce com transparência e controle.",author:"ESTUDIAX"}, zh:{quote:"透明与掌控共同建立信任。",author:"ESTUDIAX"}, it:{quote:"La fiducia cresce con trasparenza e controllo.",author:"ESTUDIAX"}, de:{quote:"Vertrauen wächst durch Transparenz und Kontrolle.",author:"ESTUDIAX"}, ru:{quote:"Доверие растёт благодаря прозрачности и контролю.",author:"ESTUDIAX"}
    },
    downloads: {
      es:{quote:"El futuro depende de lo que hagas hoy.",author:"Mahatma Gandhi"}, en:{quote:"The future depends on what you do today.",author:"Mahatma Gandhi"}, fr:{quote:"L’avenir dépend de ce que vous faites aujourd’hui.",author:"Mahatma Gandhi"}, pt:{quote:"O futuro depende do que você faz hoje.",author:"Mahatma Gandhi"}, zh:{quote:"未来取决于你今天所做的事。",author:"圣雄甘地"}, it:{quote:"Il futuro dipende da ciò che fai oggi.",author:"Mahatma Gandhi"}, de:{quote:"Die Zukunft hängt davon ab, was du heute tust.",author:"Mahatma Gandhi"}, ru:{quote:"Будущее зависит от того, что ты делаешь сегодня.",author:"Махатма Ганди"}
    },
    settings: {
      es: {
        quote: "Conocerse a uno mismo es el principio de toda sabiduría.",
        author: "Aristóteles",
      },
      pt: { quote: "Conhecer a si mesmo é o começo de toda sabedoria.", author: "Aristóteles" },
      en: { quote: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
      fr: { quote: "Se connaître soi-même est le début de toute sagesse.", author: "Aristote" },
      zh: { quote: "认识自己是一切智慧的开端。", author: "亚里士多德" },
    },
  };
  const quoteFallbacks: Record<string, Record<string, { quote: string; author: string }>> = {
    it: { home: { quote: "Nulla nella vita va temuto, ma solo compreso.", author: "Marie Curie" }, tasks: { quote: "Le grandi cose nascono dall’unione di tante piccole cose.", author: "Vincent van Gogh" }, calendar: { quote: "Non basta essere occupati: la domanda è, di cosa ci occupiamo?", author: "Henry David Thoreau" }, tutor: { quote: "Non ho un talento speciale: sono solo appassionatamente curioso.", author: "Albert Einstein" }, settings: { quote: "Conoscere se stessi è l’inizio di ogni saggezza.", author: "Aristotele" } },
    de: { home: { quote: "Nichts im Leben muss gefürchtet, sondern verstanden werden.", author: "Marie Curie" }, tasks: { quote: "Große Dinge entstehen aus vielen kleinen Dingen.", author: "Vincent van Gogh" }, calendar: { quote: "Beschäftigt zu sein reicht nicht; entscheidend ist, womit wir uns beschäftigen.", author: "Henry David Thoreau" }, tutor: { quote: "Ich habe kein besonderes Talent, nur leidenschaftliche Neugier.", author: "Albert Einstein" }, settings: { quote: "Sich selbst zu erkennen ist der Anfang aller Weisheit.", author: "Aristoteles" } },
    ru: { home: { quote: "В жизни нечего бояться — нужно лишь понимать.", author: "Мария Кюри" }, tasks: { quote: "Великие дела складываются из множества маленьких.", author: "Винсент ван Гог" }, calendar: { quote: "Мало быть занятым; важно, чем именно мы заняты.", author: "Генри Дэвид Торо" }, tutor: { quote: "У меня нет особого таланта, есть лишь страстное любопытство.", author: "Альберт Эйнштейн" }, settings: { quote: "Познать себя — начало всякой мудрости.", author: "Аристотель" } }
  };
  const item = quotes[section]?.[lang] || quoteFallbacks[lang]?.[section] || quotes.home[lang] || quotes.home.en || quotes.home.es;
  return (
    <section className="quote-card">
      <span aria-hidden="true">✦</span>
      <blockquote>“{item.quote}”</blockquote>
      <small>— {item.author}</small>
    </section>
  );
}
