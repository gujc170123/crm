// import api from "@/utils/demo-api";
import api from "@/utils/backend-api";
import {Order, OrderDetail} from "@/models";
import {
  sendSuccessNotice,
  sendErrorNotice,
  closeNotice,
  getDefaultPagination,
  commitPagination,
} from "@/utils/store-util.js";

import { get } from "lodash";

const state = {
  items: [],
  pagination: {},
  // page: 0,
  // pages: 0,
  loading: false,
  mode: "",
  snackbar: false,
  notice: "",
  order: new Order(),
  customer: "",
  products: [],
  customers: [],
  categories: [],
};


const getters = {
};

const actions = {
  getCustomers ({ commit }) {
    api.getData("application/customerlist/").then(res => {
       if (res.data){
        const customers = res.data['detail'].map(c => {
          c.text = c.cn_name;
          c.value = c.id;
          return c;
        });
        commit("setCustomers", customers);
       }
    });
  },
  getCategories ({ commit }) {
    api.getData("sales/categorylist/").then(res => {
       if (res.data['detail'] && res.data['detail'].length > 0){
        const categories = res.data['detail'].map(c => {
          c.text = c.name;
          c.value = c.id;
          return c;
        });
        commit("setCategories", categories);
       }
    });
  },
  getOrderById ({ commit }, id) {
    if (id) {
      api.getData("sales/orderlist/" + id + "/?_expand=customer").then(
        res => {
          const order = res.data['detail'];
          order.products.filter(p => p !== null && p !== undefined)
          order.enterprise_id = order.enterprise.id;
          commit("setOrder", { order })
        },
        err => {
          console.log(err);
        }
      );
    } else {
      commit("setOrder", { order: new Order() });
    }
  },
  getProductsByCategory ({ commit }, categoryId) {
    if (categoryId) {
      api.getData("sales/productlist/?_expand=category&category_id=" + categoryId).then(res => {
          const products = res.data['detail'].map(p => {
            p.text = p.title
            p.value = p.id
            return p
          })
          console.log(products)
          commit("setProducts",  products);
        }, err => {
          console.log(err);
        });
    }
  },
  getAllOrders ({ commit }) {
    commit("setLoading", { loading: true });
    api.getData("sales/orderlist/?_expand=customer").then(res => {
      const orders = res.data['detail'];
      orders.forEach(item => {
        // item.amount = item.products.reduce(( p, c ) => p + ((c && c.subtotal) || 0), 0);
        item.quantity = item.products.length;
        item.customer = item.enterprise ? item.enterprise.cn_name : "";
      });
      commitPagination(commit, orders);
      commit("setLoading", { loading: false });
    });
  },
  searchOrders ({ commit }, searchQuery, pagination) {
    api.getData("sales/orderlist/?_expand=customer&" + searchQuery).then(res => {
      const orders = res.data['detail'];
      orders.forEach(item => {
        // item.amount = item.products.reduce((p, c) => p + c.subtotal, 0);
        item.quantity = item.products.length;
        item.customer = item.customer ? item.enterprise.cn_name : "";
      });
      commitPagination(commit, orders);
    });
  },
  quickSearch ({ commit }, { headers, qsFilter, pagination }) {
    // TODO: Following solution should be replaced by DB full-text search for production
    api.getData("sales/orderlist/?_expand=customer").then(res => {
      const orders = res.data['detail'].filter(r => headers.some(header => {
          const val = get(r, [header.value]);
          return (val && val
                .toString()
                .toLowerCase()
                .includes(qsFilter)) || false;
        }));
      orders.forEach(item => {
        let amount = 0;
        item.products.forEach(e => {
          amount += e.unitPrice;
        });
        item.amount = amount;
        item.quantity = item.products.length;
        item.customer = item.customer ? item.customer.firstName + " " + item.customer.lastName : "";
      });
      commitPagination(commit, orders);
    });
  },
  deleteOrder ({ state, commit, dispatch }, id) {
    return api
      .deleteData("sales/orderlist/" + id.toString() + "/")
      .then(res => {
        return new Promise((resolve, reject) => {
          sendSuccessNotice(commit, "Operation is done.");

          resolve();
        });
      })
      .catch(err => {
          console.log(err);
          sendErrorNotice(commit, "Operation failed! Please try again later. ");
          closeNotice(commit, 1500);
      });
  },
  addProductToOrder ({ commit, state }, prod) {
    if (prod.productId){
      const  products = state.order.products || [];
      const  orderdetail = new OrderDetail()
      const  product = state.products.find(p => p.id === prod.productId)
      orderdetail.sku = prod.productId
      orderdetail.sku_name = product.title
      orderdetail.price = product.price
      orderdetail.number = prod.number
      orderdetail.subtotal = product.price * prod.number
      products.push(orderdetail)
      commit("setOrderProducts", products)
    }
  },
  deleteProduct ({ commit }, product) {
    if (product){
      const { products } = state.order;
      products.splice(products.findIndex(p => p.id === product.id), 1)
      commit("setOrderProducts", products);
    }
  },
  saveOrder ({ commit, dispatch }, order) {
    // delete order;
    if (!order.id) {
      api
        .postData("sales/orderlist/", order)
        .then(res => {
          const order = res.data['detail'];
          order.enterprise_id = order.enterprise.id;
          commit("setOrder", { order });
          sendSuccessNotice(commit, "New order has been added.");
        })
        .catch(err => {
          console.log(err);
          sendErrorNotice(commit, "Operation failed! Please try again later. ");
          closeNotice(commit, 1500);
        });
    } else {
      api
        .putData("sales/orderlist/" + order.id.toString() + "/", order)
        .then(res => {
          const order = res.data['detail'];
          order.enterprise_id = order.enterprise.id;
          commit("setOrder", { order });
          sendSuccessNotice(commit, "Order has been updated.");
        })
        .catch(err => {
          console.log(err);
          sendErrorNotice(commit, "Operation failed! Please try again later. ");
          closeNotice(commit, 1500);
        });
    }
  },
  closeSnackBar ({ commit }, timeout ) {
     closeNotice(commit, timeout);
  }
};

const mutations = {
  setCustomers (state, customers) {
    state.customers = customers;
  },
  setCategories (state, categories) {
    state.categories = categories;
  },
  setProducts (state, products) {
    console.log(products)
    state.products = products
  },
  setOrderProducts (state, products) {
    state.order.products = products;
    state.order.order_amount = products.reduce((p, c) => p + c.subtotal, 0);
  },
  setItems (state, orders) {
    state.items = orders;
  },
  setPagination (state, pagination) {
    state.pagination = pagination;
  },
  setLoading (state, { loading }) {
    state.loading = loading;
  },
  setNotice (state, { notice }) {
    console.log(" notice .... ", notice);
    state.notice = notice;
  },
  setSnackbar (state, { snackbar }) {
    state.snackbar = snackbar;
  },
  setMode (state, { mode }) {
    state.mode = mode;
  },
  setOrder (state, {order}) {
    state.order = order
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
