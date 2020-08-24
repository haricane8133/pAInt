<template>
  <div class="home">
    <div v-if="isLoading && !isError">
      <h3>Hold on while the gallery is fetched!</h3>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-if="!isLoading && !isError">
      <h2>Gallery</h2>
      <p>View and purchase other people's art from here</p>

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
                                color="white"
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
                                color="white"
                                v-bind="attrs"
                                v-on="on"
                                icon
                              >
                                <v-icon
                                  :class="{ 'show-btns': hover }"
                                  color="black"
                                  v-on:click="edit(image.name)"
                                >
                                  mdi-draw
                                </v-icon>
                              </v-btn>
                            </template>
                            <span>Edit this Image!</span>
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

      <h4 v-if="isError">Refresh the page and try again...</h4>

      <v-btn
        v-if="images.length >= 24"
        elevation="23"
        :fixed="true"
        fab
        bottom
        right
        color="primary"
        @click="fetchImages"
        ><v-icon>
          mdi-autorenew
        </v-icon></v-btn
      >
    </div>

    <v-snackbar v-model="toast.show">
      {{ toast.text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="toast.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar v-model="toast2.show">
      Please tap "Edit"
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" v-bind="attrs" @click="toast.show = false">
          <a
            :href="$store.state.baseURL + '/paint/?startBlobURL=' + toast2.text"
            >Edit</a
          >
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import jszip from "jszip";
export default {
  name: "Gallery",
  data: function() {
    return {
      /**
       * {
       *    "name": Name of the image,
       *    "src": Object URL of the image,
       * }
       */
      images: [],
      isLoading: false,
      isError: false,
      theBlobURL: "",
      transparent: "rgba(255, 255, 255, 0)",
      toast: {
        show: false,
        text: ""
      },
      toast2: {
        show: false,
        text: ""
      }
    };
  },
  created() {
    this.fetchImages();
  },
  methods: {
    fetchImages() {
      this.images = [];
      this.isLoading = true;
      const xhttp = new XMLHttpRequest();
      xhttp.open("GET", `${this.$store.state.baseURL}/api/gallery`, true);
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
                      this.shuffleImages();
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
    shuffleImages() {
      this.images = this.images
        .map(a => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value);
    },
    addToCart(image) {
      this.$store.commit("addToCart", image);
      this.toast.text = "Added to cart";
      this.toast.show = true;
    },
    edit(name) {
      this.toast.text = "Hold on...";
      this.toast.show = true;
      const a = document.createElement("a");
      a.href = this.$store.state.baseURL + "/paint/?startBlobImg=" + name;
      a.click();
    }
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
