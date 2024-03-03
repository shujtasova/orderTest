//Получить список продуктов из API
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

//Добавить продукт
const btnAdd = document.querySelector(".btn-add");
btnAdd.addEventListener("click", addProduct);
async function addProduct(e) {
  e.preventDefault();
  const selectProduct = document.querySelector("#selectProduct"); //доступ к селект
  const quantityInput = document.querySelector("#quantityInput"); //доступ к инпут строке

  const productId = selectProduct.value; //доступ к выбранному продукту по ID
  const productName = selectProduct.options[selectProduct.selectedIndex].text; // доступ к названию выбранного продукта
  const quantity = parseInt(quantityInput.value, 10); // преобразование строки к числу
  const productPrice = await getProductPrice(productId); // доступ к цене выбранного продукта

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

  // Сохраняем product_id в data-product-id атрибуте ячейки с количеством
  cell2.dataset.productId = productId;

  cell1.textContent = productName;
  cell2.textContent = `${quantity} шт.`;
  cell3.textContent = (productPrice * quantity).toFixed(2);

  quantityInput.value = ""; // Сбросить поле ввода количества после добавления

  // После добавления продукта, обновить итоговую сумму
  updateTotalAmount();
}

//Получить цену товара из API
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
    // Если товар не найден, вернуть некоторое значение по умолчанию или обработать ошибку
    console.error(`Товар с id ${productId} не найден.`);
    return null;
  }
}

//Обновить итого
function updateTotalAmount() {
  const sum = document.querySelector(".sum"); //Доступ к итого
  let totalAmount = 0;
  const thirdColumn = document.querySelectorAll(
    "#productTable tbody td:nth-child(3)"
  );
  thirdColumn.forEach((cell) => {
    const price = parseFloat(cell.textContent); //принимает строку и возвращает десятичное число
    if (!isNaN(price)) {
      totalAmount += price;
    }
  });

  // Оставляем одну цифру после запятой в мобильной версии
  const decimalPlaces = window.innerWidth < 500 ? 2 : 0;
  sum.textContent = totalAmount.toFixed(decimalPlaces);
}

//Сохранить
const btnSave = document.querySelector(".btn-save");
btnSave.addEventListener("click", saveOrder);

async function saveOrder() {
  try {
    // Получение данных для отправки
    const orderData = getOrderData();

    // Проверка, что есть хотя бы один продукт в заказе
    if (orderData.length === 0) {
      Swal.fire({
        icon: "error",
        text: "Добавьте хотя бы один продукт в заказ."
      });
      return;
    }

    // Отправка данных на сервер
    const res = await fetch("https://dev-su.eda1.ru/test_task/save.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products: orderData }),
    });

    const resReceived = await res.json();

    // Проверка успешности сохранения заказа
    if (resReceived.success) {
      Swal.fire({
        title: "Заказ успешно сохранен!",
        text: `Номер заказа: ${resReceived.code}`,
        icon: "success",
      });
      // Очистка данных заказа после успешного сохранения
      clearOrderData();
    } else {
      // В случае ошибки отобразить соответствующее сообщение
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

// Получение данных заказа
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

// Очистка данных заказа
function clearOrderData() {
  const tableBody = document.querySelector("#productTable tbody");
  const sum = document.querySelector(".sum");
  tableBody.innerHTML = "";
  sum.textContent = "";
}
