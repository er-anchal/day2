import fs from "fs";
import path from "path";
import { convert } from "pdf-poppler";

/**
 * Generate PDF thumbnail (first page only) using Poppler.
 * @param {string} pdfPath Path to PDF file
 * @param {string} outputPath Path to save thumbnail PNG
 * @param {number} targetWidth Width of the thumbnail
 */
export async function generatePdfThumbnail(
  pdfPath,
  outputPath,
  targetWidth = 600,
) {
  try {
    if (!fs.existsSync(pdfPath)) throw new Error("PDF not found: " + pdfPath);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // Poppler options
    const opts = {
      format: "png",
      out_dir: outputDir,
      out_prefix: path.basename(outputPath, ".png"),
      page: 1, // first page only
    };

    await convert(pdfPath, opts);

    // The generated file might be like: "output-1.png"
    const generatedFile = path.join(
      outputDir,
      `${path.basename(outputPath, ".png")}-1.png`,
    );

    // Rename/move to desired outputPath
    fs.renameSync(generatedFile, outputPath);

    // console.log("PDF thumbnail generated:", outputPath);
    return outputPath;
  } catch (err) {
    console.error("Failed to generate PDF thumbnail:", err);
    throw err;
  }
}
