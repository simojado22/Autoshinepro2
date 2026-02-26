/* ================= AUTO-SHINE PRO: FULL SCRIPT (VERCEL VERSION) ================= */

const orderModal = document.getElementById("orderModal");
const modalCard = document.querySelector(".modalCard");
const closeModalBtn = document.getElementById("closeModalBtn");
const orderForm = document.getElementById("orderForm");
const productsContainer = document.getElementById("productsList");
const statusLine = document.getElementById("statusLine");

const qtyInput = document.getElementById("quantity");
const totalInfo = document.getElementById("totalInfo");

let currentPrice = 0;
let currentProductName = "";

/* ===== 1. FETCH PRODUCTS FROM VERCEL API ===== */
document.addEventListener("DOMContentLoaded", fetchProducts);

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();

    if (data.ok && data.products) {
      renderProducts(data.products);
    } else {
      if (statusLine) statusLine.innerText = "Erreur: Impossible de charger les produits.";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    if (statusLine) statusLine.innerText = "Erreur de connexion au serveur.";
  }
}

/* ===== 2. RENDER PRODUCTS ON PAGE ===== */
function renderProducts(products) {
  if (!productsContainer) return;
  productsContainer.innerHTML = "";
  if (statusLine) statusLine.style.display = "none"; 

  products.forEach(p => {
    const name = p.Nom || p.Name || p.Produit || "Produit AutoShine";
    const price = p.Prix || p.Price || 0;
    const image = p.ImageURL || p.Image || p.Photo || "";
    const desc = p.Description || p.Desc || "";
    const stock = p.Stock || "Disponible";

    const card = document.createElement("div");
    card.className = "productCard"; 
    card.style.cssText = "border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; background: rgba(0,0,0,0.4); text-align: center; cursor: pointer; transition: 0.3s;";
    
    card.innerHTML = `
      <img src="${image}" alt="${name}" style="width:100%; height:200px; object-fit:cover; border-radius:8px; margin-bottom:15px; background:#1a1a1a;" onerror="this.src=''">
      <h3 style="margin: 0 0 10px 0; color: #fff; font-size:18px;">${name}</h3>
      <p style="color: #d6b35a; font-weight: bold; font-size: 16px; margin: 0 0 15px 0;">${price} DH</p>
      <button style="width:100%; padding:10px; border-radius:8px; border:none; background: linear-gradient(90deg,#d6b35a,#2fd47e); color:#000; font-weight:bold; cursor:pointer;">Commander</button>
    `;

    card.addEventListener("click", () => {
      openModalWithProduct({ name, price, image, desc, stock });
    });

    productsContainer.appendChild(card);
  });
}

/* ===== 3. OPEN MODAL & SCROLL TO FORM ===== */
function openModalWithProduct(product) {
  currentProductName = product.name;
  currentPrice = parseFloat(product.price) || 0;

  document.getElementById("modalImg").src = product.image;
  document.getElementById("modalTitle").innerText = product.name;
  document.getElementById("modalDesc").innerText = product.desc;
  document.getElementById("modalPrice").innerText = currentPrice + " DH";
  document.getElementById("modalStock").innerText = "Stock: " + product.stock;

  document.getElementById("productName").value = currentProductName;
  document.getElementById("unitPrice").value = currentPrice;

  if (qtyInput) qtyInput.value = 1;
  updateTotal();

  orderModal.classList.add("show");

  setTimeout(() => {
    const formArea = document.getElementById("orderForm");
    const nameInput = document.getElementById("fullName");
    if (formArea) {
      formArea.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (nameInput) {
      nameInput.focus();
    }
  }, 150);
}

function closeModal() {
  orderModal.classList.remove("show");
}

closeModalBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeModal();
});

orderModal?.addEventListener("click", closeModal);
modalCard?.addEventListener("click", (e) => e.stopPropagation());

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ===== 4. CALCULATE TOTAL ===== */
function updateTotal() {
  if (!qtyInput || !totalInfo) return;
  const qty = parseInt(qtyInput.value) || 1;
  const total = qty * currentPrice;
  totalInfo.innerText = total + " DH";
}

qtyInput?.addEventListener("input", updateTotal);

/* ===== 5. FORM SUBMIT TO VERCEL API ===== */
orderForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const city = document.getElementById("city")?.value.trim();
  const quantity = parseInt(qtyInput?.value) || 1;
  const total = quantity * currentPrice;

  if (!fullName || !phone || !city) {
    alert("المرجو إدخال جميع المعلومات");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  const originalText = submitBtn.innerText;
  submitBtn.innerText = "جاري الإرسال... ⏳";
  submitBtn.disabled = true;

  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        city,
        quantity: quantity,
        product: currentProductName,
        price: currentPrice,
        total: total,
        orderId: "AS-" + Date.now()
      })
    });

    const data = await res.json();

    if (!data.ok) {
      alert("فشل إرسال الطلب: " + (data.error || "تأكد من إعدادات Google Apps Script"));
      console.error(data);
      return;
    }

    alert("تم إرسال الطلب بنجاح ✅");
    orderForm.reset();
    closeModal();

  } catch (err) {
    console.error("Submit error:", err);
    alert("خطأ في الاتصال بالخادم");
  } finally {
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
  }
});
