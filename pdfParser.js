/* ==========================================================================
   TALENTMATCH - Client-Side Resume Document File Reader & Parser
   Extracts text safely from PDF, DOCX, and TXT files directly in browser
   ========================================================================== */

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

/**
 * Validates file type and size.
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `File size exceeds the 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller resume.` 
    };
  }

  const name = file.name.toLowerCase();
  const validExtensions = [".pdf", ".docx", ".txt"];
  const isSupported = validExtensions.some(ext => name.endsWith(ext));

  if (!isSupported) {
    return { 
      valid: false, 
      error: `Unsupported file format: "${file.name}". Please upload a PDF, DOCX, or TXT file.` 
    };
  }

  return { valid: true };
}

/**
 * Reads text from a File object.
 * @param {File} file 
 * @returns {Promise<string>} Extracted raw text
 */
export async function extractTextFromFile(file) {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith(".txt")) {
      return await readTxtFile(file);
    } else if (fileName.endsWith(".docx")) {
      return await readDocxFile(file);
    } else if (fileName.endsWith(".pdf")) {
      return await readPdfFile(file);
    } else {
      throw new Error("Unsupported format");
    }
  } catch (err) {
    console.warn(`Error reading file ${file.name}:`, err);
    throw new Error(`Unable to read "${file.name}". Please make sure it is a valid document and not password-protected or corrupted.`);
  }
}

/**
 * Reads plain text files
 */
function readTxtFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || "");
    reader.onerror = () => reject(new Error("Failed to read TXT file content."));
    reader.readAsText(file);
  });
}

/**
 * Reads DOCX files using mammoth.js
 */
async function readDocxFile(file) {
  if (typeof window.mammoth !== "undefined") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value || "";
  } else {
    // Fallback if mammoth library isn't loaded
    return await readTxtFile(file);
  }
}

/**
 * Reads PDF files using PDF.js
 */
async function readPdfFile(file) {
  if (typeof window.pdfjsLib !== "undefined") {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      fullText += pageStrings.join(" ") + "\n";
    }

    if (!fullText.trim()) {
      throw new Error("PDF contains no extractable text. It may be a scanned image or empty.");
    }

    return fullText;
  } else {
    // Fallback: read as raw text buffer search
    const text = await readTxtFile(file);
    return text.replace(/[^\x20-\x7E\n\r\t]/g, " ");
  }
}
