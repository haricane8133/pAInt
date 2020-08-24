import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cart: [] as Image[],
    // This will be later replaced with "http://localhost:3000"
    baseURL: "http://23.20.38.12" // indicates that the page itself was served from the same source
  },
  mutations: {
    addToCart(state: any, image: Image) {
      state.cart.push(image);
      if (typeof Storage !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },
    clearCart(state) {
      state.cart = [];
      if (typeof Storage !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },
    restoreCart(state) {
      if (typeof Storage !== "undefined") {
        const cartString = localStorage.getItem("cart");
        state.cart = JSON.parse(cartString !== null ? cartString : "[]");
      }
    }
  },
  actions: {},
  modules: {}
});

interface Image {
  name: string;
  src: string;
}
