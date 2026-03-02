// Global State
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('hyfun_cart')) || [];
let likedProducts = JSON.parse(localStorage.getItem('hyfun_liked')) || [];
let currentSection = 'hero';
let currentOrder = null;
let userRating = 0;
let products = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initOrderSystem();
    loadProducts();
    updateCartCount();
    checkAuthStatus();
    initAnimations();
    
    console.log('HyFun Foods Modern Ordering System Loaded!');
});

// Initialize all functionality
function initOrderSystem() {
    // Progress steps click
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.addEventListener('click', () => {
            const sections = ['hero', 'auth', 'products', 'details', 'payment', 'tracking', 'review'];
            loadSection(sections[index]);
        });
    });
    
    // Start Order Button
    document.getElementById('startOrderBtn').addEventListener('click', () => {
        loadSection('auth');
    });
    
    // Auth Tabs
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.auth-form-container').forEach(f => f.classList.remove('active'));
            document.getElementById(tab + 'FormContainer').classList.add('active');
        });
    });
    
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    // Signup Form
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });
    
    // Password Toggle
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });
    
    // Social Login
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('google')) {
                handleGoogleLogin();
            } else if (this.classList.contains('facebook')) {
                handleFacebookLogin();
            }
        });
    });
    
    // Search Products
    document.getElementById('searchProducts').addEventListener('input', debounce(function(e) {
        searchProducts(e.target.value);
    }, 300));
    
    // Filter Button
    document.getElementById('filterBtn').addEventListener('click', function() {
        document.getElementById('filterMenu').classList.toggle('active');
    });
    
    // Filter Options
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterProductsByType(filter);
            document.getElementById('filterMenu').classList.remove('active');
        });
    });
    
    // Category Chips
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });
    
    // Cart Toggle
    document.getElementById('cartToggle').addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', toggleCart);
    
    // Delivery Form
    document.getElementById('deliveryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateDeliveryForm()) {
            loadSection('payment');
        }
    });
    
    // Payment Method Selection
    document.querySelectorAll('.method-card').forEach(method => {
        method.addEventListener('click', function() {
            const methodType = this.getAttribute('data-method');
            
            document.querySelectorAll('.method-card').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.payment-form-container').forEach(f => f.classList.remove('active'));
            document.getElementById(methodType + 'PaymentForm').classList.add('active');
        });
    });
    
    // UPI App Selection
    document.querySelectorAll('.upi-app-card').forEach(app => {
        app.addEventListener('click', function() {
            document.querySelectorAll('.upi-app-card').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            const appName = this.getAttribute('data-app');
            document.getElementById('upiId').value = `user@${appName}`;
        });
    });
    
    // Process Payment
    document.getElementById('processPaymentBtn').addEventListener('click', processPayment);
    
    // Checkout Button
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length > 0) {
            loadSection('details');
            toggleCart();
        }
    });
    
    // Track Order Button
    document.getElementById('trackOrderBtn').addEventListener('click', startOrderTracking);
    
    // Print Receipt Button
    document.getElementById('printReceiptBtn').addEventListener('click', printReceipt);
    
    // Rating Stars
    document.querySelectorAll('.rating-stars-enhanced i').forEach(star => {
        star.addEventListener('click', function() {
            userRating = parseInt(this.getAttribute('data-rating'));
            updateRatingStars(userRating);
            updateRatingCircle(userRating);
            updateRatingMessage(userRating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('mouseout', () => {
            highlightStars(userRating);
        });
    });
    
    // Feedback Tags
    document.querySelectorAll('.feedback-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
            const tagText = this.textContent.trim();
            const reviewText = document.getElementById('reviewText');
            reviewText.value += (reviewText.value ? ' ' : '') + tagText;
        });
    });
    
    // Review Form
    document.getElementById('reviewForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitReview();
    });
    
    // Modal Close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Click outside modal
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('productModal')) {
            closeModal();
        }
    });
    
    // Close filter menu on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-dropdown')) {
            document.getElementById('filterMenu')?.classList.remove('active');
        }
    });
}

