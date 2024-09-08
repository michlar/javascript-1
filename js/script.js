
// Show mobile navigation
menuIcon.onclick = function() {
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'flex';
};

//Hide mobile navigation
hideSidebar.onclick = function() {
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
};

//API 
const fetchAPI = "https://api.noroff.dev/api/v1/rainy-days";
let allProducts = [];

// Fetch products from API
async function fetchProducts(){
    const loadingIndicator = document.getElementById("loading-indicator");
    try{
        loadingIndicator.style.display = "block";
        const response = await fetch(fetchAPI);
        allProducts = await response.json();
        displayProducts(allProducts);

    } catch (error) {
        console.error("Error fetching products", error);
        alert("There was an error loading the products. Please try again later.");
    } finally{
        loadingIndicator.style.display = "none";
    }
}

// Display products
function displayProducts(products){
    const productList = document.getElementById("product-list");
    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add("product");

        const price = product.onSale ? 
                      `<p class="price discounted-price">Sale Price: ${product.discountedPrice.toFixed(2)}€</p>` : 
                      `<p class="price">Price: ${product.price.toFixed(2)}€</p>`;

        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h2>${product.title}</h2>
            ${price}
        `;

        //Save to localstorage and switch page
        productElement.addEventListener("click", () => {
            localStorage.setItem("selectedProduct", JSON.stringify(product));
            window.location.href = "/product/index.html";
        });

        productList.appendChild(productElement);

    });
}

// Show product details 
function displayProductDetails(){
    const productDetails = document.getElementById("product-details");
    const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

    if (selectedProduct) {
        productDetails.innerHTML = `
            <img src="${selectedProduct.image}" alt="${selectedProduct.title}">
            <h1>${selectedProduct.title}</h1>
            <p class="price">Price: ${selectedProduct.price.toFixed(2)}€</p>
            <p>${selectedProduct.description}</p>
            <button id="add-to-cart" class="button">Add to Cart</button>
        `;

        // Add product to shopping cart
        document.getElementById("add-to-cart").addEventListener("click", () => {
            addToCart(selectedProduct);
            updateCount();

        });
    }else{
        productDetails.innerHTML = "<p>No product details available.</p>";
        alert("No product details available. Please select a product.");
    }
}

// Function for adding to cart
function addToCart(product){
    // Get from local storage or make new array
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const doesExist = cart.find(item => item.id === product.id);

    if(doesExist){
        doesExist.quantity += 1;
    } else {
        product.quantity = 1;
        cart.push(product)
    }
    // Save to local storage
    localStorage.setItem("cart", JSON.stringify(cart));

    showFeedbackMessage("Product added to cart")
}

function showFeedbackMessage(message) {
    const feedbackMessageDiv = document.getElementById("feedback-message");
    feedbackMessageDiv.textContent = message;
    feedbackMessageDiv.style.display = "block";

    setTimeout(() => {
        feedbackMessageDiv.style.display = "none";
    }, 3000);
}

// Filter function
function filterProducts(){
    const genderFilter = document.getElementById("gender-filter").value;
    const saleFilter = document.getElementById("sale-checkbox").checked;

    const filteredProducts = allProducts.filter(product => {
        let genderMatch = (genderFilter === "all") || (product.gender.toLowerCase() === genderFilter);
        let saleMatch = !saleFilter || product.onSale;
    
        return genderMatch && saleMatch;
        
    });

    displayProducts(filteredProducts);
}

// Function display cart 
function displayCart(){
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Shopping cart is empty</p>";
        cartTotal.innerHTML = "";
        return;
    }

    cartItems.innerHTML = "";
    let priceTotal = 0;

    cart.forEach((item, index) => {
        const itemInstance = document.createElement("div");
        itemInstance.classList.add("cart-item");

        itemInstance.innerHTML = `
            <img src="${item.image}" alt="${item.title}" width="100">
            <div id="cart-item">
                <h2>${item.title}</h2>
                <p>Price: ${item.price.toFixed(2)}€</p>
                <p>Quantity: ${item.quantity}</p>
                <button class="delete-button" data-index="${index}">Delete</button>
            </div>
        `;

        cartItems.appendChild(itemInstance);

        priceTotal += item.price * item.quantity;
    });

    cartTotal.innerHTML = `<h2 id="cart-total">Total: ${priceTotal.toFixed(2)}€</h2>`;

    //Delete button 
    document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", event => {
            const index = event.target.dataset.index;
            deleteItem(index);
        });
    });
}


// Delete from cart function 
function deleteItem(index){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    updateCount();
}

// Update cart in navigation
function updateCount(){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCount = document.querySelectorAll(".count");
    cartCount.forEach(cartCount => {
        cartCount.textContent = `(${totalItems})`
    });
}

//Complete order
document.addEventListener("DOMContentLoaded", () => {
    const completeOrderButn = document.getElementById("complete-order");

    if (completeOrderButn){
        completeOrderButn.addEventListener("click", () => {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            if(cart.length === 0) {
                alert("Your cart is empty");
                return;
            }

            localStorage.setItem("confirmedOrder", JSON.stringify(cart));
            localStorage.removeItem("cart");
            updateCount();

            window.location.href = "/checkout/confirmation/index.html"
        })
    }
});

//Order confirmation
function confirmationPage(){
    const orderDetails = document.getElementById("order-details");
    let confirmation = JSON.parse(localStorage.getItem("confirmedOrder"));

    if (!confirmation || confirmation.length === 0){
        orderDetails.innerHTML = "<p>No details available</p>"
        return;
    }

    confirmation.forEach(item => {
        const orderItem = document.createElement("div");
        orderItem.classList.add("order-item");
    
        orderItem.innerHTML = `
            <img src="${item.image}"></img>
            <h2>${item.title}</h2>
            <p>Quantity: ${item.quantity}</p>
            <p>Total: ${(item.price * item.quantity).toFixed(2)}€</p>
        `;
        orderDetails.appendChild(orderItem);

    });
};

document.addEventListener("DOMContentLoaded", () => {
    updateCount();

    if (document.getElementById("product-list")) {
        fetchProducts();
    }

    if (document.getElementById("product-details")) {
        displayProductDetails();
    }

    if (document.getElementById("cart-items")) {
        displayCart();
    }

    if (document.getElementById("order-details")) {
        confirmationPage();
    }
    
});




