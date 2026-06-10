const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : 'https://decode-labs-internship-sandy.vercel.app/api';

document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const productGrid = document.getElementById('product-grid');

    // Toggle Sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    function renderProducts(products) {
        if (products.length === 0) {
            productGrid.innerHTML = '<p>No products found.</p>';
            return;
        }
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" onclick="window.location.href='product.html?id=${product._id}'">
                <img src="${product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/250x200'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h2 class="product-name">${product.name}</h2>
                    <p class="product-price">$${product.price}</p>
                    <p class="product-seller">By ${product.sellerId.firstName} ${product.sellerId.lastName}</p>
                </div>
            </div>
        `).join('');
    }

    // Filter elements
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar button');
    const priceSort = document.getElementById('sort-price');
    const categoryCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const ratingRadios = document.querySelectorAll('.filter-group input[type="radio"]');
    const colorBtns = document.querySelectorAll('.color-btn');

    let selectedColor = '';

    function getSelectedCategories() {
        return Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value)
            .join(',');
    }

    function getSelectedRating() {
        const selected = Array.from(ratingRadios).find(r => r.checked);
        return selected ? selected.value : '';
    }

    // Color Filter Logic
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle color selection
            const color = btn.style.backgroundColor;
            if (selectedColor === color) {
                selectedColor = '';
                btn.style.outline = 'none';
            } else {
                colorBtns.forEach(b => b.style.outline = 'none');
                selectedColor = color;
                btn.style.outline = '2px solid #333';
            }
            fetchProducts();
        });
    });

    // Search and Filter Events
    searchBtn.addEventListener('click', () => fetchProducts());
    priceSort.addEventListener('change', () => fetchProducts());
    categoryCheckboxes.forEach(cb => cb.addEventListener('change', () => fetchProducts()));
    ratingRadios.forEach(r => r.addEventListener('change', () => fetchProducts()));

    // Fetch Products from API with filters
    async function fetchProducts() {
        const search = searchInput.value;
        const sort = priceSort.value;
        const category = getSelectedCategories();
        const rating = getSelectedRating();

        let url = `${API_URL}/products?search=${search}&sort=${sort}`;
        if (category) url += `&category=${category}`;
        if (selectedColor) url += `&color=${selectedColor}`;
        if (rating) url += `&minRating=${rating}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                renderProducts(data.products);
            } else {
                productGrid.innerHTML = '<p>No products found.</p>';
            }
        } catch (err) {
            console.error(err);
            productGrid.innerHTML = '<p>Error loading products. Is the server running?</p>';
        }
    }

    fetchProducts();
});
