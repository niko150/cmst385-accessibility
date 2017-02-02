<template>
    <div class="container">
        <app-header></app-header>
        <div class="row"><div class="col-xs-12">
            <transition name="slide" mode="out-in">
                <router-view></router-view>
            </transition>
        </div></div>
    </div>
</template>

<script type="text/javascript">
    import Header from './Header.vue'

    export default {
        components: {
            appHeader: Header
        },
        created() {
            this.$store.dispatch('initClasses')
        }
    }
</script>

<style>
    body {
        padding: 5vmin;
    }

    .slide-enter-active { animation: slide-in 200ms ease-out forwards }
    .slide-leave-active { animation: slide-out 200ms ease-out forwards }
    @keyframes slide-in {
        from { transform: translateY(-30vmin); opacity: 0 }
        to { transform: translateY(0px); opacity: 1}
    }
    @keyframes slide-out {
        from { transform: translateY(0px); opacity: 1 }
        to { transform: translateY(-30vmin); opacity: 0}
    }
</style>
