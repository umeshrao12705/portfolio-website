<!-- Firebase SDK -->
<script>
  // Firebase configuration
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
  import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCPitxR-kvot9nW2LP0D0DfSxfM_Oaiwdk",
    authDomain: "student-portfolio-12705.firebaseapp.com",
    projectId: "student-portfolio-12705",
    storageBucket: "student-portfolio-12705.firebasestorage.app",
    messagingSenderId: "1342457915",
    appId: "1:1342457915:web:46c29e843167a2a969741e"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  window.saveToFirebase = async (student) => {
    try {
      const docRef = await addDoc(collection(db, "students"), student);
      alert("Student saved to Firebase with ID: " + docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
</script>
