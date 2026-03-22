
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function listTenants() {
  const querySnapshot = await getDocs(collection(db, "_gl_tenants"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
  });
}

listTenants();
