<template>
  <div class="home">
    <div v-if="isLoading && !isError">
      <h3>Hold on while AI completes your art!</h3>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-if="!isLoading && !isError">
      <h2>Your art augmented!</h2>
      <v-container class="text-center">
        <v-row>
          <template v-for="image in images">
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
                    <v-card-actions style="margin-top: 200px;">
                      <v-row
                        class="fill-height flex-column"
                        justify="space-between"
                      >
                        <div class="align-self-bottom">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                :class="{ 'show-btns': hover }"
                                color="black"
                                v-bind="attrs"
                                v-on="on"
                                icon
                              >
                                <v-icon
                                  :class="{ 'show-btns': hover }"
                                  color="black"
                                  v-on:click="addToCart(image)"
                                >
                                  mdi-cart-plus
                                </v-icon>
                              </v-btn>
                            </template>
                            <span>Add to cart</span>
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                :class="{ 'show-btns': hover }"
                                color="black"
                                v-bind="attrs"
                                v-on="on"
                                icon
                              >
                                <v-icon
                                  :class="{ 'show-btns': hover }"
                                  color="black"
                                  v-on:click="artistic(image.name)"
                                >
                                  mdi-brush
                                </v-icon>
                              </v-btn>
                            </template>
                            <span>Provide Artistic touch</span>
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                :class="{ 'show-btns': hover }"
                                color="black"
                                v-bind="attrs"
                                v-on="on"
                                icon
                              >
                                <v-icon
                                  :class="{ 'show-btns': hover }"
                                  color="black"
                                  v-on:click="addToGallery(image.src)"
                                >
                                  mdi-plus-box-multiple
                                </v-icon>
                              </v-btn>
                            </template>
                            <span>submit art to Gallery</span>
                          </v-tooltip>
                        </div>
                      </v-row>
                    </v-card-actions>
                  </v-img>
                </v-card>
              </v-hover>
            </v-col>
          </template>
        </v-row>
      </v-container>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <router-link
            v-if="currentPage < 5"
            v-bind="attrs"
            v-on="on"
            :to="
              `/variations?id=${$route.query.id}&page=${(
                Number.parseInt(currentPage) + 1
              ).toString()}`
            "
          >
            <v-btn
              elevation="23"
              :fixed="true"
              fab
              bottom
              right
              color="primary"
            >
              <v-icon>
                mdi-autorenew
              </v-icon>
            </v-btn>
          </router-link>
        </template>
        <span>See more variants!</span>
      </v-tooltip>
    </div>

    <h4 v-if="isError">Refresh the page and try again...</h4>

    <v-snackbar v-model="toast.show">
      {{ toast.text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="toast.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import jszip from "jszip";
import axios from "axios";
export default {
  name: "Variations",
  data: function() {
    return {
      /**
       * {
       *    "name": Name of the image,
       *    "src": DataURL of the image (contains the image itself)
       * }
       */
      images: [],
      isError: false,
      isLoading: false,
      transparent: "rgba(255, 255, 255, 0)",
      currentPage: 1,
      toast: {
        show: false,
        text: ""
      }
    };
  },
  created() {
    this.fetchImages(Number.parseInt(this.$route.query.page));
  },
  methods: {
    fetchImages(pageNo) {
      this.currentPage = pageNo;
      if (isNaN(this.currentPage) || this.currentPage < 1) {
        this.currentPage = 1;
      }
      const id = this.$route.query.id;
      this.images = [];
      this.isLoading = true;
      const xhttp = new XMLHttpRequest();
      xhttp.open(
        "GET",
        `${this.$store.state.baseURL}/api/variations?id=${id}&page=${this.currentPage}`,
        true
      );
      xhttp.responseType = "blob";
      xhttp.onload = oEvent => {
        jszip
          .loadAsync(xhttp.response)
          .then(extractedZip => {
            if (Object.keys(extractedZip.files).length === 0) {
              this.isLoading = false;
              return;
            }
            for (const fileName of Object.keys(extractedZip.files)) {
              extractedZip
                .file(fileName)
                .async("blob")
                .then(blob => {
                  const reader = new FileReader();
                  reader.addEventListener(
                    "load",
                    () => {
                      // convert image file to base64 string
                      this.images.push({
                        name: fileName,
                        src: reader.result
                      });
                    },
                    false
                  );

                  if (blob) {
                    reader.readAsDataURL(blob);
                  }
                  this.isLoading = false;
                })
                .catch(error => {
                  this.isError = true;
                  this.isLoading = false;
                  this.toast.text = "Error - " + error.toString();
                  this.toast.show = true;
                  throw error;
                });
            }
          })
          .catch(error => {
            this.isError = true;
            this.isLoading = false;
            this.toast.text = "Error - " + error.toString();
            this.toast.show = true;
            throw error;
          });
      };
      xhttp.send();
    },
    addToCart(blob) {
      this.$store.commit("addToCart", blob);
      this.toast.text = "Added to cart";
      this.toast.show = true;
    },
    async addToGallery(src) {
      const formData = new FormData();
      formData.append("file", await fetch(src).then(r => r.blob()));
      axios
        .post(
          this.$store.state.baseURL +
            "/api/gallery?id=" +
            this.$route.query.id +
            "&type=variations&filename=" +
            name,
          formData
        )
        .then(response => {
          this.toast.text = "Congrats! Your art is now in the gallery";
          this.toast.show = true;
        })
        .catch(error => {
          this.toast.text = error.toString();
          this.toast.show = true;
        });
    },
    artistic(name) {
      this.$router.push(
        "/artistic?id=" +
          this.$route.query.id +
          "&sel=" +
          name.substring(0, name.length - 4)
      );
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.fetchImages(to.query.page);
    next();
  }
};
</script>

<style scoped>
.v-card {
  transition: opacity 0.4s ease-in-out;
}

.v-card:not(.on-hover) {
  opacity: 0.6;
}

.show-btns {
  color: rgba(255, 255, 255, 1) !important;
}
</style>