// Initialize animations
function initAnimations() {
    // Animate progress bar on scroll
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        document.getElementById('progressFill').style.width = scrollPercent + '%';
    });
}

// Load Products
function loadProducts() {
    products = [
        // French Fries
        { id: 1, name: "Classic French Fries", category: "french-fries", price: 199, image: "french_fries.png", desc: "Perfectly crispy golden fries", tag: "Best Seller", weight: "500g", popular: true },
        { id: 2, name: "XLF Fries", category: "french-fries", price: 249, image: "XLF Fries.png", desc: "Extra long premium fries", tag: "Premium", weight: "500g", popular: true },
        { id: 3, name: "Crinkle Cut Fries", category: "french-fries", price: 179, image: "Crinkle fries.png", desc: "Fun crinkle-cut style", tag: "Classic", weight: "500g" },
        { id: 4, name: "Skin On Fries", category: "french-fries", price: 189, image: "Skin on Fries.png", desc: "Rustic fries with skin", tag: "Natural", weight: "500g" },
        { id: 5, name: "Flavory Fries", category: "french-fries", price: 219, image: "Flavory Fries.png", desc: "Pre-seasoned delicious fries", tag: "Seasoned", weight: "500g" },
        
        // Potato Specialties
        { id: 6, name: "Potato Wedges", category: "potato-specialties", price: 229, image: "Potato Wedges.png", desc: "Thick-cut seasoned wedges", tag: "Classic", weight: "500g", popular: true },
        { id: 7, name: "Classic Wedges", category: "potato-specialties", price: 209, image: "Classic Wedges.png", desc: "Traditional potato wedges", tag: "Classic", weight: "500g" },
        { id: 8, name: "Lime 'n' Mint Wedges", category: "potato-specialties", price: 239, image: "Lime 'n' Mint Wedges.png", desc: "Zesty lime and mint flavor", tag: "Zesty", weight: "500g" },
        { id: 9, name: "Spicy Wedges", category: "potato-specialties", price: 219, image: "Spicy Wedges.png", desc: "Bold spicy kick", tag: "Spicy", weight: "500g" },
        { id: 10, name: "Hash Brown Round", category: "potato-specialties", price: 189, image: "Hash Brown Round.png", desc: "Round crispy hash browns", tag: "Breakfast", weight: "300g" },
        { id: 11, name: "Hash Brown Triangle", category: "potato-specialties", price: 199, image: "Hash Brown Triangle.png", desc: "Classic triangle hash browns", tag: "Classic", weight: "300g" },
        { id: 12, name: "Tater Shotz", category: "potato-specialties", price: 179, image: "Tater Shotz.png", desc: "Bite-sized potato nuggets", tag: "Bite-sized", weight: "400g" },
        { id: 13, name: "Potatobets", category: "potato-specialties", price: 159, image: "PotatoBets-1.png", desc: "Crunchy potato bites", tag: "New", weight: "400g" },
        { id: 14, name: "Chilli Garlic Poppers", category: "potato-specialties", price: 199, image: "Chilli Garlic Poppers.png", desc: "Spicy garlic poppers", tag: "Spicy", weight: "350g" },
        
        // Veggie Specialties
        { id: 15, name: "Jalapeño Cheesy Pops", category: "veggie-specialties", price: 259, image: "Jalapeño Cheesy Pops.png", desc: "Spicy jalapeño cheese bites", tag: "Spicy", weight: "300g", popular: true },
        { id: 16, name: "Veggie Stix", category: "veggie-specialties", price: 189, image: "Veggie Stix.png", desc: "Crispy vegetable sticks", tag: "Crunchy", weight: "400g" },
        { id: 17, name: "Cheesy Paneer Patty", category: "veggie-specialties", price: 279, image: "Cheesy Paneer Patty.png", desc: "Paneer cheese filled patty", tag: "Cheese", weight: "250g" },
        { id: 18, name: "Veg Burger Patty", category: "veggie-specialties", price: 229, image: "Veg Burger Patty.png", desc: "Perfect veg burger patty", tag: "Burger", weight: "250g" },
        { id: 19, name: "Mozzarella Cheese Stix", category: "veggie-specialties", price: 299, image: "Mozarella-Cheese-Stix.png", desc: "Breaded mozzarella sticks", tag: "Cheesy", weight: "300g" },
        
        // Indian Ethnic
        { id: 20, name: "Aloo Tikki", category: "indian-ethnic", price: 179, image: "Aloo_Tikki.png", desc: "Classic Indian potato patties", tag: "Traditional", weight: "400g", popular: true },
        { id: 21, name: "Sabudana Patty", category: "indian-ethnic", price: 199, image: "Sabudana-Patty.png", desc: "Sago potato patties", tag: "Festive", weight: "350g" },
        { id: 22, name: "Mumbai Aloo Vada", category: "indian-ethnic", price: 189, image: "Mumbai Aloo Vada.png", desc: "Mumbai-style potato vada", tag: "Street Food", weight: "400g" },
        { id: 23, name: "Hara Bhara Kebab", category: "indian-ethnic", price: 219, image: "Hara-Bhara-Kebab.png", desc: "Spinach potato kebabs", tag: "Green", weight: "350g" },
        
        // Baked Snacks
        { id: 24, name: "Margherita Pizza", category: "baked-snacks", price: 249, image: "Margherita Pizza.png", desc: "Classic pizza pockets", tag: "Pizza", weight: "400g" },
        { id: 25, name: "Veg Paradise Pizza", category: "baked-snacks", price: 269, image: "Veg Paradise Pizza.png", desc: "Mixed veg pizza pockets", tag: "Pizza", weight: "400g" },
        { id: 26, name: "Tandoori Paneer Pizza", category: "baked-snacks", price: 299, image: "Tandoori Paneer Pizza.png", desc: "Tandoori paneer pizza", tag: "Pizza", weight: "400g" },
        { id: 27, name: "Mexicano Puffets", category: "baked-snacks", price: 189, image: "Mexicano Puffets.png", desc: "Mexican seasoned puffs", tag: "Mexican", weight: "350g" },
        { id: 28, name: "Italiano Puffets", category: "baked-snacks", price: 189, image: "Italiano Puffets.png", desc: "Italian herb puffs", tag: "Italian", weight: "350g" },
        { id: 29, name: "Schezwan Puffets", category: "baked-snacks", price: 199, image: "Schezwan Puffets.png", desc: "Spicy Schezwan puffs", tag: "Spicy", weight: "350g" },
        { id: 30, name: "Apple Pie", category: "baked-snacks", price: 179, image: "Apple Pie.png", desc: "Sweet apple pastry", tag: "Dessert", weight: "300g" },
        { id: 31, name: "Mango Peach Pie", category: "baked-snacks", price: 189, image: "Mango – Peach Pie.png", desc: "Tropical fruit pie", tag: "Dessert", weight: "300g" }
    ];
    
    renderProducts(products);
}

