<template>
  <div>
    <v-container fill-height fluid>
      <v-row style="height: 50%;" align="center" justify="center">
        <h1>Thank you</h1>
        <p>for using <b>pAInt</b></p>
      </v-row>
    </v-container>
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
import { saveAs } from "file-saver";
export default {
  name: "Checkout",
  data: function() {
    return {
      toast: {
        show: false,
        text: ""
      }
    };
  },
  async created() {
    const zip = new jszip();
    let i = 1;
    for (const image of this.$store.state.cart) {
      zip.file(
        `${i.toString()}.png`,
        await fetch(image.src).then(r => r.blob())
      );
      i += 1;
    }
    zip.generateAsync({ type: "blob" }).then(
      // 1) generate the zip file
      blob => {
        this.$store.commit("clearCart");
        saveAs(blob, "art.zip"); // 2) trigger the download
      },
      function(err) {
        this.toast.text = "Error - " + err.toString();
        this.toast.show = true;
        throw err;
      }
    );
  }
};
</script>
