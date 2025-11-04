let orderData = [];
const orderList = document.querySelector(".orderList");

//初始化
function init() {
  getOrderList();
}
init();

//圓餅圖

function renderC3() {
  //計算各類別銷售額並組成物件
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] === undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  //抓出類別名稱
  let categoryAry = Object.keys(total);
  //重組成C3需要的陣列格式
  let newData = [];
  categoryAry.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      colors: {
        床架: "#DACBFF",
        收納: "#9D7FEA",
        窗簾: "#5434A7",
        其他: "#301E5F",
      },
    },
  });
}

function renderC3_LV2() {
  //計算個產品銷售額並組成物件
  let productObj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (productObj[productItem.title] === undefined) {
        productObj[productItem.title] =
          productItem.price * productItem.quantity;
      } else {
        productObj[productItem.title] +=
          productItem.price * productItem.quantity;
      }
    });
  });

  //抓出類別名稱
  let productNameAry = Object.keys(productObj);
  //重組成C3需要的陣列格式
  let productSalesData = [];
  productNameAry.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(productObj[item]);
    productSalesData.push(ary);
  });
  //根據銷售額排序
  productSalesData.sort(function (a, b) {
    return b[1] - a[1];
  });
  //第四筆開始歸類為其他
  if (productSalesData.length > 3) {
    let otherSales = 0;
    productSalesData.forEach(function (item, index) {
      if (index > 2) {
        otherSales += productSalesData[index][1];
      }
    });
    productSalesData.splice(3, productSalesData.length - 1);
    productSalesData.push(["其他", otherSales]);
  }

  // C3.js
  c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: productSalesData,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}

//取得訂單資料
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders
`,
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then(function (response) {
      orderData = response.data.orders;

      //組訂單字串
      let str = "";
      orderData.forEach((item) => {
        //調整時間字串
        const thisTime = new Date(item.createdAt * 1000);
        const orderTime = `${thisTime.getFullYear()}/${
          thisTime.getMonth() + 1
        }/${thisTime.getDate()}`;

        //組產品字串
        let productStr = "";
        item.products.forEach((productItem) => {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });

        //判斷訂單處理狀態
        let orderStatus = "";
        if (item.paid === true) {
          orderStatus = "已付款";
        } else {
          orderStatus = "待付款";
        }

        str += `<tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                <p>${productStr}</p>
              </td>
              <td>${orderTime}</td>
              <td class="orderStatus">
                <a class="js-orderStatus" href="#" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除" />
              </td>
            </tr>`;
      });
      orderList.innerHTML = str;
      renderC3_LV2();
    });
}

//監聽 訂單狀態 與 刪除單筆訂單 按鍵
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  if (
    targetClass !== "js-orderStatus" &&
    targetClass !== "delSingleOrder-Btn"
  ) {
    return;
  }
  if (targetClass == "js-orderStatus") {
    let status = e.target.getAttribute("data-status");
    let id = e.target.getAttribute("data-id");
    changeOrderStatus(status, id);
  }
  if (targetClass == "delSingleOrder-Btn") {
    let id = e.target.getAttribute("data-id");
    deleteOrderItem(id);
  }
});

//修改訂單狀態
function changeOrderStatus(status, id) {
  let newStatus;
  if (status === true) {
    newStatus = false;
  } else {
    newStatus = true;
  }
  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders
`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("修改訂單狀態成功");
      getOrderList();
    });
}

//刪除單筆訂單
function deleteOrderItem(id) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}
`,
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("刪除成功");
      getOrderList();
    });
}

//刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/
`,
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("刪除全部訂單成功");
      getOrderList();
    })
    .catch(function (error) {
      alert("目前沒有訂單！");
    });
});