// Render Products
function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    productsToRender.forEach(product => {
        const isLiked = likedProducts.includes(product.id);
        const isBestSeller = product.tag === "Best Seller";
        
        const card = document.createElement('div');
        card.className = 'product-card-modern';
        card.setAttribute('data-id', product.id);
        
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="./assets/image/${product.image}" alt="${product.name}">
                ${isBestSeller ? '<div class="product-badge-modern">Best Seller</div>' : ''}
                <div class="product-like-modern ${isLiked ? 'liked' : ''}" data-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </div>
            </div>
            <div class="product-info-modern">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc-modern">${product.desc}</p>
                <div class="product-meta-modern">
                    <span class="product-price-modern">₹${product.price}</span>
                    <span class="product-weight">${product.weight}</span>
                </div>
                <div class="product-actions-modern">
                    <div class="quantity-control-modern">
                        <button class="qty-btn minus" data-id="${product.id}">-</button>
                        <span class="qty-value" id="qty-${product.id}">1</span>
                        <button class="qty-btn plus" data-id="${product.id}">+</button>
                    </div>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    // Add event listeners to new elements
    addProductEventListeners();
}

// Add product event listeners
function addProductEventListeners() {
    // Like buttons
    document.querySelectorAll('.product-like-modern').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-id'));
            toggleLike(productId, this);
        });
    });
    
    // Quantity buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-id'));
            const isMinus = this.classList.contains('minus');
            updateQuantity(productId, isMinus);
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    // Product card click for modal
    document.querySelectorAll('.product-card-modern').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.product-like-modern') && 
                !e.target.closest('.qty-btn') && 
                !e.target.closest('.add-to-cart-btn')) {
                const productId = parseInt(this.getAttribute('data-id'));
                showProductModal(productId);
            }
        });
    });
}

