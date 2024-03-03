document.addEventListener("DOMContentLoaded", () => {
  getProducts();
});

async function getProducts() {
  const selectProduct = document.querySelector("#selectProduct");
  const res = await fetch("https://dev-su.eda1.ru/test_task/products.php");
  const resReceived = await res.json();
  resReceived.products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.title;
    selectProduct.appendChild(option);
  });
}

const btnAdd = document.querySelector(".btn-add");
btnAdd.addEventListener("click", addProduct);
async function addProduct(e) {
  e.preventDefault();
  const selectProduct = document.querySelector("#selectProduct"); 
  const quantityInput = document.querySelector("#quantityInput"); 

  const productId = selectProduct.value; 
  const productName = selectProduct.options[selectProduct.selectedIndex].text;
  const quantity = parseInt(quantityInput.value, 10); 
  const productPrice = await getProductPrice(productId);

  if (!productId || isNaN(quantity) || quantity <= 0) {
    Swal.fire({
      icon: "error",
      text: "Выберите продукт и укажите количество."
    });
    return;
  }

  const productTable = document.querySelector("#productTable");
  const tbody = productTable.querySelector("tbody");
  const newRow = tbody.insertRow();

  const cell1 = newRow.insertCell(0);
  const cell2 = newRow.insertCell(1);
  const cell3 = newRow.insertCell(2);

  cell2.dataset.productId = productId;

  cell1.textContent = productName;
  cell2.textContent = `${quantity} шт.`;
  cell3.textContent = (productPrice * quantity).toFixed(2);

  quantityInput.value = "";

  updateTotalAmount();
}

async function getProductPrice(productId) {
  const res = await fetch(
    `https://dev-su.eda1.ru/test_task/products.php?id=${productId}`
  );
  const resReceived = await res.json();
  const product = resReceived.products.find(
    (product) => product.id == productId
  );

  if (product) {
    return product.price;
  } else {
    console.error(`Товар с id ${productId} не найден.`);
    return null;
  }
}

function updateTotalAmount() {
  const sum = document.querySelector(".sum");
  let totalAmount = 0;
  const thirdColumn = document.querySelectorAll(
    "#productTable tbody td:nth-child(3)"
  );
  thirdColumn.forEach((cell) => {
    const price = parseFloat(cell.textContent);
    if (!isNaN(price)) {
      totalAmount += price;
    }
  });

  const decimalPlaces = window.innerWidth < 500 ? 2 : 0;
  sum.textContent = totalAmount.toFixed(decimalPlaces);
}

const btnSave = document.querySelector(".btn-save");
btnSave.addEventListener("click", saveOrder);

async function saveOrder() {
  try {
    const orderData = getOrderData();

    if (orderData.length === 0) {
      Swal.fire({
        icon: "error",
        text: "Добавьте хотя бы один продукт в заказ."
      });
      return;
    }

    const res = await fetch("https://dev-su.eda1.ru/test_task/save.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products: orderData }),
    });

    const resReceived = await res.json();

    if (resReceived.success) {
      Swal.fire({
        title: "Заказ успешно сохранен!",
        text: `Номер заказа: ${resReceived.code}`,
        icon: "success",
      });
      clearOrderData();
    } else {
      Swal.fire({
        icon: "error",
        text: "Ошибка при сохранении заказа"
      });
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    alert("Произошла ошибка при сохранении заказа.");
  }
}

function getOrderData() {
  const orderData = [];
  const tableRows = document.querySelectorAll("#productTable tbody tr");

  tableRows.forEach((row) => {
    const product = {
      product_id: row.dataset.productId,
      quantity: parseInt(row.cells[1].textContent),
    };
    orderData.push(product);
  });

  return orderData;
}

function clearOrderData() {
  const tableBody = document.querySelector("#productTable tbody");
  const sum = document.querySelector(".sum");
  tableBody.innerHTML = "";
  sum.textContent = "";
}
