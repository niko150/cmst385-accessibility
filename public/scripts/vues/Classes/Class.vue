<template>
  <div class="inner container col-sm-6 col-md-4">
    <div class="panel panel-primary">
      <div class="panel-heading">
        <h3 class="panel-title">{{_class.title}} <small>({{name}})</small></h3>
      </div>
      <div class="panel-body">
        <div v-bind:class="hasRightPane? 'pull-left' : ''">
          <p class="description">{{_class.description}}</p>
        </div>
        <div class="pull-right">
          <ul>
            <li v-for="(requirement, index) in _class.requirements" v-bind:class="index===0?'list-group-item-danger':''">
              <big v-show="index === 0">Requirements:</big> 
              {{expand(requirement)}}</li>
            <li v-for="(recommended, index) in _class.recommended" v-bind:class="index===0?'list-group-item-info':''">
              <big v-show="index === 0">Recommended:</big> 
              {{expand(recommended)}}</li>
            <li v-for="(equivalency, index) in _class.equivalencies" v-bind:class="index===0?'list-group-item-warning':''">
              <big v-show="index === 0">Equivalencies:</big> 
              {{getName(equivalency)}}</li>
          </ul>
        </div>
      </div>
      <div class="info-box list-group-item-success" v-show="_class.url">
        <a v-bind:href="_class.url" class="" target="_blank">View Online</span>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    props: ['_class'],
    computed: {
      name() {
        _class.department + ' ' + _class.number
      },
      hasRightPane() {
        return _class.requirements || _class.recommended || _class.equivalencies
      }
    },
    methods: {
      getName(_class) {
        return _class.department + ' ' + _class.number
      },
      expand(_entry) {
        return _entry.map(v => 
          (v.constructor === Array)? expand(v): getName(v))
        .join(' or ')
      }
    }
  }
</script>

<style>
.info-box {
  margin: 1em;
  padding: 1em;
}
</style>