// Filter products by category
function filterProducts(category) {
    let filtered = products;
    if (category !== 'all') {
        filtered = products.filter(p => p.category === category);
    }
    renderProducts(filtered);
}

// Filter products by type
function filterProductsByType(filter) {
    let filtered = products;
    
    switch(filter) {
        case 'popular':
            filtered = products.filter(p => p.popular);
            break;
        case 'veg':
            filtered = products.filter(p => 
                p.category === 'veggie-specialties' || p.category === 'indian-ethnic'
            );
            break;
        case 'new':
            filtered = products.filter(p => p.tag === 'New');
            break;
        case 'all':
        default:
            // Show all
            break;
    }
    
    renderProducts(filtered);
}

// Search products
function searchProducts(query) {
    if (!query.trim()) {
        renderProducts(products);
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.desc.toLowerCase().includes(searchTerm) ||
        p.tag.toLowerCase().includes(searchTerm)
    );
    
    renderProducts(filtered);
}

// Toggle like
function toggleLike(productId, button) {
    const index = likedProducts.indexOf(productId);
    
    if (index === -1) {
        likedProducts.push(productId);
        button.classList.add('liked');
        showNotification('Added to favorites!', 'success');
    } else {
        likedProducts.splice(index, 1);
        button.classList.remove('liked');
        showNotification('Removed from favorites', 'info');
    }
    
    localStorage.setItem('hyfun_liked', JSON.stringify(likedProducts));
}

