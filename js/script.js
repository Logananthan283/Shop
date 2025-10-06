document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  setupProceedButton();
});

const productCounts = {};

function fetchProducts() {
  fetch('data/products.json')
    .then(res => res.json())
    .then(categories => displayProducts(categories))
    .catch(err => console.error('Error loading products:', err));
}

function displayProducts(categories) {
  const container = document.getElementById('productsContainer');
  container.innerHTML = ''; // Clear products only

  categories.forEach(category => {
    const section = document.createElement('div');
    section.classList.add('category');

    section.innerHTML = `
      <button class="dropdown-btn">${category.category}</button>
      <div class="category-content"></div>
    `;

    const content = section.querySelector('.category-content');

    category.products.forEach(prod => {
      const item = document.createElement('div');
      item.classList.add('product-item');
      item.setAttribute('data-name', prod.name);
      item.setAttribute('data-price', prod.price);

      item.innerHTML = `
        <img src="${prod.image}" alt="${prod.name}" />
        <div class="product-name">${prod.name}</div>
        <div class="product-price">₹${prod.price}</div>
        <button class="add-btn" onclick="showQtyBox(this)">Add</button>
        <div class="qty-control" style="display:none;">
          <button onclick="decrementCount(this)">-</button>
          <span class="qty-display">1</span>
          <button onclick="incrementCount(this)">+</button>
        </div>
      `;
      content.appendChild(item);
    });

    container.appendChild(section);
  });

  document.querySelectorAll('.dropdown-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      btn.nextElementSibling.classList.toggle('show');
    });
  });
}

// Add, Increment, Decrement and Total Count
function showQtyBox(button) {
  const productItem = button.closest('.product-item');
  const qtyBox = productItem.querySelector('.qty-control');
  const productName = productItem.getAttribute('data-name');

  if (qtyBox.style.display === 'none') {
    qtyBox.style.display = 'flex';
    if (!productCounts[productName]) {
      productCounts[productName] = 1;
      updateQtyDisplay(qtyBox, 1);
    }
  }
  updateTotalCount();
}

function updateQtyDisplay(qtyBox, count) {
  qtyBox.querySelector('.qty-display').textContent = count;
}

function incrementCount(btn) {
  const qtyBox = btn.closest('.qty-control');
  let count = parseInt(qtyBox.querySelector('.qty-display').textContent);
  count++;
  updateQtyDisplay(qtyBox, count);

  const productItem = btn.closest('.product-item');
  const productName = productItem.getAttribute('data-name');
  productCounts[productName] = count;

  updateTotalCount();
}

function decrementCount(btn) {
  const qtyBox = btn.closest('.qty-control');
  let count = parseInt(qtyBox.querySelector('.qty-display').textContent);

  const productItem = btn.closest('.product-item');
  const productName = productItem.getAttribute('data-name');

  if (count > 1) {
    count--;
    updateQtyDisplay(qtyBox, count);
    productCounts[productName] = count;
  } else {
    qtyBox.style.display = 'none';
    delete productCounts[productName];
  }

  updateTotalCount();
}

function updateTotalCount() {
  const total = Object.values(productCounts).reduce((a, b) => a + b, 0);
  const totalCountElem = document.getElementById('totalCount');
  totalCountElem.textContent = total;

  const productsData = [];
  document.querySelectorAll('.product-item').forEach(item => {
    const name = item.getAttribute('data-name');
    const price = parseFloat(item.getAttribute('data-price'));
    if (productCounts[name]) {
      productsData.push({ name, price, qty: productCounts[name] });
    }
  });

  localStorage.setItem('selectedProducts', JSON.stringify(productsData));
}

function setupProceedButton() {
  const proceedBtn = document.querySelector('.btn.proceed-btn');
  proceedBtn.addEventListener('click', (e) => {
    const total = Object.values(productCounts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      e.preventDefault();
      alert('⚠️ Please select at least one product before proceeding.');
      return false;
    }
  });
}
  document.getElementById('proceedBtn').addEventListener('click', function (e) {
    const totalCount = parseInt(document.getElementById('totalCount').innerText);
    
    if (totalCount === 0) {
      e.preventDefault(); // Stop navigation
      
      // Custom popup
      const popup = document.createElement('div');
      popup.innerText = "Please add at least one product before proceeding!";
      popup.style.position = 'fixed';
      popup.style.top = '50%';
      popup.style.left = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
      popup.style.background = '#ff4081';
      popup.style.color = '#fff';
      popup.style.padding = '20px 30px';
      popup.style.fontSize = '1.1rem';
      popup.style.fontWeight = '600';
      popup.style.borderRadius = '12px';
      popup.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
      popup.style.zIndex = '1000';
      popup.style.textAlign = 'center';
      document.body.appendChild(popup);

      // Auto remove popup after 2 seconds
      setTimeout(() => {
        popup.remove();
      }, 2000);
    }
  });