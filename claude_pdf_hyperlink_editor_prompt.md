# Claude Prompt: PDF Hyperlink Editor Web Application

## Project Name
PDF Hyperlink Editor

## Goal
Create a complete web application that allows users to upload a PDF, preview it, draw clickable link areas over text/icons, assign hyperlink actions such as website, email, phone call, or custom URL, and export the final PDF without changing the original design.

## Main User Flow
1. User uploads a PDF file.
2. The PDF is rendered page by page in the browser.
3. User selects a page.
4. User draws a rectangle over any text, icon, button, footer item, phone number, email, or website.
5. A popup opens to assign a hyperlink.
6. User chooses link type:
   - Website
   - Email
   - Phone Call
   - Custom URL
7. App automatically formats the link.
8. User can edit/delete created link areas.
9. User exports/downloads the final PDF with clickable hyperlinks.

## Required Hyperlink Formats
Website:
```text
https://www.example.com
```

Email:
```text
mailto:info@example.com
```

Phone:
```text
tel:+971545699163
```

Custom:
```text
https://custom-url.com
```

## Technology Stack
Use the following stack:

### Frontend
- React.js
- Vite
- TypeScript
- Tailwind CSS
- pdfjs-dist for PDF preview
- react-konva or canvas for drawing clickable rectangles

### Backend
- Node.js
- Express.js
- Multer for PDF upload
- pdf-lib for adding clickable PDF link annotations

### Storage
- Local temporary upload folder
- Clean uploaded/exported files after processing

## Frontend Requirements

### Pages
Create one main page with:

1. Header
   - App name: PDF Hyperlink Editor
   - Upload button
   - Export PDF button

2. Upload Area
   - Drag and drop PDF
   - Browse file button
   - Show uploaded file name

3. PDF Viewer
   - Render PDF pages clearly
   - Page navigation
   - Zoom in/out
   - Fit to screen option

4. Drawing Layer
   - User can draw rectangle over PDF area
   - Rectangle should be visible with border
   - User can move/resize rectangle
   - Rectangle should store:
     - Page number
     - X position
     - Y position
     - Width
     - Height
     - Link type
     - URL

5. Link Popup Modal
   Fields:
   - Link Type dropdown: Website, Email, Phone, Custom
   - Link URL input
   - Label / note input
   - Save button
   - Cancel button

6. Side Panel
   Show all created links:
   - Page number
   - Link type
   - URL
   - Edit button
   - Delete button

## Auto Formatting Logic

When user selects Website:
- If input does not start with `http://` or `https://`, add `https://`

Example:
```text
www.fbaihub.com
```
Convert to:
```text
https://www.fbaihub.com
```

When user selects Email:
- If input does not start with `mailto:`, add `mailto:`

Example:
```text
info@fbaihub.com
```
Convert to:
```text
mailto:info@fbaihub.com
```

When user selects Phone:
- Remove spaces, brackets, and hyphens
- If input does not start with `tel:`, add `tel:`

Example:
```text
+971 54 569 9163
```
Convert to:
```text
tel:+971545699163
```

When user selects Custom:
- Use the exact URL entered by user.

## Backend Requirements

Create API endpoints:

### 1. Upload PDF
```http
POST /api/upload
```

Accept PDF file using Multer.

Return:
```json
{
  "success": true,
  "fileId": "uploaded-file-id",
  "fileUrl": "/uploads/file.pdf"
}
```

### 2. Export PDF with Links
```http
POST /api/export
```

Request body:
```json
{
  "fileId": "uploaded-file-id",
  "links": [
    {
      "page": 1,
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 40,
      "url": "https://www.fbaihub.com",
      "type": "website"
    },
    {
      "page": 1,
      "x": 100,
      "y": 260,
      "width": 150,
      "height": 40,
      "url": "mailto:info@fbaihub.com",
      "type": "email"
    },
    {
      "page": 1,
      "x": 100,
      "y": 320,
      "width": 150,
      "height": 40,
      "url": "tel:+971545699163",
      "type": "phone"
    }
  ]
}
```

