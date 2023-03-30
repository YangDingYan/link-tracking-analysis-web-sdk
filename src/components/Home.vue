<template>
  <div>Home</div>
  <button @click="handleClick1">业务请求1</button>
  <h4>{{ click1Data }}</h4>
  <button @click="handleClick2">业务请求2</button>
  <h4>{{ click2Data }}</h4>
</template>

<script lang="ts">
import {Vue} from "vue-class-component";
import axios from "@/axios/index";
import { proxyHttp } from "@/axios/index";

export default class Home extends Vue {
  click1Data:any = null;
  click2Data:any = null;

  handleClick1() {
    // axios({url: "/demo/v1/3333", method: "get"})
    axios.get("/demo/v1/3333")
    .then(response => {
      this.click1Data = response.data;
      return;
    })
    .catch(error => {
      return;
    })
  }

  async handleClick2() {
    const result = await proxyHttp.get("/demo/v2", null, ["4444"]);
    this.click2Data = result;
    return;
  }
}
</script>

<style lang="scss" scoped>
</style>