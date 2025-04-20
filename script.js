document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('userForm');

  if (form) {
    if (!localStorage.getItem('editId')) {
      form.reset();
      const preview = document.getElementById('previewPhoto');
      if (preview) preview.style.display = 'none';

      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input.type !== 'submit' && input.type !== 'button') {
          input.value = '';
        }
      });

      // Clear dynamic sections
      document.getElementById('experienceList').innerHTML = '';
      document.getElementById('educationList').innerHTML = '';
      addExperience();
    }

    const editId = localStorage.getItem('editId');
    if (editId) {
      const students = JSON.parse(localStorage.getItem('students')) || [];
      const student = students.find(s => s.id == editId);
      if (student) {
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
        document.getElementById('password').value = student.password;
        document.getElementById('skills').value = student.skills || '';

        // Load work experience
        const list = document.getElementById('experienceList');
        list.innerHTML = '';
        if (Array.isArray(student.workExp)) {
          student.workExp.forEach(exp => {
            const textarea = document.createElement('textarea');
            textarea.name = "experience[]";
            textarea.value = exp;
            textarea.style.marginTop = "10px";
            list.appendChild(textarea);
          });
        }

        // Load education entries
        const eduContainer = document.getElementById('educationList');
        eduContainer.innerHTML = '';
        if (Array.isArray(student.education)) {
          student.education.forEach(edu => {
            addEducation(edu.type, edu.course, edu.institute, edu.marks, edu.year);
          });
        }

        // Photo
        if (student.photo) {
          const preview = document.getElementById('previewPhoto');
          preview.src = student.photo;
          preview.style.display = 'block';
        }
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let photoData = '';
      const photoInput = document.getElementById('profilePhoto');
      const reader = new FileReader();

      reader.onload = function () {
        photoData = reader.result;
        saveStudent(photoData);
      };

      if (photoInput.files.length > 0) {
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const editId = localStorage.getItem('editId');
        const student = students.find(s => s.id == editId);
        saveStudent(student?.photo || '');
      }
    });
  }

  const container = document.getElementById('details');
  if (container) {
    displayAllStudents();
  }
});

function saveStudent(photoData) {
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
    id: localStorage.getItem('editId') || Date.now(),
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

  let students = JSON.parse(localStorage.getItem('students')) || [];
  const existingIndex = students.findIndex(s => s.id == student.id);

  if (existingIndex !== -1) {
    students[existingIndex] = student;
  } else {
    students.push(student);
  }

  localStorage.setItem('students', JSON.stringify(students));
  localStorage.removeItem('editId');

  alert('Student details saved!');
  document.getElementById('userForm').reset();

  // Reset experience list
  const list = document.getElementById('experienceList');
  list.innerHTML = '';
  addExperience();

  // Reset education list
  const eduContainer = document.getElementById('educationList');
  eduContainer.innerHTML = '';

  const preview = document.getElementById('previewPhoto');
  if (preview) preview.style.display = 'none';
}

function displayAllStudents(filtered = null) {
  const container = document.getElementById('details');
  const students = JSON.parse(localStorage.getItem('students')) || [];
  const list = filtered || students;

  if (list.length === 0) {
    container.innerHTML = '<p>No student records found.</p>';
    return;
  }

  container.innerHTML = '';
  list.forEach((data, index) => {
    const card = document.createElement('div');
    card.classList.add('student-box');
    card.innerHTML = `
      <hr>
      <p><strong>${index + 1}. ${data.firstName} ${data.lastName}</strong></p>
      ${data.photo ? `<img src="${data.photo}" alt="Profile Photo" style="max-width:100px;"><br>` : ''}
      <p><strong>Gender:</strong> ${data.gender}</p>
      <p><strong>Age:</strong> ${data.age}</p>
      <p><strong>Address:</strong> ${data.address}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Class 10th:</strong> ${data.class10Marks} from ${data.class10School}</p>
      <p><strong>Class 12th:</strong> ${data.class12Marks} from ${data.class12School}</p>

      ${Array.isArray(data.education) && data.education.length > 0 ? `
        <p><strong>Higher Education:</strong></p>
        <ul>
          ${data.education.map(edu => `
            <li>
              <strong>${edu.type}:</strong> ${edu.course} at ${edu.institute} (${edu.year}) - Marks: ${edu.marks}
            </li>
          `).join('')}
        </ul>
      ` : ''}

      ${Array.isArray(data.workExp) && data.workExp.length > 0 ? `
        <p><strong>Work Experience:</strong></p>
        <ul>${data.workExp.map(exp => `<li>${exp}</li>`).join('')}</ul>` : ''}

      ${data.skills ? `<p><strong>Skills:</strong> ${data.skills.split(',').map(s => s.trim()).join(', ')}</p>` : ''}

      <button onclick="editDetails(${data.id})">Edit</button>
      <button onclick="deleteDetails(${data.id})">Delete</button>
      <button id="download-pdf" style="margin: 20px;">Download PDF</button>
    `;
    container.appendChild(card);
  });
}

function promptSearch() {
  const query = prompt("Enter first or last name to search:")?.toLowerCase().trim();
  if (!query) return;

  const students = JSON.parse(localStorage.getItem('students')) || [];
  const filtered = students.filter(
    s => s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query)
  );

  displayAllStudents(filtered);
}

function editDetails(id) {
  const students = JSON.parse(localStorage.getItem('students')) || [];
  const student = students.find(s => s.id === id);
  const pwd = prompt('Enter password to edit:');
  if (pwd === student.password) {
    localStorage.setItem('editId', id);
    window.location.href = 'form.html';
  } else {
    alert('Incorrect password!');
  }
}

function deleteDetails(id) {
  const students = JSON.parse(localStorage.getItem('students')) || [];
  const student = students.find(s => s.id === id);
  const pwd = prompt('Enter password to delete:');
  if (pwd === student.password) {
    const updated = students.filter(s => s.id !== id);
    localStorage.setItem('students', JSON.stringify(updated));
    alert('Student deleted.');
    displayAllStudents();
  } else {
    alert('Incorrect password!');
  }
}

function getVal(id) {
  return document.getElementById(id)?.value.trim() || '';
}
