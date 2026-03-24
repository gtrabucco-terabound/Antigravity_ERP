import * as admin from "firebase-admin";

/**
 * Singleton para el Firebase Admin SDK.
 * Se utiliza para operaciones administrativas en el lado del servidor (Next.js Server Actions / API Routes).
 * 
 * En local: Utiliza el archivo firebase-admin-sdk.json (excluido de Git).
 * En producción (Vercel): Utiliza la variable de entorno FIREBASE_SERVICE_ACCOUNT.
 */

if (!admin.apps.length) {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountVar) {
      // Configuración para Producción (Vercel)
      const serviceAccount = JSON.parse(
        serviceAccountVar.startsWith("{") 
          ? serviceAccountVar 
          : Buffer.from(serviceAccountVar, "base64").toString()
      );
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin inicializado vía Variable de Entorno");
    } else {
      // Configuración para Local
      // El archivo debe estar en la raíz del módulo (1-Backen o 4-Modulo-CRM)
      const serviceAccount = require("../../firebase-admin-sdk.json");
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin inicializado vía Archivo Local");
    }
  } catch (error) {
    console.error("Error al inicializar Firebase Admin:", error);
  }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage();
export default admin;