Return the final downloadable PDF.

## Important PDF Coordinate Rules
PDF viewer coordinates and real PDF coordinates are different.

Implement proper coordinate conversion:
- Browser canvas origin is top-left.
- PDF coordinate origin is bottom-left.
- Convert Y position before writing annotation to PDF.
- Use page width and height from pdf-lib.
- Maintain scale ratio between rendered page and original PDF size.

Formula example:
```ts
const pdfX = rect.x / scale;
const pdfY = pageHeight - ((rect.y + rect.height) / scale);
const pdfWidth = rect.width / scale;
const pdfHeight = rect.height / scale;
```

## PDF Link Annotation Requirement
Use `pdf-lib` to add link annotations.

Each rectangle should become a clickable area in the exported PDF.

The PDF visual design must remain unchanged.

No visible box should appear in final PDF unless user enables “show border”.

## UI Design Style
Create a clean professional interface:

- White and blue theme
- Modern SaaS dashboard style
- Left side PDF preview
- Right side link manager panel
- Rounded cards
- Smooth shadows
- Clear buttons
- Responsive layout

## Example Footer Links
Use these examples for testing:

Website:
```text
www.fbaihub.com
```
Final link:
```text
https://www.fbaihub.com
```

Email:
```text
info@fbaihub.com
```
Final link:
```text
mailto:info@fbaihub.com
```

Phone:
```text
+971 54 569 9163
```
Final link:
```text
tel:+971545699163
```

## Required Features
- Upload PDF
- Preview PDF
- Draw clickable rectangle
- Add website/email/phone/custom links
- Auto-format hyperlinks
- Edit/delete link zones
- Export final PDF
- Preserve original PDF design
- Support multiple pages
- Support multiple links per page
- Responsive UI
- Error handling
- Loading states

## Extra Features
Add these if possible:

1. OCR/Text Detection Helper
   - Detect emails, phone numbers, and websites from PDF preview.
   - Suggest clickable areas automatically.

2. Undo/Redo
   - Allow user to undo/redo rectangle actions.

3. Border Preview Toggle
   - Show link borders in editor only.
   - Keep exported PDF clean.

4. Save Project JSON
   - Export link mapping as JSON.
   - Import later to continue editing.

5. Link Test Button
   - Open the final hyperlink in a new tab before export.

## Folder Structure
Create this structure:

```text
pdf-hyperlink-editor/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PdfUploader.tsx
│   │   │   ├── PdfViewer.tsx
│   │   │   ├── DrawingLayer.tsx
│   │   │   ├── LinkModal.tsx
│   │   │   ├── LinkPanel.tsx
│   │   │   └── Toolbar.tsx
│   │   ├── utils/
│   │   │   ├── formatLink.ts
│   │   │   ├── coordinateMapper.ts
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── link.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── upload.ts
│   │   │   └── export.ts
│   │   ├── services/
│   │   │   └── pdfLinkService.ts
│   │   ├── uploads/
│   │   ├── exports/
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
├── README.md
└── .env.example
```

## Deliverables
Generate the complete working project with:

1. Frontend React app
2. Backend Express API
3. PDF upload function
4. PDF preview function
5. Rectangle drawing function
6. Link management function
7. PDF export with clickable hyperlinks
8. Clean UI
9. README with setup instructions
10. Sample test data instructions

## README Must Include

### Install
```bash
cd server
npm install

cd ../client
npm install
```

### Run Backend
```bash
cd server
npm run dev
```

### Run Frontend
```bash
cd client
npm run dev
```

### Build
```bash
cd client
npm run build
```

## Notes
- Do not change PDF design.
- Do not flatten PDF.
- Do not convert PDF to image.
- Only add invisible clickable link annotations.
- Make the final exported PDF compatible with Adobe Acrobat, Chrome PDF Viewer, Preview, and mobile PDF viewers.
- Write clean, reusable, production-ready code.
