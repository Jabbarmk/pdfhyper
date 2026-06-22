# PDF Hyperlink Editor

A web application to upload a PDF, draw clickable link areas, and export the final PDF with invisible hyperlink annotations — without changing the original design.

## Features

- Upload PDF via drag-and-drop or file browse
- Render PDF pages in the browser with zoom and page navigation
- Draw rectangles over any PDF area to define a clickable zone
- Assign links: **Website**, **Email**, **Phone**, or **Custom URL**
- Auto-format links (adds `https://`, `mailto:`, `tel:` automatically)
- Edit and delete link zones
- Right-side panel listing all links with Test / Edit / Delete actions
- Export final PDF with invisible clickable annotations
- Compatible with Adobe Acrobat, Chrome PDF Viewer, Preview, and mobile PDF viewers

## Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| PDF View | pdfjs-dist                        |
| Drawing  | react-konva / Konva.js            |
| Backend  | Node.js, Express, Multer          |
| PDF Edit | pdf-lib                           |

## Setup

### 1. Install backend

```bash
cd server
npm install
```

### 2. Install frontend

```bash
cd client
npm install
```

The `postinstall` script automatically copies the pdfjs worker file to `public/`.

If it fails, copy manually:

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

## Run

### Start backend (port 3001)

```bash
cd server
npm run dev
```

### Start frontend (port 5173)

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build frontend

```bash
cd client
npm run build
```

## Usage

1. Upload a PDF file
2. Select a page using the toolbar navigation
3. **Draw a rectangle** over any text, icon, or area you want to make clickable
4. In the popup, choose the link type and enter the URL/email/phone
5. Repeat for all areas you want to link
6. Click **Export PDF** to download the final file with invisible clickable annotations

## Coordinate system

- Rectangles are stored internally in PDF points (scale=1, Y from top of page)
- On export, Y is flipped to PDF coordinate origin (bottom-left)
- The original PDF visual design is never modified

## API Endpoints

| Method | Path         | Description          |
|--------|--------------|----------------------|
| POST   | /api/upload  | Upload a PDF file    |
| POST   | /api/export  | Export PDF with links |
| GET    | /health      | Server health check  |
