// Firebase integration version of script.js with full CRUD
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentEditId = null;

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
    if (currentEditId) {
      await updateDoc(doc(db, 'students', currentEditId), student);
      alert('Student updated in Firebase!');
    } else {
      await addDoc(collection(db, 'students'), student);
      alert('Student added to Firebase!');
    }
    currentEditId = null;
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
      <button onclick="editDetails('${data.id}', '${data.password}')">Edit</button>
      <button onclick="deleteDetails('${data.id}', '${data.password}')">Delete</button>
      <button id="download-pdf" style="margin: 20px;">Download PDF</button>
    `;
    container.appendChild(card);
  });
}

async function editDetails(id, realPassword) {
  const pwd = prompt('Enter password to edit:');
  if (pwd !== realPassword) return alert('Incorrect password!');

  try {
    const docSnap = await getDoc(doc(db, 'students', id));
    if (docSnap.exists()) {
      const student = docSnap.data();
      currentEditId = id;

      document.getElementById('firstName').value = student.firstName;
      document.getElementById('lastName').value = student.lastName;
      document.getElementById('gender').value = student.gender;
      document.getElementById('age').value = student.age;
      document.getElementById('address').value = student.address;
      document.getElementById('phone').value = student.phone;
      document.getElementById('email').value = student.email;
      document.getElementById('class10Marks').value = student.class10Marks;
      document.getElementById('class10School').value = student.class10School;
      document.getElementById('class12Marks').value = student.class12Marks;
      document.getElementById('class12School').value = student.class12School;
      document.getElementById('skills').value = student.skills;
      document.getElementById('password').value = student.password;

      const eduContainer = document.getElementById('educationList');
      eduContainer.innerHTML = '';
      if (Array.isArray(student.education)) {
        student.education.forEach(edu => {
          addEducation(edu.type, edu.course, edu.institute, edu.marks, edu.year);
        });
      }

      const expList = document.getElementById('experienceList');
      expList.innerHTML = '';
      if (Array.isArray(student.workExp)) {
        student.workExp.forEach(exp => {
          const textarea = document.createElement('textarea');
          textarea.name = 'experience[]';
          textarea.value = exp;
          textarea.style.marginTop = '10px';
          expList.appendChild(textarea);
        });
      }

      if (student.photo) {
        const preview = document.getElementById('previewPhoto');
        preview.src = student.photo;
        preview.style.display = 'block';
      }

      window.scrollTo(0, 0);
    } else {
      alert('Student record not found!');
    }
  } catch (err) {
    console.error(err);
    alert('Error loading student data.');
  }
}

async function deleteDetails(id, realPassword) {
  const pwd = prompt('Enter password to delete:');
  if (pwd !== realPassword) return alert('Incorrect password!');
  try {
    await deleteDoc(doc(db, 'students', id));
    alert('Student deleted from Firebase.');
    fetchAndDisplayStudents();
  } catch (err) {
    console.error(err);
    alert('Failed to delete student.');
  }
}
