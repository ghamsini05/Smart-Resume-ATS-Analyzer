const fs = require('fs');
const path = require('path');

async function test() {
  const filePath = path.join(__dirname, 'mock_resume.pdf');
  if (!fs.existsSync(filePath)) {
    console.error('mock_resume.pdf not found in workspace!');
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  
  // Create a Blob from the file buffer to build multipart form data
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', blob, 'mock_resume.pdf');

  console.log('Sending PDF parsing request to http://localhost:3000/api/parse-resume...');
  try {
    const res = await fetch('http://localhost:3000/api/parse-resume', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));

    if (res.status === 200 && data.text && data.text.includes('John Doe')) {
      console.log('\n✓ PDF Parsing API test passed successfully!');
    } else {
      console.error('\n✗ PDF Parsing API test failed.');
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
}

test();
