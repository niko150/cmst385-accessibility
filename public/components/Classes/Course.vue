<template>
  <div class="inner container col-sm-6 col-md-4">
    <div class="panel-primary">
      <div class="panel-heading">
        <h1>{{name}}</h1>
        <h2 class="panel-title">{{course.title}}</h2>
      </div>
    </div>
    <div class="card">
      <div class="card-height-indicator"></div>
      <div class="card-content panel-primary">
        <div class="panel-body">
          <div class="row">
            <p class="description">{{course.description}}</p>
          </div>
          <div class="row">
            <ul>
              <li v-for="(requirement, index) in course.prerequisites" v-bind:class="index===0?'list-group-item-danger':''">
                <big v-show="index === 0">Requirements:</big> 
                {{expand(requirement)}}</li>
              <li v-for="(recommended, index) in course.recommended" v-bind:class="index===0?'list-group-item-info':''">
                <big v-show="index === 0">Recommended:</big> 
                {{expand(recommended)}}</li>
              <li v-for="(equivalency, index) in course.equivalencies" v-bind:class="index===0?'list-group-item-warning':''">
                <big v-show="index === 0">Equivalencies:</big> 
                {{getName(equivalency)}}</li>
            </ul>
          </div>
        </div>
        <div class="info-box list-group-item-success" v-show="course.url">
          <a v-bind:href="course.url" class="" target="_blank">View Online</a> <span class="glyphicon">&#xe164;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    props: ['course'],
    computed: {
      name () {
        return this.course.department + ' ' + this.course.number
      },
      hasRightPane () {
        return this.course.requirements || this.course.recommended 
          || this.course.equivalencies
      }
    },
    methods: {
      expand (_entry) {
        console.log(_entry, this.course)
        return ('department' in _entry)?
           this.getName(_entry): 
           _entry.map(v => (v.constructor === Array) ? 
            this.expand(v) : 
            this.getName(v))
          .join(' or ')
      },
      getName(course) {
        return course.department + ' ' + course.number
      }
    }
  }
</script>

<style scoped>
.info-box {
  background-color: #ffc107;
  padding: 1em;
}
a, a:visited,  h1 { color: white; text-decoration: none }
a:hover { color: whitesmoke; }
h2 {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.1;
  -webkit-margin-before: 1em;
  -webkit-margin-after: 1em;
  -webkit-margin-start: 0px;
  -webkit-margin-end: 0px;
}
ul {
  list-style: none;
  padding-left: 0;
  width: 90%;
  margin-left: 5%;
  border-left: solid indigo thin;
  border-right: solid indigo thin;
}
</style>