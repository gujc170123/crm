/* globals Store */
// import api from "@/utils/demo-api";
import api from "@/utils/backend-api";
import {Product} from "@/models";
import {
  sendSuccessNotice,
  sendErrorNotice,
  closeNotice,
  getDefaultPagination,
  commitPagination
} from "@/utils/store-util.js";
import {get} from "lodash"

const state = {
  items: [],
  pagination: getDefaultPagination(),
  loading: false,
  mode: "",
  snackbar: false,
  notice: "",
  product: new Product(),
  categories: [],
  attrs: [],
};

const getters = {
};

const actions = {
  getCategories ({ commit }) {
    api.getData("sales/categorylist/").then(res => {
      const categories = [];
      res.data['detail'].forEach(c => {
        const category = { ...c };
        category.text = c.name;
        category.value = c.id;
        categories.push(category);
      });
      commit("setCategories", categories);
    });
  },
  getAttrs ({ commit }, id, attrs) {
    if (id) {
      if (attrs){
        commit("setAttrs", attrs);
      }
      else {
        api.getData("sales/schemalist/?category_id=" + id).then(res => {
          const attrs = []
          res.data['detail'].forEach(c => {
            const attr = {};
            attr.id = c.id
            attr.title = c.title;
            attr.name = c.name;
            attr.value = null;
            attrs.push(attr);
          });
        commit("setAttrs", attrs);
      })}}
    else {
      commit("setAttrs", []);
    }
  },
  getProductById ({ commit }, id) {
    if (id) {
      commit("setLoading", { loading: true });
      api.getData("sales/productlist/" + id + "?_expand=category").then(
        res => {
          const product = res.data['detail'];
          commit("setProduct", { product });
          commit("setAttrs", product.attrs);
        },
        err => {
          console.log(err);
        }
      );
      commit("setLoading", { loading: false });
    } else {
      commit("setProduct", { product: new Product() });
    }
  },
  getAllProducts ({ commit }) {
    commit("setLoading", { loading: true });
    api.getData("sales/productlist/?_expand=category").then(res => {
      const products = res.data['detail'];
      products.forEach(p => {
        p.categoryName = p.category.name;
      });
      commitPagination(commit, products);
      commit("setLoading", { loading: false });
    });
  },
  searchProducts ({ commit }, searchQuery) {
    api.getData("sales/productlist/?_expand=category&" + searchQuery).then(res => {
      const products = res.data['detail'];
      products.forEach(p => {
        p.categoryName = p.category.name;
      });
      commitPagination(commit, products);
    });
  },
  quickSearch ({ commit }, { headers, qsFilter, pagination }) {
    api.getData("sales/productlist/?_expand=category").then(res => {
      const products = res.data['detail'].filter(r =>
        headers.some(header => {
          const val = get(r, [header.value]);
          return (
            (val &&
              val
                .toString()
                .toLowerCase()
                .includes(qsFilter)) ||
            false
          );
        })
      );
      products.forEach(p => {
        p.categoryName = p.category.categoryName;
      });
      commitPagination(commit, products);
    });
  },
  deleteProduct ({ commit, dispatch }, id) {
    return api
      .deleteData("sales/productlist/" + id.toString() + "/")
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
  saveProduct  ({ commit, dispatch }, product) {
    if (!product.id) {
      api
        .postData("sales/productlist/", product)
        .then(res => {
          const product = res.data['detail'];
          commit("setProduct", { product });
          sendSuccessNotice(commit, "New product has been added.");
          closeNotice(commit, 1500);
        })
        .catch(err => {
          console.log(err);
          sendErrorNotice(commit, "Operation failed! Please try again later. ");
          closeNotice(commit, 1500);
        });
    } else {
      api
        .putData("sales/productlist/" + product.id.toString() + "/", product)
        .then(res => {
          const product = res.data['detail'];
          commit("setProduct", { product });
          sendSuccessNotice(commit, "Product has been updated.");
          closeNotice(commit, 1500);
        })
        .catch(err => {
          console.log(err);
          sendErrorNotice(commit, "Operation failed! Please try again later. ");
          closeNotice(commit, 1500);
        });
    }
  },
  closeSnackBar ({ commit }, timeout) {
    closeNotice(commit, timeout);
  },
};

const mutations = {
  setCategories (state, categories) {
    state.categories = categories;
  },
  setItems (state, products) {
    state.items = products;
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
  setProduct (state, {product}) {
    state.product = product;
  },
  setAttrs (state, attrs) {
    state.attrs = attrs;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
