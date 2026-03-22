
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

async function createFullTenant() {
  const tenantsRef = collection(db, '_gl_tenants');
  
  const docRef = await addDoc(tenantsRef, {
    name: "Full Services Corp",
    country: "Colombia",
    planId: "plan_enterprise",
    status: "active",
    activeModules: ["mod_crm", "mod_inv", "mod_fin", "9dRWiNsBBLbd1uL3KQk3"],
    createdAt: new Date().toISOString()
  });

  console.log(`Tenant Full creado con ID: ${docRef.id}`);
}

createFullTenant();
