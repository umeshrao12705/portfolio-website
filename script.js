<!-- Add this to your form.html or view.html -->
<script type="module">
  import {
    initializeApp
  } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
  import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc
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
  const studentRef = collection(db, "students");

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("userForm");

    if (form) {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get("id");

      if (editId) loadStudentForEdit(editId);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const photoInput = document.getElementById('profilePhoto');
        let photoData = "";

        const reader = new FileReader();
        reader.onload = async () => {
          photoData = reader.result;
          await saveStudent(photoData, editId);
        };

        if (photoInput.files.length > 0) {
          reader.readAsDataURL(photoInput.files[0]);
        } else {
          photoData = document.getElementById('previewPhoto')?.src || '';
          await saveStudent(photoData, editId);
        }
      });
    }

    if (document.getElementById("details")) {
      fetchAndDisplayStudents();
    }
  });

  async function saveStudent(photoData, id = null) {
    const experienceFields = document.getElementsByName("experience[]");
    const experiences = Array.from(experienceFields).map(e => e.value.trim()).filter(e => e !== '');

    const eduTypes = document.getElementsByName("eduType[]");
    const eduCourses = document.getElementsByName("eduCourse[]");
    const eduInstitutes = document.getElementsByName("eduInstitute[]");
    const eduMarks = document.getElementsByName("eduMarks[]");
    const eduYears = document.getElementsByName("eduYear[]");

    const education = Array.from(eduTypes).map((_, i) => ({
      type: eduTypes[i].value.trim(),
      course: eduCourses[i].value.trim(),
      institute: eduInstitutes[i].value.trim(),
      marks: eduMarks[i].value.trim(),
      year: eduYears[i].value.trim()
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
      education,
      workExp: experiences,
      skills: getVal('skills'),
      password: getVal('password'),
      photo: photoData
    };

    try {
      if (id) {
        const docRef = doc(db, "students", id);
        await updateDoc(docRef, student);
        alert("Student updated successfully!");
      } else {
        await addDoc(studentRef, student);
        alert("Student saved successfully!");
      }
      window.location.href = "view.html";
    } catch (err) {
      console.error("Error saving student:", err);
    }
  }

  async function fetchAndDisplayStudents() {
    const container = document.getElementById('details');
    container.innerHTML = "Loading...";

    const snapshot = await getDocs(studentRef);
    const students = [];
    snapshot.forEach(doc => students.push({ id: doc.id, ...doc.data() }));

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
        ${data.education?.length ? `
          <p><strong>Higher Education:</strong></p>
          <ul>${data.education.map(edu => `
            <li>${edu.type}: ${edu.course} at ${edu.institute} (${edu.year}) - ${edu.marks}</li>
          `).join('')}</ul>` : ''}
        ${data.workExp?.length ? `
          <p><strong>Work Experience:</strong></p>
          <ul>${data.workExp.map(exp => `<li>${exp}</li>`).join('')}</ul>` : ''}
        ${data.skills ? `<p><strong>Skills:</strong> ${data.skills}</p>` : ''}

        <button onclick="editDetails('${data.id}', '${data.password}')">Edit</button>
        <button onclick="deleteDetails('${data.id}', '${data.password}')">Delete</button>
        <button id="download-pdf" style="margin: 20px;">Download PDF</button>
      `;
      container.appendChild(card);
    });
  }

  async function loadStudentForEdit(id) {
    const docRef = doc(db, "students", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const student = docSnap.data();
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

    if (student.photo) {
      const preview = document.getElementById('previewPhoto');
      preview.src = student.photo;
      preview.style.display = 'block';
    }

    // Load experience
    const list = document.getElementById('experienceList');
    list.innerHTML = '';
    student.workExp?.forEach(exp => {
      const textarea = document.createElement('textarea');
      textarea.name = "experience[]";
      textarea.value = exp;
      list.appendChild(textarea);
    });

    // Load education
    const eduContainer = document.getElementById('educationList');
    eduContainer.innerHTML = '';
    student.education?.forEach(edu => {
      addEducation(edu.type, edu.course, edu.institute, edu.marks, edu.year);
    });
  }

  window.editDetails = function (id, realPassword) {
    const pwd = prompt("Enter password to edit:");
    if (pwd === realPassword) {
      window.location.href = `form.html?id=${id}`;
    } else {
      alert("Incorrect password!");
    }
  };

  window.deleteDetails = async function (id, realPassword) {
    const pwd = prompt("Enter password to delete:");
    if (pwd === realPassword) {
      await deleteDoc(doc(db, "students", id));
      alert("Student deleted!");
      fetchAndDisplayStudents();
    } else {
      alert("Incorrect password!");
    }
  };

  function getVal(id) {
    return document.getElementById(id)?.value.trim() || '';
  }
</script>
