<template>
  <v-app style="background-color: #C6D4FF;">
    <v-app-bar app color="primary" dark>
      <router-link to="/" class="d-flex align-center">
        <h1 style="color: white;">pAInt</h1>
      </router-link>

      <v-spacer></v-spacer>

      <v-badge color="orange" :content="cartCount" :value="cartCount" overlap>
        <router-link to="/cart">
          <v-icon>mdi-cart-outline</v-icon>
        </router-link>
      </v-badge>
    </v-app-bar>

    <v-main style="margin: 10px;">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",
  created() {
    this.$store.commit("restoreCart");
  },
  computed: {
    cartCount() {
      return this.$store.state.cart.length;
    }
  }
});
</script>
