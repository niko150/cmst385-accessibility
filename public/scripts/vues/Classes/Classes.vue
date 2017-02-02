<template>
  <div id="container" class="outer container">
    <h1>Classes</h1>
    <app-class v-for="_class in classes" v-bind:_class="_class"></app-class>
  </div>
</template>

<script type="text/javascript">
  import Class from './Class.vue'

  export default {
    components: {
      appClass: Class
    },
    computed: {
      class() {
        return this.$store.getters.getClasses
      }
    }
  }
</script>