// Update quantity
function updateQuantity(productId, isMinus) {
    const qtyElement = document.getElementById(`qty-${productId}`);
    let currentQty = parseInt(qtyElement.textContent);
    
    if (isMinus && currentQty > 1) {
        currentQty--;
    } else if (!isMinus) {
        currentQty++;
    }
    
    qtyElement.textContent = currentQty;
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).textContent);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            weight: product.weight
        });
    }
    
    localStorage.setItem('hyfun_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    
    showNotification(`${quantity}x ${product.name} added to cart!`, 'success');
    
    // Animate cart button
    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.classList.add('pulse');
    setTimeout(() => cartBtn.classList.remove('pulse'), 500);
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    
    // Update checkout button state
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Render cart items
function renderCartItems() {
    const cartList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const sidebarTotal = document.getElementById('sidebarTotal');
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartList.innerHTML = '';
        sidebarTotal.textContent = '₹0';
        return;
    }
    
    emptyCart.style.display = 'none';
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item-modern">
                <div class="cart-item-image">
                    <img src="./assets/image/${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
                    <div class="cart-item-controls">
                        <button class="cart-qty-btn minus" data-index="${index}">-</button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button class="cart-qty-btn plus" data-index="${index}">+</button>
                        <button class="cart-item-remove" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartList.innerHTML = itemsHTML;
    sidebarTotal.textContent = `₹${total}`;
    
    // Add cart item event listeners
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const isMinus = this.classList.contains('minus');
            updateCartQuantity(index, isMinus);
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

// Update cart quantity
function updateCartQuantity(index, isMinus) {
    if (isMinus && cart[index].quantity > 1) {
        cart[index].quantity--;
    } else if (!isMinus) {
        cart[index].quantity++;
    }
    
    localStorage.setItem('hyfun_cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

// Remove from cart
function removeFromCart(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    
    localStorage.setItem('hyfun_cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
    
    showNotification(`${itemName} removed from cart`, 'info');
}

// Toggle cart sidebar
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}

// Show product modal
function showProductModal(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('productModal');
    const content = document.getElementById('modalProductContent');
    
    const isLiked = likedProducts.includes(productId);
    
    content.innerHTML = `
        <div class="product-modal-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 30px;">
            <div style="border-radius: 16px; overflow: hidden;">
                <img src="./assets/image/${product.image}" alt="${product.name}" style="width: 100%; height: auto;">
            </div>
            <div>
                <h2 style="font-size: 2rem; margin-bottom: 15px;">${product.name}</h2>
                <div style="font-size: 2rem; color: var(--green); font-weight: 700; margin-bottom: 20px;">₹${product.price}</div>
                <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 25px;">${product.desc}</p>
                
                <div style="background: var(--bg-main); padding: 20px; border-radius: 16px; margin-bottom: 25px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                        <i class="fas fa-weight" style="color: var(--green);"></i>
                        <span>Weight: ${product.weight}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                        <i class="fas fa-clock" style="color: var(--green);"></i>
                        <span>Prep Time: 3-5 minutes</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-leaf" style="color: var(--green);"></i>
                        <span>100% Vegetarian</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div class="quantity-control-modern" style="background: var(--bg-main);">
                        <button class="qty-btn minus" data-modal-id="${productId}" style="background: white;">-</button>
                        <span class="qty-value" id="modal-qty-${productId}">1</span>
                        <button class="qty-btn plus" data-modal-id="${productId}" style="background: white;">+</button>
                    </div>
                    <button class="add-to-cart-btn" data-modal-id="${productId}" style="flex: 1;">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Add modal event listeners
    document.querySelectorAll('[data-modal-id]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-modal-id'));
            
            if (this.classList.contains('qty-btn')) {
                const isMinus = this.classList.contains('minus');
                updateModalQuantity(id, isMinus);
            } else if (this.classList.contains('add-to-cart-btn')) {
                const quantity = parseInt(document.getElementById(`modal-qty-${id}`).textContent);
                addToCartWithQuantity(id, quantity);
            }
        });
    });
}

// Update modal quantity
function updateModalQuantity(productId, isMinus) {
    const qtyElement = document.getElementById(`modal-qty-${productId}`);
    let currentQty = parseInt(qtyElement.textContent);
    
    if (isMinus && currentQty > 1) {
        currentQty--;
    } else if (!isMinus) {
        currentQty++;
    }
    
    qtyElement.textContent = currentQty;
}

// Add to cart with specific quantity
function addToCartWithQuantity(productId, quantity) {
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            weight: product.weight
        });
    }
    
    localStorage.setItem('hyfun_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    
    showNotification(`${quantity}x ${product.name} added to cart!`, 'success');
    closeModal();
}

// Close modal
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

// Handle login
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        currentUser = {
            name: email.split('@')[0],
            email: email,
            phone: '9876543210'
        };
        
        localStorage.setItem('hyfun_user', JSON.stringify(currentUser));
        updateUserInfo();
        
        hideLoading();
        showNotification('Login successful!', 'success');
        loadSection('products');
    }, 1500);
}

// Handle signup
function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    if (!/^\d{10}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        currentUser = {
            name: name,
            email: email,
            phone: phone
        };
        
        localStorage.setItem('hyfun_user', JSON.stringify(currentUser));
        updateUserInfo();
        
        hideLoading();
        showNotification('Account created successfully!', 'success');
        loadSection('products');
    }, 1500);
}

// Handle Google login
function handleGoogleLogin() {
    showLoading();
    
    setTimeout(() => {
        currentUser = {
            name: "Google User",
            email: "user@gmail.com",
            phone: "9876543210"
        };
        
        localStorage.setItem('hyfun_user', JSON.stringify(currentUser));
        updateUserInfo();
        
        hideLoading();
        showNotification('Logged in with Google!', 'success');
        loadSection('products');
    }, 1500);
}

// Handle Facebook login
function handleFacebookLogin() {
    showNotification('Facebook login coming soon!', 'info');
}

// Check auth status
function checkAuthStatus() {
    const savedUser = localStorage.getItem('hyfun_user');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInfo();
        
        // Pre-fill forms
        if (document.getElementById('fullName')) {
            document.getElementById('fullName').value = currentUser.name || '';
            document.getElementById('email').value = currentUser.email || '';
            document.getElementById('phoneNumber').value = currentUser.phone || '';
        }
    }
}

// Update user info
function updateUserInfo() {
    const userNameEl = document.getElementById('userName');
    
    if (currentUser) {
        userNameEl.textContent = currentUser.name.split(' ')[0];
    }
}

// Load section
function loadSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`section-${sectionName}`).classList.add('active');
    currentSection = sectionName;
    
    // Update progress steps
    const sections = ['hero', 'auth', 'products', 'details', 'payment', 'tracking', 'review'];
    const currentIndex = sections.indexOf(sectionName);
    
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index <= currentIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Special handling
    switch(sectionName) {
        case 'payment':
            updatePaymentSummary();
            break;
        case 'tracking':
            generateOrderId();
            break;
    }
    
    // Smooth scroll
    setTimeout(() => {
        document.getElementById(`section-${sectionName}`).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// Validate delivery form
function validateDeliveryForm() {
    const requiredFields = ['fullName', 'phoneNumber', 'email', 'address', 'city', 'pincode'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showNotification(`Please fill in ${fieldId}`, 'error');
            field.focus();
            return false;
        }
    }
    
    const email = document.getElementById('email').value;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        showNotification('Please enter a valid email', 'error');
        return false;
    }
    
    const phone = document.getElementById('phoneNumber').value;
    if (!/^\d{10}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return false;
    }
    
    return true;
}

// Update payment summary
function updatePaymentSummary() {
    const summaryItems = document.getElementById('paymentSummaryItems');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('taxAmount');
    const totalEl = document.getElementById('totalAmount');
    const payAmountEl = document.getElementById('payAmount');
    
    if (cart.length === 0) {
        summaryItems.innerHTML = '<p class="text-center">Your cart is empty</p>';
        subtotalEl.textContent = '₹0';
        taxEl.textContent = '₹0';
        totalEl.textContent = '₹0';
        payAmountEl.textContent = '0';
        return;
    }
    
    let itemsHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="summary-item-modern">
                <div class="item-image">
                    <img src="./assets/image/${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.weight} × ${item.quantity}</p>
                </div>
                <div class="item-total">₹${itemTotal}</div>
            </div>
        `;
    });
    
    const deliveryFee = 40;
    const tax = subtotal * 0.05;
    const total = subtotal + deliveryFee + tax;
    
    summaryItems.innerHTML = itemsHTML;
    subtotalEl.textContent = `₹${subtotal}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    totalEl.textContent = `₹${total.toFixed(2)}`;
    payAmountEl.textContent = total.toFixed(2);
}

// Process payment
function processPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const activeMethod = document.querySelector('.method-card.active');
    if (!activeMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }
    
    const method = activeMethod.getAttribute('data-method');
    
    // Validate payment method
    if (method === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || !expiryDate || !cvv || !cardName) {
            showNotification('Please fill all card details', 'error');
            return;
        }
        
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            showNotification('Please enter a valid card number', 'error');
            return;
        }
    } else if (method === 'upi') {
        const upiId = document.getElementById('upiId').value;
        if (!upiId || !upiId.includes('@')) {
            showNotification('Please enter a valid UPI ID', 'error');
            return;
        }
    }
    
    showLoading();
    
    // Simulate payment processing
    setTimeout(() => {
        hideLoading();
        
        // Create order
        createOrder(method);
        
        // Clear cart
        cart = [];
        localStorage.setItem('hyfun_cart', JSON.stringify(cart));
        updateCartCount();
        
        showNotification('Payment successful!', 'success');
        loadSection('tracking');
    }, 2000);
}

// Create order
function createOrder(paymentMethod) {
    const orderId = generateOrderId();
    
    currentOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: [...cart],
        customer: {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phoneNumber').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            pincode: document.getElementById('pincode').value
        },
        payment: paymentMethod,
        status: 'confirmed'
    };
    
    localStorage.setItem('hyfun_current_order', JSON.stringify(currentOrder));
    document.getElementById('orderId').textContent = orderId;
}

// Generate order ID
function generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    const unique = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `HYFUN-${unique}-${timestamp}`;
}

// Start order tracking
function startOrderTracking() {
    const now = new Date();
    
    document.getElementById('timeConfirmed').textContent = 'Just now';
    document.getElementById('timePreparing').textContent = formatTime(addMinutes(now, 5));
    document.getElementById('timeDelivery').textContent = formatTime(addMinutes(now, 15));
    document.getElementById('timeDelivered').textContent = formatTime(addMinutes(now, 30));
    
    // Animate steps
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach((step, index) => {
        step.classList.remove('active');
        
        setTimeout(() => {
            step.classList.add('active');
        }, index * 5000);
    });
    
    showNotification('Order tracking started!', 'success');
}

// Print Receipt Function
function printReceipt() {
    if (!currentOrder && !localStorage.getItem('hyfun_current_order')) {
        showNotification('No order found to print', 'error');
        return;
    }
    
    const order = currentOrder || JSON.parse(localStorage.getItem('hyfun_current_order'));
    const printFrame = document.getElementById('printFrame');
    
    let itemsHTML = '';
    let subtotal = 0;
    
    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="receipt-item">
                <span>${item.name}</span>
                <span>${item.quantity}</span>
                <span>₹${item.price}</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });
    
    const deliveryFee = 40;
    const tax = subtotal * 0.05;
    const total = subtotal + deliveryFee + tax;
    
    const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>HyFun Foods - Receipt</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    background: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .receipt-print {
                    max-width: 400px;
                    margin: 20px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px dashed #78B04B;
                }
                .receipt-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .receipt-logo img {
                    width: 50px;
                    height: 50px;
                }
                .receipt-logo h2 {
                    font-size: 1.8rem;
                    color: #78B04B;
                }
                .receipt-header p {
                    color: #666;
                    margin: 5px 0;
                }
                .receipt-order-info {
                    margin-bottom: 25px;
                    padding: 15px;
                    background: #E8F7FA;
                    border-radius: 10px;
                }
                .receipt-order-info p {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                }
                .receipt-items {
                    margin-bottom: 25px;
                }
                .receipt-item {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 10px;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                    font-size: 0.9rem;
                }
                .receipt-item-header {
                    font-weight: 700;
                    color: #78B04B;
                    border-bottom: 2px solid #78B04B;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .receipt-total {
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 2px dashed #78B04B;
                }
                .receipt-total p {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    font-size: 1rem;
                }
                .receipt-total .grand-total {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #78B04B;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px dashed #78B04B;
                    color: #666;
                    font-size: 0.9rem;
                }
                .receipt-footer i {
                    color: #78B04B;
                    margin: 0 5px;
                }
                .print-button {
                    text-align: center;
                    margin-top: 20px;
                }
                .print-button button {
                    padding: 12px 30px;
                    background: #78B04B;
                    color: white;
                    border: none;
                    border-radius: 50px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .print-button button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(120, 176, 75, 0.3);
                }
                @media print {
                    .print-button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt-print">
                <div class="receipt-header">
                    <div class="receipt-logo">
                        <img src="./assets/image/hyfun_logo.png" alt="HyFun Foods">
                        <h2>HyFun<span style="color: #78B04B;">Foods</span></h2>
                    </div>
                    <p>Order Receipt</p>
                    <p>${new Date(order.date).toLocaleString()}</p>
                </div>
                
                <div class="receipt-order-info">
                    <p><span>Order ID:</span> <strong>${order.id}</strong></p>
                    <p><span>Customer:</span> <strong>${order.customer.name}</strong></p>
                    <p><span>Phone:</span> <strong>${order.customer.phone}</strong></p>
                    <p><span>Address:</span> <strong>${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}</strong></p>
                    <p><span>Payment:</span> <strong>${order.payment.toUpperCase()}</strong></p>
                </div>
                
                <div class="receipt-items">
                    <div class="receipt-item receipt-item-header">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Price</span>
                        <span>Total</span>
                    </div>
                    ${itemsHTML}
                </div>
                
                <div class="receipt-total">
                    <p><span>Subtotal:</span> <span>₹${subtotal}</span></p>
                    <p><span>Delivery Fee:</span> <span>₹40</span></p>
                    <p><span>Tax (5%):</span> <span>₹${tax.toFixed(2)}</span></p>
                    <p class="grand-total"><span>Total:</span> <span>₹${total.toFixed(2)}</span></p>
                </div>
                
                <div class="receipt-footer">
                    <p>Thank you for ordering with HyFun Foods!</p>
                    <p>We hope you enjoy your meal <i class="fas fa-heart"></i></p>
                </div>
                
                <div class="print-button">
                    <button onclick="window.print()">Print Receipt</button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    printFrame.srcdoc = receiptContent;
    printFrame.onload = function() {
        printFrame.contentWindow.print();
    };
}

// Add minutes to date
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Update rating stars
function updateRatingStars(rating) {
    const stars = document.querySelectorAll('.rating-stars-enhanced i');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Highlight stars on hover
function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-stars-enhanced i');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Update rating circle
function updateRatingCircle(rating) {
    const circle = document.querySelector('.progress-ring-enhanced');
    if (!circle) return;
    
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rating / 5) * circumference;
    
    circle.style.strokeDashoffset = offset;
    document.getElementById('ratingNumber').textContent = rating;
}

// Update rating message
function updateRatingMessage(rating) {
    document.querySelectorAll('.rating-message').forEach(msg => {
        msg.classList.remove('active');
        if (parseInt(msg.getAttribute('data-rating')) === rating) {
            msg.classList.add('active');
        }
    });
}

// Submit review
function submitReview() {
    const title = document.getElementById('reviewTitle').value;
    const text = document.getElementById('reviewText').value;
    
    if (userRating === 0) {
        showNotification('Please select a rating', 'error');
        return;
    }
    
    if (!text.trim()) {
        showNotification('Please write a review', 'error');
        return;
    }
    
    const review = {
        rating: userRating,
        title: title,
        text: text,
        date: new Date().toISOString(),
        orderId: currentOrder ? currentOrder.id : 'N/A'
    };
    
    const reviews = JSON.parse(localStorage.getItem('hyfun_reviews')) || [];
    reviews.push(review);
    localStorage.setItem('hyfun_reviews', JSON.stringify(reviews));
    
    document.getElementById('reviewForm').style.display = 'none';
    document.getElementById('reviewSuccess').style.display = 'block';
    
    showNotification('Thank you for your review!', 'success');
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    const notification = document.createElement('div');
    notification.className = `notification-modern ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${type.toUpperCase()}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}