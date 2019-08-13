<template>
  <v-container fluid>
    <v-flex xs12 v-if="!loading">
      <v-card class="grey lighten-4 elevation-0">
        <v-card-title class="title">
          {{title}}
          <v-spacer></v-spacer>
          <!--<v-text-field append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>-->
          <v-btn fab small class="grey" @click.native="cancel()">
            <v-icon>cancel</v-icon>
          </v-btn>
          &nbsp;
          <v-btn fab small class="purple" @click.native="save()" :disabled="!isValid">
            <v-icon>save</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-container fluid grid-list-md>
            <v-layout row wrap class="px-10">
              <v-flex md4 xs12>
                <v-select required v-bind:items="categories" label="Category" v-model="product.category_id" :rules="rules.category" @change="selectCategory()" ></v-select>
              </v-flex>
              <v-flex md4 xs12>
                <v-text-field name="title" label="Title" hint="Product Title is required" value="Input text" v-model="product.menu"
                  class="input-group--focused" :rules="rules.name"></v-text-field>
              </v-flex>              
              <v-flex md4 xs12>
                <v-text-field name="productName" label="Product" hint="Product name is required" value="Input text" v-model="product.title"
                  class="input-group--focused" required :rules="rules.name"></v-text-field>
              </v-flex>
              <v-flex md4 xs12>
                <v-select required v-bind:items="items" label="IS Platform" v-model="product.is_platform" :rules="rules.platform" ></v-select>
              </v-flex>              
              <v-flex md4 xs12>
                <v-text-field name="unitPrice" prefix="CHY" label="Price" hint="Price is required" value="Input text" v-model="product.price"
                  class="input-group--focused" required></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap class="px-10" id="attrs" v-for="(attr) in attrs" v-bind:key="attr.id">
              <v-flex md4 xs12>
                <v-text-field :name="attr.name" :label="attr.title"  value="Input text" v-model="attr.value"
                  class="input-group--focused" required></v-text-field>
              </v-flex>
            </v-layout>        
          </v-container>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-snackbar v-if="loading===false" :right="true" :timeout="timeout" :color="mode" v-model="snackbar" >
      {{ notice }}
      <v-btn dark flat @click.native="closeSnackbar">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>
<script>
import {Product} from '../models'
import { mapState, dispatch } from 'vuex'
/* global Store */
export default {
  data () {
    return {
      init: true,
      items: [{"value": true, "text": "Yes"}, {"value": false, "text": "No"}],
      errors: [],
      title: '',
      snackbarStatus: false,
      timeout: 3000,
      color: '',
      rules: {
        name: [val => (val || '').length > 0 || 'This field is required'],
        category: [val => typeof val === "number" || 'This field is required'],
        platform: [val => typeof val === "boolean" || 'This field is required']
      },
    }
  },
  methods: {
    save () {
      const product = Object.assign({}, this.product);
      product.attrs = this.attrs

      Store.dispatch('products/saveProduct', product)
        .then(() => {
          Store.dispatch("products/closeSnackBar", 2000)
        })
    },
    selectCategory () {
      this.init = false;
    },
    getProduct () {
      Store.dispatch('products/getProductById', this.$route.params.id)
    },
    getCategories () {
      Store.dispatch('products/getCategories')
    },
    cancel () {
      this.$router.push({ name: 'Products' })
    },
    getAttrs () {
      const attrs = Object.assign({}, this.product.attrs);
      delete this.product.attrs
      Store.dispatch('products/getAttrs', this.product.category_id, attrs)
    }
  },
  watch: {
      "product.category_id": function() {
          console.log(this.init);
          if (!this.init) {
            this.getAttrs()
          }
      }
  },
  computed: {
        ...mapState('products',
        {
          product: 'product',
          categories: 'categories',
          loading: 'loading',
          mode: 'mode',
          snackbar: 'snackbar',
          notice: 'notice',
          schemas: 'schemas',
          attrs: 'attrs',
        }),
        isValid () {
          return this.product.category && this.product.title
        }
    },
  created () {
    this.getCategories()
    this.getProduct()
  },
  mounted () {
      if (this.$route.params.id) {
        this.title = 'Edit Product'
      } else this.title = 'New Product'
  }
}
</script>
