<template>
  <div id="container" class="outer container">
    <nav class="navbar navbar-default">
      <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <router-link to="/" class="navbar-brand">CMST 385 - Accessibility</router-link>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <router-link to="/classes" active-class="active" tag="li"><a>Classes</a></router-link>
            <router-link to="/about" active-class="active" tag="li"><a>About</a></router-link>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script type="text/javascript">
</script>

<style></style>