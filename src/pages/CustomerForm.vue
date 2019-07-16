<template>
  <v-container fluid>
    <v-flex xs12>
      <v-card class="grey lighten-4 elevation-0">
        <v-card-title class="title">
          {{cn_name}}
          <v-spacer></v-spacer>
          <v-btn fab small class="grey" @click.native="cancel()">
            <v-icon>cancel</v-icon>
          </v-btn>
          &nbsp;
          <v-btn fab small class="purple" @click.native="save()">
            <v-icon>save</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="loading !== true">
          <v-container fluid grid-list-sm>
            <v-layout row wrap>
              <v-flex md3 sm12 >
                <img class="profile" />
              </v-flex>
              <v-flex md9 sm12>
                <v-container fluid grid-list-sm>
                  <v-layout row wrap>
                    <v-flex md4 sm12 xs12  class="mx-1 px-0">
                      <v-text-field name="cn_name" label="Name" hint="Name is required" value="Input text" v-model="customer.cn_name"
                        class="input-group--focused" required></v-text-field>
                    </v-flex>
                    <v-flex md4 sm12  xs12 class="mx-1 px-0">
                      <v-text-field name="email" type="email" label="Email" value="Input text" v-model="customer.email" v-bind:rules="rules.email"
                        class="input-group--focused" required></v-text-field>
                    </v-flex>
                    <v-flex md4 sm12 xs12 class="mx-1 px-0">
                      <v-text-field name="linkman" type="text" label="Liaison" v-model="customer.linkman" class="input-group--focused" required></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-container>
</template>
<script>
  /* global Store */
  import { mapState, dispatch } from 'vuex'
  export default {
    data() {
      return {
        cn_name: '',
        rules: {
          email: [() => {
            /* eslint-disable no-useless-escape */
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            if (this.customer && !re.test(this.customer.email)) return 'Email is invalid.'
            return true;
          }]
        }
      }
    },
    computed: {
      ...mapState('customers', {
        orders: 'orders',
        customer: 'customer',
        loading: 'loading',
        mode: 'mode',
        snackbar: 'snackbar',
        notice: 'notice',
      }),
    },
    methods: {
      save() {
        const customer = { ...this.customer }
        // delete order.customer
        console.log(customer)
        Store.dispatch('customers/saveCustomer', customer)
          .then(() => {
            Store.dispatch("customers/closeSnackBar", 2000)
          })
      },
      cancel() {
        this.$router.push({ name: 'Customers' })
      },
      closeSnackbar() {
        Store.commit("customers/setSnackbar", { snackbar: false });
        Store.commit("customers/setNotice", { notice: "" });
      },
    },
    created() {
      Store.dispatch('customers/getCustomerById', this.$route.params.id)
    },
    mounted() {
      if (this.$route.params.id) {
        this.title = 'Edit Customer'
      } else this.title = 'New Customer'
    }
  }
</script>
<style>
  .profile {
    max-width: 160px;
  }
</style>
