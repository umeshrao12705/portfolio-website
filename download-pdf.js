(function loadJsPDF() {
  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = setupDownloadListener;
  document.head.appendChild(script);
})();

function setupDownloadListener() {
  document.addEventListener('click', async function (e) {
    if (e.target && e.target.id === 'download-pdf') {
      const studentBox = e.target.closest('.student-box');
      if (!studentBox) return;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;

      const addText = (label, value) => {
        if (value) {
          if (y > 270) {
            doc.addPage();
            y = 10;
          }
          doc.text(`${label}: ${value}`, 10, y);
          y += 10;
        }
      };

      const getTextAfterColon = (selector) => {
        const el = studentBox.querySelector(selector);
        return el ? el.textContent.split(':').slice(1).join(':').trim() : '';
      };

      let rawName = studentBox.querySelector('p strong')?.textContent || 'Student';
      const name = rawName.replace(/^\d+\.\s*/, ''); // removes "1. ", "2. ", etc.
      const gender = getTextAfterColon("p:nth-of-type(2)");
      const age = getTextAfterColon("p:nth-of-type(3)");
      const address = getTextAfterColon("p:nth-of-type(4)");
      const phone = getTextAfterColon("p:nth-of-type(5)");
      const email = getTextAfterColon("p:nth-of-type(6)");
      const class10 = getTextAfterColon("p:nth-of-type(7)");
      const class12 = getTextAfterColon("p:nth-of-type(8)");

      // Header
      doc.setFontSize(14);
      doc.text("Student Portfolio", 80, y);
      y += 12;
      doc.setFontSize(11);

      // Personal Info
      addText("Name", name);
      addText("Gender", gender);
      addText("Age", age);
      addText("Address", address);
      addText("Phone", phone);
      addText("Email", email);
      addText("Class 10th", class10);
      addText("Class 12th", class12);

      // Higher Education
      const eduList = studentBox.querySelectorAll('ul:nth-of-type(1) li');
      if (eduList.length > 0) {
        doc.text("Higher Education:", 10, y);
        y += 8;
        eduList.forEach(li => {
          doc.text(`• ${li.textContent.trim()}`, 15, y);
          y += 8;
          if (y > 270) {
            doc.addPage();
            y = 10;
          }
        });
      }

      // Work Experience
      const expLists = studentBox.querySelectorAll('p strong');
      const hasWorkExp = Array.from(expLists).some(el => el.textContent.includes("Work Experience"));
      const expUl = studentBox.querySelectorAll('ul')[1];
      if (hasWorkExp && expUl) {
        const workExps = expUl.querySelectorAll('li');
        if (workExps.length > 0) {
          doc.text("Work Experience:", 10, y);
          y += 8;
          workExps.forEach(li => {
            doc.text(`• ${li.textContent.trim()}`, 15, y);
            y += 8;
            if (y > 270) {
              doc.addPage();
              y = 10;
            }
          });
        }
      }

      // Skills
      const allP = studentBox.querySelectorAll('p');
      const lastP = allP[allP.length - 1];
      if (lastP?.textContent.includes("Skills")) {
        const skills = getTextAfterColon(`p:last-of-type`);
        doc.text("Skills:", 10, y);
        y += 8;
        doc.text(skills, 15, y);
        y += 10;
      }

      // Profile photo
      const img = studentBox.querySelector('img');
      if (img?.src) {
        try {
          const imgProps = await loadImage(img.src);
          doc.addImage(imgProps, 'JPEG', 150, 10, 40, 40);
        } catch (error) {
          console.error("Image load error:", error);
        }
      }

      doc.save(`${name}.pdf`);
    }
  });
}

// Helper: convert image to base64 for PDF
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = src;
  });
}
