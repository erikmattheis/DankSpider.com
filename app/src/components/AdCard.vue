<template>
  <div class="product-card shadowy page" ref="image">
    <h1>Ad</h1>
    <!-- Square -->
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5873148502738660" data-ad-slot="3189676673"
      data-ad-format="auto" data-full-width-responsive="true"></ins>

  </div>
</template>




<style scoped>
.pendulum {
  animation: pendulum var(--duration) ease-in-out infinite;
}

.card-container {
  position: relative;
}

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

.corner-text {
  position: absolute;
  top: -25px;
  right: -25px;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  transform: rotate(45deg);
}

.backdrop {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  background-color: #fff;
  overflow: hidden;
}

.corner {
  transform: rotate(45deg);
  height: 100px;
}

.beauty {
  transform: rotate(45deg);
  height: 170px;
}

.info {
  background-color: #ddd;
  padding: 5px 0 30px;
  width: 100%;
  min-height: 149px;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style-type: none;
}

ul li {
  display: inline-block;
  font-size: 0.8rem;
  margin-bottom: 5px;
  margin-right: 5px;
  padding: 0px 5px;
  border-radius: 0;
}

.right {
  margin-left: 3px;
}

.cannabinoid {
  background-color: #f71c08;
  color: #fff;
}

.terpene {
  background-color: #9c07b6;
  color: #fff;
}

ul li::after {
  display: block;
  content: attr(title);
  font-weight: 700;
  height: 1px;
  color: transparent;
  overflow: hidden;
  visibility: hidden;
}

ul li.selected {
  font-weight: 700;
  background-color: #eee;
  color: #f71c08;
}

li span {
  white-space: nowrap;
}

.assays {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.assay {
  width: 50%;
}

.assay span {
  text-align: left;
}

.empty {
  color: #666;
}

h3,
i {
  color: #333;
}

h3 {
  margin-bottom: 12px;
}

p {
  margin-top: 5px;
}

@keyframes pendulum {
  0% {
    transform: rotate(45deg);
  }

  50% {
    transform: rotate(var(--rotation));
  }

  100% {
    transform: rotate(45deg);
  }
}
</style>