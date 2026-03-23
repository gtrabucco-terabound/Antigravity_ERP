import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Producción en Vercel (Variables de Entorno)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Reemplaza los newlines escapados reales
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else if (fs.existsSync(serviceAccountPath)) {
      // Desarrollo Local (Archivo JSON)
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback a Default Credentials (App Hosting / Cloud Run)
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'terabound-production',
      });
    }
  } catch (initError) {
    console.warn("Fallo en la inicialización de Firebase Admin", initError);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, tenantId } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password y nombre son requeridos' },
        { status: 400 }
      );
    }

    // 1. Crear el usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Asignar Custom Claims para seguridad robusta (RBAC)
    if (tenantId && role) {
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        tenantId,
        role,
        adminAccess: role === 'admin' || role === 'ADMIN_OWNER'
      });
    }

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message: 'Usuario creado y claims asignados exitosamente.'
    });

  } catch (error: any) {
    console.error('Error al provisionar usuario en Auth:', error);
    
    // Si el correo ya existe, es un error que el Frontend debe manejar con gracia
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado en el sistema de autenticación.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al crear el usuario' },
      { status: 500 }
    );
  }
}
