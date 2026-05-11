# PDF Receipt System

Eklavya uses a dual-mode receipt system to ensure compatibility across all devices, including mobile browsers that often struggle with `window.print()`.

## 1. Browser Print (Client-Side)
- **Component**: `src/components/FeeReceipt.js`
- **Mechanism**: React Portal renders a hidden `div` at the end of the `<body>`.
- **Styling**: Uses `@media print` CSS rules to hide the application shell and show only the receipt.
- **Optimization**: To prevent blank pages on mobile, we use `visibility: hidden` instead of `display: none` for the screen view. This ensures the browser's print engine has the layout ready before the print dialog opens.

## 2. PDF Generation (Server-Side)
- **Backend View**: `FeePaymentViewSet.receipt` action in `finance/views.py`.
- **Utility**: `finance/utils.py` using `xhtml2pdf`.
- **Template**: `backend/finance/templates/finance/receipt_pdf.html`.
- **Trigger**: The "PDF" button in the frontend transaction ledger.

### Implementation Notes:
- **xhtml2pdf**: A Python library that converts HTML/CSS to PDF. It has limited CSS support (no Flexbox), so the PDF template uses traditional table-based layouts and specific `@page` rules.
- **Dependencies**: Requires `libcairo2-dev` and `build-essential` on Linux systems. These are included in the project's `Dockerfile`.
- **Font Support**: Currently uses standard Helvetica/Arial fonts for maximum compatibility.

## 3. Usage
Users can click **Print** for a quick browser-based print preview, or **PDF** to download a permanent, high-quality document directly from the server.
