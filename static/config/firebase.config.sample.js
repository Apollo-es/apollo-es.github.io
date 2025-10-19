/**
 * Configuración base para enlazar Apollo-es con Firebase.
 *
 * 1. Crea un proyecto en https://console.firebase.google.com.
 * 2. Habilita Authentication (Email/Password + proveedores sociales deseados).
 * 3. Habilita Firestore Database en modo production y Storage si quieres subir covers.
 * 4. Copia las credenciales web aquí y renombra el archivo a firebase.config.js.
 * 5. No subas firebase.config.js al repositorio público: añade el archivo a .gitignore.
 */
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

export const collections = {
  /**
   * Colección para almacenar perfiles de usuarios (displayName, avatar, roles...).
   */
  users: "users",
  /**
   * Colección para registrar reportes de enlaces rotos o peticiones de la comunidad.
   */
  reports: "reports",
  /**
   * Colección para guardar búsquedas populares y afinarlas en el futuro chatbot.
   */
  searchSignals: "searchSignals",
  /**
   * Colección para listar partidas guardadas, listas de deseos, etc.
   */
  savedGames: "savedGames"
};

export const securityNotes = [
  "Restringe las reglas de Firestore para que solo el propietario pueda leer/escribir su perfil.",
  "Crea reglas específicas para la colección reports (solo escritura anónima, lectura restringida).",
  "Activa App Check para evitar abusos en los endpoints públicos.",
  "Usa funciones de Firebase (Cloud Functions) para validar reportes y enviar notificaciones si es necesario."
];
