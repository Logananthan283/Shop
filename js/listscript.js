document.addEventListener('DOMContentLoaded', () => {
  // Fetch selected products from localStorage
  const products = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  const tbody = document.querySelector('#orderTable tbody');
  tbody.innerHTML = ''; // Clear previous rows

  if (products.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="5" style="text-align:center; padding:16px; font-style:italic; color:#666;">No products selected</td>`;
    tbody.appendChild(emptyRow);
  } else {
    // Populate table with products
    products.forEach((prod, index) => {
      const total = prod.price * prod.qty;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${prod.name}</td>
        <td>${prod.price.toFixed(2)}</td>
        <td>${prod.qty}</td>
        <td>${total.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
});

// Handle form submission and PDF generation
document.getElementById('customerForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const products = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  if (products.length === 0) {
    alert("No products selected. Please add products before generating PDF.");
    return;
  }
  generatePDF(products);
});

// Generate PDF function
function generatePDF(products) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  let currentY = 10;

  const logo = new Image();
  logo.src = document.getElementById('logo').src;

  logo.onload = function () {
    // --- Watermark ---
    const logoWidth = 150;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.addImage(logo, 'PNG', (pageWidth - logoWidth) / 2, (pageHeight - logoHeight) / 2, logoWidth, logoHeight);
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    // --- Shop Name ---
    pdf.setFontSize(26);
    pdf.setTextColor('#4b2e83');
    pdf.setFont('helvetica', 'bolditalic');
    pdf.text('Logu Silks', pageWidth / 2, currentY + 12, { align: 'center' });
    currentY += 25;

    // --- Title ---
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Order Summary', pageWidth / 2, currentY, { align: 'center' });
    currentY += 12;

    // --- Customer & Shop details ---
    const lineHeight = 7;
    const custColWidth = 90;
    const shopColWidth = 90;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#333');
    pdf.text('Customer Details:', margin, currentY);
    pdf.text('Shop Details:', 110, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += lineHeight;

    const custDetails = [
      `Name: ${document.getElementById('custName').value}`,
      `WhatsApp: ${document.getElementById('custWhatsapp').value}`,
      `Address: ${document.getElementById('custAddress').value}`,
      `Pincode: ${document.getElementById('custPincode').value}`,
      `District: ${document.getElementById('custDistrict').value}`,
    ];

    const shopDetails = [
      'Phone: +91 6374305335',
      'Address: 1/175, Sevigounder thottam, Melkamandapatti, Omalur, Salem',
    ];

    // Render customer details with wrapping
    let custY = currentY;
    custDetails.forEach(detail => {
      const lines = pdf.splitTextToSize(detail, custColWidth);
      lines.forEach(line => {
        pdf.text(line, margin, custY);
        custY += lineHeight;
      });
    });

    // Render shop details with wrapping
    let shopY = currentY;
    shopDetails.forEach(detail => {
      const lines = pdf.splitTextToSize(detail, shopColWidth);
      lines.forEach(line => {
        pdf.text(line, 110, shopY);
        shopY += lineHeight;
      });
    });

    // Update currentY to the max height of customer or shop detail section
    currentY = Math.max(custY, shopY) + 10;

    // --- Table Header ---
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    const headers = ['S.No', 'Product Name', 'Price (Rs)', 'Qty', 'Total (Rs)'];
    const positions = [margin, 30, 110, 140, 170];
    pdf.setFillColor('#dcd1eb');
    pdf.rect(margin, currentY - 5, 190, lineHeight, 'F');
    pdf.setTextColor('#4b2e83');
    headers.forEach((header, i) => {
      pdf.text(header, positions[i], currentY);
    });
    currentY += lineHeight;

    // --- Table Body ---
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor('#333');
    let grandTotal = 0;

    products.forEach((prod, index) => {
      const total = prod.price * prod.qty;
      grandTotal += total;

      if (index % 2 === 0) {
        pdf.setFillColor('#f5f0fa');
        pdf.rect(margin, currentY - 5, 190, lineHeight, 'F');
      }

      pdf.text(String(index + 1), positions[0], currentY);
      pdf.text(prod.name, positions[1], currentY);
      pdf.text(prod.price.toFixed(2), positions[2] + 15, currentY, { align: 'right' });
      pdf.text(String(prod.qty), positions[3] + 15, currentY, { align: 'right' });
      pdf.text(total.toFixed(2), positions[4] + 15, currentY, { align: 'right' });

      currentY += lineHeight;
    });

    currentY += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 150, currentY);

    // --- Save PDF ---
    pdf.save('OrderDetails.pdf');

    // --- Redirect ---
    setTimeout(() => {
      window.location.href = 'success.html';
    }, 1000);
  };

  logo.onerror = function () {
    alert('Failed to load logo image for PDF. Please check the logo URL.');
  };
}
