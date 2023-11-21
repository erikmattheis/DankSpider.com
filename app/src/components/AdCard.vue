<template>
  <div class="product-card shadowy page" ref="image">
    <h1>Ad</h1>
    <!-- Square -->
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5873148502738660" data-ad-slot="3189676673"
      data-ad-format="auto" data-full-width-responsive="true"></ins>

  </div>
</template>

<script>
export default {
  mounted() {
    // Load the Google AdSense script when the component is mounted
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
}
</script>


<style scoped>
.product-card {

  min-height: 305px;
  display: inline-block;
  text-align: center;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.product-card .corner {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 120px;
  height: 120px;
}

@media (min-width: 900px) {
  .product-card {
    margin: 20px;
    width: 340px;
  }
}

@media (min-width: 1200px) {
  .product-card {
    width: 333px;
  }
}
</style>