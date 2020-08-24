<template>
  <div>
    <section>
      <v-parallax src="@/assets/parallax1.png" height="800">
        <v-layout column align-center class="white--text">
          <h1
            class="white--text mb-2 display-1 text-xs-center"
            style="font-weight: 900; text-shadow: 3px 2px #000000; margin-top: 200px;"
          >
            An Ultimate painting tool!
          </h1>
          <div
            class="white--text subheading mb-3 text-xs-center"
            style="font-weight: 900; text-shadow: 2px 2px #000000"
          >
            Unleash your creativity without limitations
          </div>
          <v-btn color="success mt-5"
            ><a
              :href="$store.state.baseURL + '/paint'"
              color="primary lighten-2 mt-5"
              style="color: white; text-decoration: none;"
              >Start Painting</a
            ></v-btn
          >
          <br />
          <router-link to="/gallery">
            <v-btn color="primary">Visit Gallery</v-btn>
          </router-link>
        </v-layout>
      </v-parallax>
    </section>

    <section>
      <v-layout column wrap class="my-5" align-center>
        <v-flex xs12 sm4 class="my-3">
          <div class="text-xs-center">
            <h2 class="headline">YOU + Artificial Intelligence</h2>
            <span class="subheading">
              No more restrictions, no more limits
            </span>
          </div>
        </v-flex>
        <v-flex xs12>
          <v-container grid-list-xl>
            <v-layout row wrap align-center>
              <v-flex xs12 md4>
                <v-card class="elevation-0 transparent">
                  <v-card-text class="text-xs-center">
                    <v-icon x-large class="blue--text text--lighten-2"
                      >Art completion</v-icon
                    >
                  </v-card-text>
                  <v-card-title primary-title class="layout justify-center">
                    <div class="headline text-xs-center">
                      Have AI finish your thought!
                    </div>
                  </v-card-title>
                  <v-card-text>
                    Draw a very rough sketch. Color the objects in the canvas
                    according to the colors given there. The AI will finish your
                    sketch by adding those objects
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 md4>
                <v-card class="elevation-0 transparent">
                  <v-card-text class="text-xs-center">
                    <v-icon x-large class="blue--text text--lighten-2"
                      >Artistic touch</v-icon
                    >
                  </v-card-text>
                  <v-card-title primary-title class="layout justify-center">
                    <div class="headline">Paint like Vincent Van Gogh!</div>
                  </v-card-title>
                  <v-card-text>
                    After studying a lot of paintings by various professionals,
                    it only makes sense that your painting can also be made to
                    look like one!
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 md4>
                <v-card class="elevation-0 transparent">
                  <v-card-text class="text-xs-center">
                    <v-icon x-large class="blue--text text--lighten-2"
                      >Your Style</v-icon
                    >
                  </v-card-text>
                  <v-card-title primary-title class="layout justify-center">
                    <div class="headline text-xs-center">
                      Paint like yourself!
                    </div>
                  </v-card-title>
                  <v-card-text>
                    To go with your art, you may upload any image. Styles and
                    colors from the image, are transferred to your painting!
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </section>

    <section>
      <v-parallax :src="imageLink.socialCover" height="400">
        <v-layout column align-center justify-center>
          <div class="headline white--text mb-3 text-xs-center">
            <p style="font-size: 1.5em;">
              Forged with
              <a
                style="color: white; text-decoration: none;"
                href="https://pytorch.org/"
                target="_blank"
                >PyTorch!</a
              >
              <br />
              <small>
                For the
                <a
                  style="color: white; text-decoration: none;"
                  href="https://pytorch2020.devpost.com/"
                  target="_blank"
                >
                  PyTorch Summer Hackathon 2020
                </a>
              </small>
            </p>
          </div>
        </v-layout>
      </v-parallax>
    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: function() {
    return {
      title: "Endorfine",
      imageLink: {
        socialCover:
          "https://firebasestorage.googleapis.com/v0/b/endorfinevue.appspot.com/o/assets%2Fo-NIGHTCLUB-facebook.jpg?alt=media&token=cefc5c4c-9714-41da-9c22-f63caf5e89a4"
      },
      email: "",
      emailRules: [
        v => {
          return !!v || "E-mail is required";
        },
        v =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      subscribed: false
    };
  },
  methods: {
    subscribe: function() {
      this.subscribed = !this.subscribed;
    }
  },

  computed: {
    imgHeight: function() {
      const offset = 320;
      console.log("new image height is " + (this.pageHeight - offset));
      return this.pageHeight - offset;
    }
  },

  mounted: function() {
    this.calculateHeight();
  }
};
</script>

<style scoped>
.finedTitle {
  font-weight: 900;
  text-shadow: 2px 2px #000000;
}

.social-icon {
  font-size: 21px;
  color: white;
}
</style>
