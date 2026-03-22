
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqf2K1KLrri0o79irHQ6pE07VUsA0rrPk",
  authDomain: "studio-1405627774-cebad.firebaseapp.com",
  projectId: "studio-1405627774-cebad",
  storageBucket: "studio-1405627774-cebad.firebasestorage.app",
  messagingSenderId: "70936170464",
  appId: "1:70936170464:web:b221ad72e4465e21e02585"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyIdentity() {
  const tenantId = '0VfaazBfTxQ72z6Mls4Y'; // ID obtenido por el subagent
  console.log(`Verificando identidades para tenant: ${tenantId}`);

  // 1. Verificando Usuario Global
  console.log("\n--- Usuarios Globales (_gl_users) ---");
  const usersSnapshot = await getDocs(collection(db, "_gl_users"));
  let adminUserId = '';
  usersSnapshot.forEach((userDoc) => {
    const data = userDoc.data();
    console.log(`${userDoc.id} => ${data.email} (${data.name}) - Status: ${data.status}`);
    if (data.email === 'admin@test.com') adminUserId = userDoc.id;
  });

  // 2. Verificando Membresía
  if (adminUserId) {
    console.log(`\n--- Membresía en el Tenant (${tenantId}/members/${adminUserId}) ---`);
    const memberRef = doc(db, 'tenants', tenantId, 'members', adminUserId);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      console.log("Membresía encontrada:", JSON.stringify(memberSnap.data()));
    } else {
      console.log("ERROR: Membresía no encontrada en el subcollection 'members'");
    }
  } else {
    console.log("ERROR: No se encontró el usuario admin@test.com en _gl_users");
  }
}

verifyIdentity();
