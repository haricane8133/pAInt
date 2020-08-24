<template>
  <div class="home">
    <v-container class="text-center">
      <v-row>
        <v-col
          ><h2 v-if="cart.length !== 0">Your Cart</h2>
          <h3 v-if="cart.length === 0">
            Fill your cart with some art!
          </h3></v-col
        >
      </v-row>
    </v-container>

    <v-container class="text-center">
      <v-row>
        <template v-for="image in cart">
          <v-col :key="image.name">
            <v-hover v-slot:default="{ hover }">
              <v-card
                :elevation="hover ? 23 : 2"
                class="on-hover"
                height="256"
                width="256"
              >
                <v-img
                  :src="image.src"
                  alt="An image from the gallery"
                  height="256px"
                  width="256px"
                >
                </v-img>
              </v-card>
            </v-hover>
          </v-col>
        </template>
      </v-row>
    </v-container>

    <router-link to="/checkout" v-if="cart.length !== 0">
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            elevation="23"
            :fixed="true"
            fab
            bottom
            right
            color="success"
            ><v-icon>
              mdi-check-all
            </v-icon></v-btn
          ></template
        ><span>Checkout</span></v-tooltip
      ></router-link
    >
  </div>
</template>

<script>
export default {
  name: "Cart",
  computed: {
    cart() {
      // const cart = this.$store.state.cart;
      // for (const image of cart) {
      //   image.src = URL.createObjectURL(image.blob);
      // }
      // return cart;

      return this.$store.state.cart;
    }
  }
};
</script>
