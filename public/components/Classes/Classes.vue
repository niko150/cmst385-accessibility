<template>
  <div id="container" class="outer container">
    <h1>Classes</h1>
    <br />
    <app-course v-for="course in classes" v-bind:course="course"></app-course>
  </div>
</template>

<script type="text/javascript">
  import Course from './Course.vue'
  import {classes} from '../../store/store'

  export default {
    data () {
      return {
        courses: null
      }
    },
    components: {
      appCourse: Course
    },
    computed: classes.computed,
    firebase: {
      classes: classes.ref
    }
  }
</script>