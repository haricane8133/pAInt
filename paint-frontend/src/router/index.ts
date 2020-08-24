import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import Gallery from "../views/Gallery.vue";
import Variations from "../views/Variations.vue";
import Artistic from "../views/Artistic.vue";
import Cart from "../views/Cart.vue";
import Checkout from "../views/Checkout.vue";

import NotFound from "../components/NotFound.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/home",
    name: "Home",
    component: Home
  },
  {
    path: "/variations",
    name: "Variations",
    component: Variations
  },
  {
    path: "/artistic",
    name: "Artistic",
    component: Artistic
  },
  {
    path: "/gallery",
    name: "Gallery",
    component: Gallery
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout
  },
  { path: "*", component: NotFound }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
