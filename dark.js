const darkModeToggle = document.getElementById('dark-mode-toggle');
const icon = darkModeToggle.querySelector('i') || document.createElement('i');
icon.classList.add('fas', 'fa-moon'); 
darkModeToggle.innerHTML = ''; 

darkModeToggle.appendChild(icon);

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }
});

darkModeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    document.querySelectorAll('.container, .content, .student-box, input, select, textarea')
        .forEach(el => el.classList.add('dark-mode'));
    localStorage.setItem('darkMode', 'enabled');
    icon.classList.replace('fa-moon', 'fa-sun'); 
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    document.querySelectorAll('.container, .content, .student-box, input, select, textarea')
        .forEach(el => el.classList.remove('dark-mode'));
    localStorage.setItem('darkMode', 'disabled');
    icon.classList.replace('fa-sun', 'fa-moon');
}
