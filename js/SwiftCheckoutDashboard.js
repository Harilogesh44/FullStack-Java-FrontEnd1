const API_BASE_URL = "https://fullstack-java-backend-4.onrender.com";

const ENDPOINTS = {
    products: "/products",
    inventory: "/inventory",
    orders: "/orders",
    payments: "/payments",
    customers: "/auth"
};

let products = [];
let inventory = [];
let orders = [];
let payments = [];
let customers = [];

document.addEventListener("DOMContentLoaded", function () {
    loadUserInfo();
    loadProducts();
    loadInventory();
    loadOrders();
    loadPayments();
    loadCustomers();
});

function getToken() {
    return localStorage.getItem("jwtToken");
}

function authHeaders() {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    return headers;
}

function loadUserInfo() {
    const username =
        localStorage.getItem("username") ||
        localStorage.getItem("email") ||
        "Logged User";

    const role =
        localStorage.getItem("role") ||
        "USER";

    document.getElementById(
        "loggedUser"
    ).textContent = username;

    document.getElementById(
        "loggedRole"
    ).textContent = role;
}

function showSection(sectionId, button) {
    document
        .querySelectorAll(".content-section")
        .forEach(function (section) {
            section.classList.remove(
                "active-section"
            );
        });

    document
        .getElementById(sectionId)
        .classList.add("active-section");

    document
        .querySelectorAll(".nav-btn")
        .forEach(function (btn) {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    const titles = {
        overview: "Dashboard",
        products: "Products",
        inventory: "Inventory",
        orders: "Orders",
        payments: "Payments",
        customers: "Customers"
    };

    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[sectionId] || "Dashboard";
}

async function request(url, options = {}) {
    const response = await fetch(
        API_BASE + url,
        {
            ...options,
            headers: {
                ...authHeaders(),
                ...(options.headers || {})
            }
        }
    );

    if (response.status === 401) {
        localStorage.removeItem("jwtToken");

        alert(
            "Session expired. Please login again."
        );

        window.location.href =
            "SwiftCheckoutLogin.html";

        throw new Error("Unauthorized");
    }

    return response;
}

async function loadProducts() {
    const body =
        document.getElementById(
            "productTableBody"
        );

    try {
        const response =
            await request(
                ENDPOINTS.products
            );

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                "Product error " +
                response.status +
                ": " +
                (text || "Unable to load products")
            );
        }

        products =
            await response.json();

        renderProducts(products);

        document.getElementById(
            "productCount"
        ).textContent =
            products.length;

    } catch (error) {
        body.innerHTML = `
            <tr>
                <td colspan="6">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

function renderProducts(list) {
    const body =
        document.getElementById(
            "productTableBody"
        );

    if (!list || list.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="6">
                    No products found.
                </td>
            </tr>
        `;

        return;
    }

    body.innerHTML =
        list.map(function (product) {
            return `
                <tr>
                    <td>
                        ${product.id ?? ""}
                    </td>

                    <td>
                        ${escapeHtml(product.name)}
                    </td>

                    <td>
                        ${escapeHtml(product.sku)}
                    </td>

                    <td>
                        ${escapeHtml(product.category)}
                    </td>

                    <td>
                        ₹${Number(
                            product.price || 0
                        ).toFixed(2)}
                    </td>

                    <td>
                        <button
                            class="edit-btn"
                            onclick="editProduct(${product.id})">
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteProduct(${product.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
}

function filterProducts() {
    const search =
        document
            .getElementById("productSearch")
            .value
            .toLowerCase();

    const category =
        document
            .getElementById("categoryFilter")
            .value;

    const filtered =
        products.filter(function (product) {
            const name =
                String(product.name || "")
                    .toLowerCase();

            const sku =
                String(product.sku || "")
                    .toLowerCase();

            const matchesSearch =
                name.includes(search) ||
                sku.includes(search);

            const matchesCategory =
                !category ||
                product.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });

    renderProducts(filtered);
}

function openProductForm() {
    document
        .getElementById("productFormBox")
        .classList.remove("hidden");

    document.getElementById(
        "productFormTitle"
    ).textContent =
        "Add Product";

    clearProductForm();
}

function closeProductForm() {
    document
        .getElementById("productFormBox")
        .classList.add("hidden");

    clearProductForm();
}

function clearProductForm() {
    document.getElementById(
        "productId"
    ).value = "";

    document.getElementById(
        "productName"
    ).value = "";

    document.getElementById(
        "productSku"
    ).value = "";

    document.getElementById(
        "productPrice"
    ).value = "";

    document.getElementById(
        "productCategory"
    ).value = "ELECTRONICS";

    document.getElementById(
        "productMessage"
    ).textContent = "";
}

function editProduct(id) {
    const product =
        products.find(function (p) {
            return p.id === id;
        });

    if (!product) {
        return;
    }

    document
        .getElementById("productFormBox")
        .classList.remove("hidden");

    document.getElementById(
        "productFormTitle"
    ).textContent =
        "Edit Product";

    document.getElementById(
        "productId"
    ).value =
        product.id;

    document.getElementById(
        "productName"
    ).value =
        product.name || "";

    document.getElementById(
        "productSku"
    ).value =
        product.sku || "";

    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";

    document.getElementById(
        "productCategory"
    ).value =
        product.category ||
        "ELECTRONICS";
}

async function saveProduct() {
    const id =
        document.getElementById(
            "productId"
        ).value;

    const product = {
        name:
            document.getElementById(
                "productName"
            ).value.trim(),

        sku:
            document.getElementById(
                "productSku"
            ).value.trim(),

        price:
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            ),

        category:
            document.getElementById(
                "productCategory"
            ).value
    };

    const message =
        document.getElementById(
            "productMessage"
        );

    if (
        !product.name ||
        !product.sku ||
        !product.price
    ) {
        showMessage(
            message,
            "Please fill all product fields",
            false
        );

        return;
    }

    try {
        const url = id
            ? ENDPOINTS.products + "/" + id
            : ENDPOINTS.products;

        const method = id
            ? "PUT"
            : "POST";

        const response =
            await request(
                url,
                {
                    method: method,
                    body:
                        JSON.stringify(product)
                }
            );

        const result =
            await response.text();

        if (!response.ok) {
            throw new Error(
                "Product error " +
                response.status +
                ": " +
                (result || "Product save failed")
            );
        }

        showMessage(
            message,
            id
                ? "Product updated successfully"
                : "Product created successfully",
            true
        );

        await loadProducts();
        await loadInventory();

        setTimeout(function () {
            closeProductForm();
        }, 800);

    } catch (error) {
        showMessage(
            message,
            error.message,
            false
        );
    }
}

async function deleteProduct(id) {
    const confirmed =
        confirm(
            "Delete Product ID " +
            id +
            "?"
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await request(
                ENDPOINTS.products +
                "/" +
                id,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                "Delete error " +
                response.status +
                ": " +
                (text || "Delete failed")
            );
        }

        alert(
            "Product ID " +
            id +
            " deleted successfully"
        );

        await loadProducts();
        await loadInventory();

    } catch (error) {
        alert(error.message);
    }
}

async function loadInventory() {
    const body =
        document.getElementById(
            "inventoryTableBody"
        );

    try {
        const response =
            await request(
                ENDPOINTS.inventory
            );

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                "Inventory error " +
                response.status +
                ": " +
                (text || "Unable to load inventory")
            );
        }

        inventory =
            await response.json();

        document.getElementById(
            "inventoryCount"
        ).textContent =
            inventory.length;

        const lowStock =
            inventory.filter(
                function (item) {
                    return Number(
                        item.stockLevel
                    ) < 10;
                }
            ).length;

        document.getElementById(
            "lowStockCount"
        ).textContent =
            lowStock;

        if (inventory.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="5">
                        No inventory found.
                    </td>
                </tr>
            `;

            return;
        }

        body.innerHTML =
            inventory.map(
                function (item) {
                    const stockClass =
                        Number(
                            item.stockLevel
                        ) < 10
                            ? "low-stock"
                            : "";

                    return `
                        <tr>
                            <td>
                                ${item.id ?? ""}
                            </td>

                            <td>
                                ${escapeHtml(item.sku)}
                            </td>

                            <td class="${stockClass}">
                                ${item.stockLevel ?? 0}
                            </td>

                            <td>
                                <input
                                    type="number"
                                    id="adjust-${item.id}"
                                    placeholder="+/- Units">
                            </td>

                            <td>
                                <button
                                    class="update-btn"
                                    onclick="updateInventory(${item.id})">
                                    Update
                                </button>
                            </td>
                        </tr>
                    `;
                }
            ).join("");

    } catch (error) {
        body.innerHTML = `
            <tr>
                <td colspan="5">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

async function updateInventory(id) {
    const input =
        document.getElementById(
            "adjust-" + id
        );

    const quantity =
        Number(input.value);

    if (
        input.value.trim() === "" ||
        quantity === 0
    ) {
        alert(
            "Enter adjustment quantity"
        );

        return;
    }

    try {
        const response =
            await request(
                ENDPOINTS.inventory +
                "/" +
                id,
                {
                    method: "PUT",
                    body:
                        JSON.stringify({
                            stockLevel: quantity
                        })
                }
            );

        const text =
            await response.text();

        if (!response.ok) {
            throw new Error(
                "Inventory update error " +
                response.status +
                ": " +
                (
                    text ||
                    "Inventory update failed"
                )
            );
        }

        alert(
            "Inventory updated successfully"
        );

        input.value = "";

        await loadInventory();

    } catch (error) {
        alert(error.message);
    }
}

function toggleOrderForm() {
    document
        .getElementById("orderFormBox")
        .classList.toggle("hidden");
}

async function loadOrders() {
    const body =
        document.getElementById(
            "orderTableBody"
        );

    try {
        const response =
            await request(
                ENDPOINTS.orders
            );

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                "Order error " +
                response.status +
                ": " +
                (text || "Unable to load orders")
            );
        }

        orders =
            await response.json();

        document.getElementById(
            "orderCount"
        ).textContent =
            orders.length;

        if (orders.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="5">
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }

        body.innerHTML =
            orders.map(
                function (order) {
                    return `
                        <tr>
                            <td>
                                ${order.id ?? ""}
                            </td>

                            <td>
                                ${escapeHtml(
                                    order.productId
                                )}
                            </td>

                            <td>
                                ${order.quantity ?? ""}
                            </td>

                            <td>
                                ${order.customerId ?? ""}
                            </td>

                            <td>
                                ${escapeHtml(
                                    order.status
                                )}
                            </td>
                        </tr>
                    `;
                }
            ).join("");

    } catch (error) {
        body.innerHTML = `
            <tr>
                <td colspan="5">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

async function placeOrder() {
    const order = {
        productId:
            document.getElementById(
                "orderProductId"
            ).value.trim(),

        quantity:
            Number(
                document.getElementById(
                    "orderQuantity"
                ).value
            ),

        customerId:
            Number(
                document.getElementById(
                    "orderCustomerId"
                ).value
            )
    };

    const message =
        document.getElementById(
            "orderMessage"
        );

    try {
        const response =
            await request(
                ENDPOINTS.orders,
                {
                    method: "POST",
                    body:
                        JSON.stringify(order)
                }
            );

        const result =
            await response.text();

        if (!response.ok) {
            throw new Error(
                "Order error " +
                response.status +
                ": " +
                (result || "Order failed")
            );
        }

        showMessage(
            message,
            "Order created successfully",
            true
        );

        await loadOrders();
        await loadInventory();

    } catch (error) {
        showMessage(
            message,
            error.message,
            false
        );
    }
}

function togglePaymentForm() {
    document
        .getElementById("paymentFormBox")
        .classList.toggle("hidden");
}

async function loadPayments() {
    const body =
        document.getElementById(
            "paymentTableBody"
        );

    try {
        const response =
            await request(
                ENDPOINTS.payments
            );

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                "Payment error " +
                response.status +
                ": " +
                (text || "Unable to load payments")
            );
        }

        payments =
            await response.json();

        document.getElementById(
            "paymentCount"
        ).textContent =
            payments.length;

        if (payments.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="5">
                        No payments found.
                    </td>
                </tr>
            `;

            return;
        }

        body.innerHTML =
            payments.map(
                function (payment) {
                    return `
                        <tr>
                            <td>
                                ${payment.id ?? ""}
                            </td>

                            <td>
                                ${payment.orderId ?? ""}
                            </td>

                            <td>
                                ₹${Number(
                                    payment.amount || 0
                                ).toFixed(2)}
                            </td>

                            <td>
                                ${escapeHtml(
                                    payment.paymentMethod
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    payment.status
                                )}
                            </td>
                        </tr>
                    `;
                }
            ).join("");

    } catch (error) {
        body.innerHTML = `
            <tr>
                <td colspan="5">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

async function processPayment() {
    const payment = {
        orderId:
            Number(
                document.getElementById(
                    "paymentOrderId"
                ).value
            ),

        amount:
            Number(
                document.getElementById(
                    "paymentAmount"
                ).value
            ),

        paymentMethod:
            document.getElementById(
                "paymentMethod"
            ).value,

        status: "COMPLETED"
    };

    const message =
        document.getElementById(
            "paymentMessage"
        );

    try {
        const response =
            await request(
                ENDPOINTS.payments,
                {
                    method: "POST",
                    body:
                        JSON.stringify(payment)
                }
            );

        const result =
            await response.text();

        if (!response.ok) {
            throw new Error(
                "Payment error " +
                response.status +
                ": " +
                (result || "Payment failed")
            );
        }

        showMessage(
            message,
            "Payment processed successfully",
            true
        );

        await loadPayments();

    } catch (error) {
        showMessage(
            message,
            error.message,
            false
        );
    }
}

async function loadCustomers() {
    const body =
        document.getElementById(
            "customerTableBody"
        );

    try {
        const response =
            await request(
                ENDPOINTS.customers
            );

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                "Customer error " +
                response.status +
                ": " +
                (
                    text ||
                    "Customer list endpoint unavailable"
                )
            );
        }

        customers =
            await response.json();

        document.getElementById(
            "customerCount"
        ).textContent =
            customers.length;

        if (customers.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="4">
                        No customers found.
                    </td>
                </tr>
            `;

            return;
        }

        body.innerHTML =
            customers.map(
                function (customer) {
                    return `
                        <tr>
                            <td>
                                ${customer.id ?? ""}
                            </td>

                            <td>
                                ${escapeHtml(
                                    customer.name ||
                                    customer.username
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    customer.email
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    customer.role
                                )}
                            </td>
                        </tr>
                    `;
                }
            ).join("");

    } catch (error) {
        body.innerHTML = `
            <tr>
                <td colspan="4">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

function showMessage(
    element,
    text,
    success
) {
    element.textContent = text;

    element.className =
        success
            ? "message success"
            : "message error";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    window.location.href =
        "SwiftCheckoutLogin.html";
}
