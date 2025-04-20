// Firebase integration version of script.js
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPitxR-kvot9nW2LP0D0DfSxfM_Oaiwdk",
  authDomain: "student-portfolio-12705.firebaseapp.com",
  projectId: "student-portfolio-12705",
  storageBucket: "student-portfolio-12705.firebasestorage.app",
  messagingSenderId: "1342457915",
  appId: "1:1342457915:web:46c29e843167a2a969741e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility function
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('userForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const photoInput = document.getElementById('profilePhoto');
      let photoData = '';
      if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = async function () {
          photoData = reader.result;
          await saveStudent(photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        await saveStudent(photoData);
      }
    });
  }

  if (document.getElementById('details')) fetchAndDisplayStudents();
});

function getVal(id) {
  return document.getElementById(id)?.value.trim() || '';
}

async function saveStudent(photoData) {
  const experienceFields = document.getElementsByName("experience[]");
  const experiences = Array.from(experienceFields).map(e => e.value.trim()).filter(Boolean);

  const education = Array.from(document.getElementsByName("eduType[]")).map((_, i) => ({
    type: document.getElementsByName("eduType[]")[i].value,
    course: document.getElementsByName("eduCourse[]")[i].value,
    institute: document.getElementsByName("eduInstitute[]")[i].value,
    marks: document.getElementsByName("eduMarks[]")[i].value,
    year: document.getElementsByName("eduYear[]")[i].value
  }));

  const student = {
    firstName: getVal('firstName'),
    lastName: getVal('lastName'),
    gender: getVal('gender'),
    age: getVal('age'),
    address: getVal('address'),
    phone: getVal('phone'),
    email: getVal('email'),
    class10Marks: getVal('class10Marks'),
    class10School: getVal('class10School'),
    class12Marks: getVal('class12Marks'),
    class12School: getVal('class12School'),
    education: education,
    workExp: experiences,
    skills: getVal('skills'),
    password: getVal('password'),
    photo: photoData
  };

  try {
    await addDoc(collection(db, 'students'), student);
    alert('Student saved to Firebase!');
    document.getElementById('userForm').reset();
    fetchAndDisplayStudents();
  } catch (e) {
    console.error('Error saving student:', e);
    alert('Failed to save student.');
  }
}

async function fetchAndDisplayStudents() {
  const container = document.getElementById('details');
  container.innerHTML = '<p>Loading...</p>';
  const snapshot = await getDocs(collection(db, 'students'));
  const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (students.length === 0) {
    container.innerHTML = '<p>No student records found.</p>';
    return;
  }

  container.innerHTML = '';
  students.forEach((data, index) => {
    const card = document.createElement('div');
    card.classList.add('student-box');
    card.innerHTML = `
      <hr>
      <p><strong>${index + 1}. ${data.firstName} ${data.lastName}</strong></p>
      ${data.photo ? `<img src="${data.photo}" style="max-width:100px;"><br>` : ''}
      <p><strong>Gender:</strong> ${data.gender}</p>
      <p><strong>Age:</strong> ${data.age}</p>
      <p><strong>Address:</strong> ${data.address}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Class 10th:</strong> ${data.class10Marks} from ${data.class10School}</p>
      <p><strong>Class 12th:</strong> ${data.class12Marks} from ${data.class12School}</p>
      ${data.education?.length ? `<p><strong>Higher Education:</strong></p><ul>${data.education.map(e => `<li>${e.type}: ${e.course} at ${e.institute} (${e.year}) - ${e.marks}</li>`).join('')}</ul>` : ''}
      ${data.workExp?.length ? `<p><strong>Work Experience:</strong></p><ul>${data.workExp.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
      ${data.skills ? `<p><strong>Skills:</strong> ${data.skills}</p>` : ''}
    `;
    container.appendChild(card);
  });
}
