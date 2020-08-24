<template>
  <div class="home">
    <div v-if="isLoading && !isError">
      <h3>Hold on while AI "artistifies" your art!</h3>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-if="!isLoading && !isError">
      <h2>Your Artistic Art!</h2>
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
                                  v-on:click="addToGallery(image.src)"
                                >
                                  mdi-plus-box-multiple
                                </v-icon>
                              </v-btn>
                            </template>
                            <span>Submit art to Gallery</span>
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
    </div>

    <h4 v-if="isError">Refresh the page and try again...</h4>

    <v-switch v-model="custom" label="Custom Image"></v-switch>
    <!-- CUSTOM ARTISTIC -->
    <template v-if="custom">
      <h4>
        Provide an image from which styles are transferred to your art
      </h4>
      <v-file-input
        v-model="customImage"
        chips
        show-size
        accept="image/png"
        label="Custom image (<= 10MB)"
      ></v-file-input>

      <v-btn
        class="ma-2"
        color="success"
        :disabled="customImage === null || isLoading"
        @click="customArtistic"
      >
        Let's go!
        <v-icon dark right>mdi-checkbox-marked-circle</v-icon>
      </v-btn>
      <br />
      <small>Refresh the page to go back to automatic artistic styler</small>
    </template>

    <!-- TOAST -->
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
  name: "Artistic",
  data: function() {
    return {
      /**
       * {
       *    "name": Name of the image,
       *    "src": Object URL of the image
       * }
       */
      images: [],
      isError: false,
      isLoading: false,

      custom: false,
      customImage: null,

      transparent: "rgba(255, 255, 255, 0)",
      toast: {
        show: false,
        text: ""
      }
    };
  },
  created() {
    this.artistic();
  },
  methods: {
    artistic() {
      const id = this.$route.query.id;
      const sel = this.$route.query.sel;
      this.images = [];
      this.isLoading = true;
      const xhttp = new XMLHttpRequest();
      xhttp.open(
        "GET",
        `${this.$store.state.baseURL}/api/artistic?id=${id}&sel=${sel}`,
        true
      );
      xhttp.responseType = "blob";
      xhttp.onload = oEvent => {
        jszip
          .loadAsync(xhttp.response)
          .then(extractedZip => {
            for (const fileName of Object.keys(extractedZip.files)) {
              extractedZip
                .file(fileName)
                .async("blob")
                .then(blob => {
                  this.images.push({
                    name: fileName,
                    src: URL.createObjectURL(blob)
                  });
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
            "&type=artistic&filename=" +
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
    customArtistic() {
      const id = this.$route.query.id;
      const sel = this.$route.query.sel;
      this.images = [];
      this.isLoading = true;
      const formData = new FormData();
      formData.append("file", this.customImage);
      const xhttp = new XMLHttpRequest();
      xhttp.open(
        "POST",
        `${this.$store.state.baseURL}/api/artistic?id=${id}&sel=${sel}`,
        true
      );
      xhttp.responseType = "blob";
      xhttp.onload = oEvent => {
        jszip
          .loadAsync(xhttp.response)
          .then(extractedZip => {
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
                  this.toast.text = "Error - Check the image";
                  this.toast.show = true;
                  throw error;
                });
            }
          })
          .catch(error => {
            this.isError = true;
            this.isLoading = false;
            this.toast.text = "Error - Check the image";
            this.toast.show = true;
            throw error;
          });
      };
      xhttp.send(formData);
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
