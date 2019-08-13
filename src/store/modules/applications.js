import api from "@/utils/backend-api";
import { Application } from "@/models";
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
  application: new Application(),
  pagination: {},
  loading: true,
  mode: "",
  snackbar: false,
  notice: "",
};

const getters = {};

const actions = {
  getAllApplications ({ commit }) {
    commit("setLoading", { loading: true });
    api.getData("application/applicationcrmlist/").then(res => {
      const applications = res.data['detail'];
      commitPagination(commit, applications);
      commit("setLoading", { loading: false });
    });
  },
  searchApplications ({ commit }, searchQuery, pagination) {
    api.getData("application/applicationcrmlist/?" + searchQuery).then(res => {
      const applications = res.data['detail'];
      commitPagination(commit, applications);
    });
  },
  quickSearch ({ commit }, { headers, qsFilter, pagination }) {
    api.getData("application/applicationcrmlist/").then(res => {
      const applications = res.data['detail'].filter(r =>
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
      commitPagination(commit, applications);
    });
  },
  rejectApplication ({ commit, dispatch }, application) {
    api
    .putData("application/applicationcrmlist/" + application.id.toString() + "/", application)
    .then(res => {
      const application = res.data['detail'];
      commit("setApplication", { application });
      sendSuccessNotice(commit, "Application has been rejected.");
    })
    .catch(err => {
      console.log(err);
      sendErrorNotice(commit, "Operation failed! Please try again later. ");
      closeNotice(commit, 1500);
    });
  },
  passApplication ({ commit, dispatch }, application) {
    api
    .putData("application/applicationcrmlist/" + application.id.toString() + "/", application)
    .then(res => {
      const application = res.data['detail'];
      commit("setApplication", { application });
      sendSuccessNotice(commit, "Application has been approved.");
    })
    .catch(err => {
      console.log(err);
      sendErrorNotice(commit, "Operation failed! Please try again later. ");
      closeNotice(commit, 1500);
    });
  },
  closeSnackBar ({ commit }, timeout ) {
    closeNotice(commit, timeout);
  }
};

const mutations = {
  setItems (state, applications) {
    state.items = applications;
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
  setApplication (state, { application }) {
    state.application = application;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};
