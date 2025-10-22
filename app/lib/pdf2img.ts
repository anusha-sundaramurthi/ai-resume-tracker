export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Set the worker source to use local file
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    // Create canvas for combined image
    const scale = 4;
    const canvases: HTMLCanvasElement[] = [];

    // Render all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
      }

      await page.render({ canvasContext: context!, viewport }).promise;
      canvases.push(canvas);
    }

    // Combine all pages into one tall canvas
    const finalCanvas = document.createElement("canvas");
    const finalContext = finalCanvas.getContext("2d");

    const width = canvases[0].width;
    const totalHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0);

    finalCanvas.width = width;
    finalCanvas.height = totalHeight;

    if (finalContext) {
      let yOffset = 0;
      for (const canvas of canvases) {
        finalContext.drawImage(canvas, 0, yOffset);
        yOffset += canvas.height;
      }
    }

    return new Promise((resolve) => {
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}

export async function convertFileToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Handle image files (JPG, PNG, JPEG)
    if (fileType.startsWith('image/')) {
      return convertImageToImage(file);
    }

    // Handle text files (TXT)
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return convertTextToImage(file);
    }

    // Handle DOCX files
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || fileName.endsWith('.docx')) {
      return convertDocxToImage(file);
    }

    return {
      imageUrl: "",
      file: null,
      error: `Unsupported file format: ${file.type}`,
    };
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert file: ${err}`,
    };
  }
}

async function convertImageToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const img = new Image();
    const blob = await file.arrayBuffer();

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0);
        }

        canvas.toBlob(
          (canvasBlob) => {
            if (canvasBlob) {
              const originalName = file.name.split('.')[0];
              const imageFile = new File([canvasBlob], `${originalName}.png`, {
                type: "image/png",
              });

              resolve({
                imageUrl: URL.createObjectURL(canvasBlob),
                file: imageFile,
              });
            } else {
              resolve({
                imageUrl: "",
                file: null,
                error: "Failed to create image blob",
              });
            }
          },
          "image/png",
          1.0
        );
      };

      img.onerror = () => {
        resolve({
          imageUrl: "",
          file: null,
          error: "Failed to load image",
        });
      };

      img.src = URL.createObjectURL(file);
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert image: ${err}`,
    };
  }
}

async function convertTextToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const text = await file.text();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 1000;
    const padding = 40;
    const lineHeight = 24;
    const fontSize = 14;

    if (ctx) {
      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text
      ctx.fillStyle = "black";
      ctx.font = `${fontSize}px Arial`;
      ctx.imageSmoothingEnabled = true;

      const lines = text.split("\n");
      let y = padding;

      for (const line of lines) {
        if (y + lineHeight > canvas.height - padding) break;

        const wrappedLines = wrapText(ctx, line, canvas.width - padding * 2);
        for (const wrappedLine of wrappedLines) {
          if (y + lineHeight > canvas.height - padding) break;
          ctx.fillText(wrappedLine, padding, y);
          y += lineHeight;
        }
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.txt$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert text: ${err}`,
    };
  }
}

async function convertDocxToImage(file: File):
  Promise<PdfConversionResult> {
  try {
    // @ts-expect-error - mammoth is a library for docx conversion
    const mammoth = await import("mammoth");

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 1000;
    const padding = 40;
    const lineHeight = 24;
    const fontSize = 14;

    if (ctx) {
      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text
      ctx.fillStyle = "black";
      ctx.font = `${fontSize}px Arial`;
      ctx.imageSmoothingEnabled = true;

      const lines = text.split("\n");
      let y = padding;

      for (const line of lines) {
        if (y + lineHeight > canvas.height - padding) break;

        const wrappedLines = wrapText(ctx, line, canvas.width - padding * 2);
        for (const wrappedLine of wrappedLines) {
          if (y + lineHeight > canvas.height - padding) break;
          ctx.fillText(wrappedLine, padding, y);
          y += lineHeight;
        }
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.docx$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert DOCX: ${err}`,
    };
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}