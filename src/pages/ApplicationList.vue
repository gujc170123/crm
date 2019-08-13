<template>
  <v-container fluid>
    <v-flex xs12>
      <v-card>
             <v-card-title>
            <span class="title">Application {{pagination? "("+pagination.totalItems+")": ""}}
              <v-text-field append-icon="search" label="Quick Search" single-line hide-details v-model="quickSearch"></v-text-field>
            </span>
            <v-spacer></v-spacer>
            <v-btn class="blue-grey" fab small dark @click.native.stop="rightDrawer = !rightDrawer">
              <v-icon>search</v-icon>
            </v-btn>
            <v-btn class="brown lighten-1" fab small dark @click.native="reloadData()">
              <v-icon>refresh</v-icon>
            </v-btn>
            <v-btn class="teal darken-2" fab small dark @click.native="print()">
              <v-icon>print</v-icon>
            </v-btn>
          </v-card-title>
        <Table v-if="loading===false" :headers="headers" :items="items"  :pagination="pagination" @reject="reject" @pass="pass"></Table>
      </v-card>
    </v-flex>
    <search-panel :rightDrawer="rightDrawer" @cancelSearch="cancelSearch" @searchData="searchApplications">
      <v-layout row>
          <v-flex xs11 offset-xs1>
              <v-text-field name="input-1-3" label="Name" light v-model="searchVm.contains.cn_name"></v-text-field>
          </v-flex>
      </v-layout>
    </search-panel>
    <confirm-dialog :dialog="dialog" :dialogTitle="dialogTitle" :dialogText="dialogText" @onConfirm="onConfirm" @onCancel="onCancel" ></confirm-dialog>
    <v-snackbar v-if="loading===false" :right="true" :timeout="timeout" :color="mode" v-model="snackbar" >
        {{ notice }}
        <v-btn dark flat @click.native="closeSnackbar">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>
<script>
/* globals Store */
import Table from "@/components/TableCheck.vue";
import SearchPanel from "@/components/SearchPanel.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { mapState } from "vuex";
import { debounce } from "lodash";

export default {
  components: {
    Table,
    SearchPanel,
    ConfirmDialog
  },
  data () {
    return {
      dialog: false,
      dialogTitle: "Application Reject Dialog",
      dialogText: "Do you want to reject this application?",
      rightDrawer: false,
      right: true,
      search: '',
      headers: [
        {text: 'Apply Date', left: true, value: 'applydate'},
        {text: 'Progress', value: 'progress_text'},
        {text: 'Email', value: 'applier.mail'},
        {text: 'Company', value: 'applier.title'},
        {text: 'Industry', value: 'applier.industry_text'},
        {text: 'Source', value: 'applier.source_text'},
      ],
      // items: [],
      searchVm: {
        contains: {
          progress: null,
        },
      },
      query: "",
      applicationId: "",
      snackbarStatus: false,
      timeout: 2000,
      color: "",
      quickSearchFilter: "",
    }
  },
  methods: {
    print () {
      window.print()
    },
    pass (item) {
      const application = {"id": item.id, "progress": 2}
      Store.dispatch(
        "applications/passApplication", application).then(() => {
        Store.dispatch("applications/searchApplications", this.query, this.pagination);
        Store.dispatch("applications/closeSnackBar", 2000);
      });
    },
    reject (item) {
      this.applicationId = item.id;
      this.dialog = true;
    },
    onConfirm () {
      const application = {"id": this.applicationId, "progress": 3}
      Store.dispatch(
        "applications/rejectApplication", application).then(() => {
        Store.dispatch("applications/searchApplications", this.query, this.pagination);
        Store.dispatch("applications/closeSnackBar", 2000);
      });
      this.dialog = false;
    },
    onCancel () {
      this.orderId = "";
      this.dialog = false;
    },
    searchApplications () {
      this.rightDrawer = !this.rightDrawer;
      this.appUtil.buildSearchFilters(this.searchVm);
      this.query = this.appUtil.buildJsonServerQuery(this.searchVm);
      this.quickSearch = "";
      Store.dispatch("applications/searchApplications", this.query, this.pagination);
    },
    clearSearchFilters () {
      this.rightDrawer = !this.rightDrawer
      this.appUtil.clearSearchFilters(this.searchVm)
      this.api.getData('sales/customers/').then((res) => {
        this.items = res.data
        this.items.forEach((item) => {
          if (item.orders && item.orders.length) {
            item.orderAmount = item.orders.length
          } else {
            item.orderAmount = 0
          }
        })
        this.pagination.totalItems = this.items.length
        console.log(this.items)
      }, (err) => {
        console.log(err)
      })
    },
    reloadData () {
      this.query = "";
      Store.dispatch("applications/getAllApplications");
    },
    cancelSearch () {
      this.rightDrawer = false;
    },
    closeSnackbar () {
      Store.commit("applications/setSnackbar", { snackbar: false });
      Store.commit("applications/setNotice", { notice: "" });
    },
    quickSearchApplications: debounce(function () {
      console.log(this.quickSearchFilter)
      this.quickSearchFilter && Store.dispatch("applications/quickSearch",
       { headers: this.headers,
         qsFilter: this.quickSearchFilter.toLowerCase(),
         pagination: this.pagination });
    }, 300),
  },
  computed: {
    ...mapState("applications", {
      items: "items",
      pagination: "pagination",
      loading: "loading",
      mode: "mode",
      snackbar: "snackbar",
      notice: "notice"
    }),
    quickSearch: {
      get: function () {
        return this.quickSearchFilter;
      },
      set: function ( val ) {
        this.quickSearchFilter = val;
        this.quickSearchFilter && this.quickSearchApplications();
      }
    }
  },
  created () {
    Store.dispatch("applications/getAllApplications")
  },
  mounted () {
  }
}
</script>
