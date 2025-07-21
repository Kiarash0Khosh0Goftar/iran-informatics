// سیستم احراز هویت اصلاح شده
class AuthManager {
    static isAdminLoggedIn() {
        return sessionStorage.getItem('isAdminLoggedIn') === 'true';
    }
    
    static login(username, password) {
        // استفاده از کاراکترهای استاندارد
        const validUsername = 'IranAdmin';
        const validPassword = 'SecurePass@1403';
        
        if (username === validUsername && password === validPassword) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            return true;
        }
        return false;
    }
    
    static logout() {
        sessionStorage.removeItem('isAdminLoggedIn');
    }
}

// مدیریت محصولات
class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('iranInformaticsProducts')) || [];
        this.currentProductId = null;
        this.init();
    }
    
    init() {
        this.renderProducts();
        this.toggleAdminPanel();
        this.setupEventListeners();
    }
    
    // افزودن محصول جدید
    addProduct(product) {
        this.products.push(product);
        this.saveProducts();
        this.renderProducts();
        this.renderAdminProducts();
    }
    
    // ویرایش محصول
    editProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = {...this.products[index], ...updatedProduct};
            this.saveProducts();
            this.renderProducts();
            this.renderAdminProducts();
        }
    }
    
    // حذف محصول
    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveProducts();
        this.renderProducts();
        this.renderAdminProducts();
    }
    
    // ذخیره محصولات در localStorage
    saveProducts() {
        localStorage.setItem('iranInformaticsProducts', JSON.stringify(this.products));
    }
    
    // نمایش محصولات برای مشتریان
    renderProducts() {
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = '';
        
        this.products.forEach(product => {
            const finalPrice = product.price * (1 - product.discount / 100);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">
                        ${finalPrice.toLocaleString()} تومان
                        ${product.discount > 0 ? 
                            `<span class="product-discount">
                                (${product.discount}% تخفیف)
                            </span>` : ''}
                    </div>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
        });
    }
    
    // نمایش محصولات در پنل مدیریت
    renderAdminProducts() {
        const adminList = document.getElementById('adminProductsList');
        adminList.innerHTML = '';
        
        this.products.forEach(product => {
            const adminItem = document.createElement('div');
            adminItem.className = 'admin-product-item';
            adminItem.innerHTML = `
                <div class="admin-product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p>قیمت: ${product.price.toLocaleString()} تومان</p>
                    <p>تخفیف: ${product.discount}%</p>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-edit" data-id="${product.id}">ویرایش</button>
                    <button class="btn-delete" data-id="${product.id}">حذف</button>
                </div>
            `;
            
            adminList.appendChild(adminItem);
        });
        
        // افزودن رویداد برای دکمه‌های ویرایش و حذف
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.prepareEditForm(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('آیا از حذف این محصول مطمئن هستید؟')) {
                    this.deleteProduct(id);
                }
            });
        });
    }
    
    // آماده‌سازی فرم برای ویرایش
    prepareEditForm(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.currentProductId = id;
            
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDiscount').value = product.discount;
            
            // نمایش تصویر فعلی
            const previewImage = document.getElementById('previewImage');
            previewImage.src = product.image;
            previewImage.style.display = 'block';
            document.querySelector('#imagePreview span').style.display = 'none';
            
            // تغییر متن دکمه
            document.getElementById('addProductBtn').textContent = 'ذخیره تغییرات';
        }
    }
    
    // تنظیم رویدادها
    setupEventListeners() {
        // رویداد آپلود تصویر
        document.getElementById('productImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const previewImage = document.getElementById('previewImage');
                    previewImage.src = event.target.result;
                    previewImage.style.display = 'block';
                    document.querySelector('#imagePreview span').style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });
        
        // رویداد افزودن/ویرایش محصول
        document.getElementById('addProductBtn').addEventListener('click', () => {
            const name = document.getElementById('productName').value;
            const description = document.getElementById('productDescription').value;
            const category = document.getElementById('productCategory').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const discount = parseInt(document.getElementById('productDiscount').value) || 0;
            const previewImage = document.getElementById('previewImage').src;
            
            if (!name || !price || previewImage.includes('data:image') === false) {
                alert('لطفاً نام، قیمت و تصویر محصول را وارد کنید');
                return;
            }
            
            const productData = {
                id: this.currentProductId || Date.now(),
                name,
                description,
                category,
                price,
                discount,
                image: previewImage
            };
            
            if (this.currentProductId) {
                this.editProduct(this.currentProductId, productData);
                this.currentProductId = null;
                document.getElementById('addProductBtn').textContent = 'افزودن محصول';
            } else {
                this.addProduct(productData);
            }
            
            // ریست فرم
            document.getElementById('productName').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productDiscount').value = '0';
            document.getElementById('productImage').value = '';
            document.getElementById('previewImage').src = '';
            document.getElementById('previewImage').style.display = 'none';
            document.querySelector('#imagePreview span').style.display = 'block';
        });
        
        // جستجوی محصولات
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = this.products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm)
            );
            this.renderFilteredProducts(filteredProducts);
        });
        
        // مرتب‌سازی محصولات
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            const sortValue = e.target.value;
            let sortedProducts = [...this.products];
            
            if (sortValue === 'price_asc') {
                sortedProducts.sort((a, b) => 
                    (a.price * (1 - a.discount/100)) - (b.price * (1 - b.discount/100))
                );
            } else if (sortValue === 'price_desc') {
                sortedProducts.sort((a, b) => 
                    (b.price * (1 - b.discount/100)) - (a.price * (1 - a.discount/100))
                );
            }
            
            this.renderFilteredProducts(sortedProducts);
        });
    }
    
    // نمایش محصولات فیلتر شده
    renderFilteredProducts(products) {
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = '';
        
        products.forEach(product => {
            const finalPrice = product.price * (1 - product.discount / 100);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">
                        ${finalPrice.toLocaleString()} تومان
                        ${product.discount > 0 ? 
                            `<span class="product-discount">
                                (${product.discount}% تخفیف)
                            </span>` : ''}
                    </div>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
        });
    }
    
    // نمایش/مخفی کردن پنل مدیریت
    toggleAdminPanel() {
        const loginSection = document.getElementById('loginSection');
        const adminPanel = document.getElementById('adminPanel');
        
        if (AuthManager.isAdminLoggedIn()) {
            loginSection.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            this.renderAdminProducts();
        } else {
            loginSection.classList.remove('hidden');
            adminPanel.classList.add('hidden');
        }
    }
}

