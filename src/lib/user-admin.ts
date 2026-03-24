import { adminAuth, adminFirestore } from "../firebase/admin";

/**
 * Servicio administrativo para la gestión de usuarios.
 * Estas funciones SOLO se pueden ejecutar en el servidor.
 */

interface CreateUserParams {
  email: string;
  password?: string;
  displayName: string;
  tenantId: string;
  role: "ADMIN" | "USER" | "MANAGER";
}

export async function createTenantUser({
  email,
  password,
  displayName,
  tenantId,
  role
}: CreateUserParams) {
  try {
    // 1. Crear el usuario en Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email,
      password: password || Math.random().toString(36).slice(-10), // Pass temporal si no se provee
      displayName,
    });

    // 2. Asignar Custom Claims (para seguridad en Reglas de Seguridad y Middleware)
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      tenantId,
      role
    });

    // 3. Crear registro en la colección global de usuarios (_gl_users)
    await adminFirestore.collection("_gl_users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      tenantId,
      role,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 4. Vincular al usuario con el Tenant (Colección de membresías si existe)
    await adminFirestore.collection("tenants").doc(tenantId).collection("members").doc(userRecord.uid).set({
      uid: userRecord.uid,
      role,
      joinedAt: new Date().toISOString()
    });

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error("Error en createTenantUser:", error);
    throw new Error(error.message || "Error al crear el usuario administrativo");
  }
}
