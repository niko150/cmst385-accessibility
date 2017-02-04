<template>
    <div class="vue-container">
        <app-header></app-header>
        <div class="row"><div class="col-xs-12">
            <transition name="slide" mode="out-in">
                <router-view></router-view>
            </transition>
        </div></div>
    </div>
</template>

<script type="text/javascript">
  import Header from './components/Header.vue'
  import {classesRef} from './store/store'

  export default {
    components: {
      appHeader: Header
    },
    computed: {
      created () {
        this.$store.dispatch('setClassesRef', classesRef)
      }
    }
  }
</script>

<style>
    a, a:hover, a:visited, h1 {
        color:darkgrey
    }
    

    .slide-enter-active { animation: slide-in 200ms ease-out forwards }
    .slide-leave-active { animation: slide-out 200ms ease-out forwards }
    @keyframes slide-in {
        from { transform: translateX(-30vmin); opacity: 0 }
        to { transform: translateX(0px); opacity: 1}
    }
    @keyframes slide-out {
        from { transform: translateX(0px); opacity: 1 }
        to { transform: translateX(-30vmin); opacity: 0}
    }
</style>