// راه‌اندازی سیستم
document.addEventListener('DOMContentLoaded', () => {
    const productManager = new ProductManager();
    
    // مدیریت رویدادهای لاگین
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (AuthManager.login(username, password)) {
            productManager.toggleAdminPanel();
        } else {
            alert('نام کاربری یا کلمه عبور اشتباه است');
        }
    });
    
    // مدیریت رویداد خروج
    document.getElementById('logoutBtn').addEventListener('click', () => {
        AuthManager.logout();
        productManager.toggleAdminPanel();
        // پاک کردن فیلدهای فرم
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    });
    
    // افزودن چند محصول نمونه
    if (productManager.products.length === 0) {
        const sampleProducts = [
            {
                id: 1,
                name: "لپ‌تاپ ایسوس ROG Strix",
                description: "لپ‌تاپ گیمینگ با پردازنده Core i7 نسل 12، رم 16GB، گرافیک RTX 3060",
                category: "laptop",
                price: 42000000,
                discount: 10,
                image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 2,
                name: "کامپیوتر رومیزی گیمینگ",
                description: "سیستم گیمینگ با پردازنده Core i5 نسل 13، رم 32GB، گرافیک RTX 4070",
                category: "desktop",
                price: 55000000,
                discount: 5,
                image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 3,
                name: "مانیتور سامسونگ 27 اینچ",
                description: "مانیتور حرفه‌ای 27 اینچ با رزولوشن 4K و نرخ تازه‌سازی 144Hz",
                category: "monitor",
                price: 12500000,
                discount: 15,
                image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            }
        ];
        
        sampleProducts.forEach(product => {
            productManager.addProduct(product);
        });
    }
});