# CV Files

Place your CV/Resume PDF files in this directory with the following names:

- `Liron_Himbert_CV_EN.pdf` - English version
- `Liron_Himbert_CV_FR.pdf` - French version
- `Liron_Himbert_CV_HE.pdf` - Hebrew version

The CV page at `/cv` will automatically display and allow downloads of these files.

## File Requirements

- **Format**: PDF
- **Naming**: Must match the filenames specified in `data/cv.json`
- **Size**: Keep files under 5MB for optimal loading performance
- **Content**: Ensure PDFs are not password-protected

## Updating Your CV

1. Replace the PDF file(s) in this directory
2. Update the `lastUpdated` date in `data/cv.json` for the corresponding language
3. The changes will be reflected immediately on the CV page
