const productList = document.querySelector(".productWrap");
let productData = [];
let cartDatas = [];
const productSelect = document.querySelector(".productSelect");

//初始化
const init = () => {
  getProductList();
  getCartList();
};

//產品清單字串整理
const createCardText = (item) => {
  return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img src="${item.images}" alt="" />
          <a href="#" class="addCardBtn" data-id="${item.id}" data-product="${
    item.title
  }">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${thousands(item.origin_price)}</del>
          <p class="nowPrice">NT$${thousands(item.price)}</p>
        </li>`;
};

//加入產品卡片
const renderProductList = () => {
  let str = "";
  productData.forEach((item) => {
    str += createCardText(item);
  });
  productList.innerHTML = str;
};

//取得產品資訊
const getProductList = () => {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      productData = response.data.products;
      renderProductList();
    });
};

//篩選產品卡片
productSelect.addEventListener("change", (e) => {
  console.log(e.target.value);
  if (e.target.value === "全部") {
    renderProductList();
    return;
  }
  let str = "";
  productData.forEach((item) => {
    if (item.category == e.target.value) {
      str += createCardText(item);
    }
    productList.innerHTML = str;
  });
});

//取得購物車清單
const cartTotal = document.querySelector(".cartTotal");
const getCartList = () => {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      cartDatas = response.data.carts;
      renderCartList();
      cartTotal.textContent = thousands(response.data.finalTotal);
    });
};

//代入購物車資料
const cartList = document.querySelector(".shoppingCart-tableList");
const renderCartList = () => {
  let str = "";
  cartDatas.forEach((item) => {
    str += `<tr>
              <td>
                <div class="cardItem-title">
                  <img src="${item.product.images}" alt="" />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$ ${thousands(item.product.price)}</td>
              <td>${item.quantity}</td>
              <td>NT$ ${thousands(item.product.price * item.quantity)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${
                  item.id
                }" data-product="${item.product.title}"> clear </a>
              </td>
            </tr>`;
  });
  cartList.innerHTML = str;
};

//加入購物車
productList.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.getAttribute("class") !== "addCardBtn") {
    return;
  }
  const productID = e.target.getAttribute("data-id");
  const productName = e.target.getAttribute("data-product");
  let productNum = 1;
  cartDatas.forEach((item) => {
    if (item.product.id === productID) {
      productNum = item.quantity += 1;
    }
  });

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productID,
          quantity: productNum,
        },
      }
    )
    .then(function (response) {
      alert(`已加入 ${productName} 至購物車`);
      getCartList();
    });
});

//刪除購物車個別項目
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartID = e.target.getAttribute("data-id");
  const productName = e.target.getAttribute("data-product");
  if (cartID == null) {
    return;
  }
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartID}`
    )
    .then(function (response) {
      alert(`已刪除 ${productName} `);
      getCartList();
    });
});

//刪除全部購物車品項
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      alert("已清空購物車！");
      getCartList();
    })
    .catch(function (error) {
      alert("購物車已經清空了！");
    });
});

//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartDatas.length === 0) {
    alert("購物車目前沒有商品！");
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customertradeWay = document.querySelector("#tradeWay").value;
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    customertradeWay == ""
  ) {
    alert("請完整填寫資料！");
    return;
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: customertradeWay,
          },
        },
      }
    )
    .then(function (response) {
      alert("訂單建立成功！");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "";
      getCartList();
    });
});

init();

//util js

//千位數
function thousands(value) {
  if (value) {
    value += "";
    let arr = value.split(".");
    let re = /(\d{1,3})(?=(\d{3})+$)/g;
    return arr[0].replace(re, "$1,") + (arr.length == 2 ? "." + arr[1] : "");
  } else {
    return "";
  }
}
