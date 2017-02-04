<template>
  <div id="vue-container" class="outer vue-container">
    <nav class="navbar navbar-default shadow-z-2">
      <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <router-link to="/" class="navbar-brand">CMST 385 - Accessibility</router-link>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <router-link to="/classes" class="btn" active-class="btn-raised" tag="li"><a>Classes</a></router-link>
            <router-link to="/about" class="btn" active-class="btn-raised" tag="li"><a>About</a></router-link>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
</script>

<style scoped>
  nav {
    background-color: midnightblue
  }
  a {
    color: whitesmoke !important
  }
  .btn-raised {
    background-color: orange
  }
</style>