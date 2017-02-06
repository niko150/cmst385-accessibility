<template>
  <div class="inner container col-md-6 col-lg-4">
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
          <div class="row outcomes">
            <h3>Outcomes</h3>
            <hr />
            <ol>
              <li v-for="(outcome, index) in course.outcomes">
                {{outcome}}
                <div>
                  <div class="form-group">
                    <div class="checkbox">
                      <label>
                        <input type="checkbox" v-bind:name="`status-${course.department}${course.number}-${index}`"  v-on:change="toggleAssessment(index, $event)"> <span v-if="assessments[className][index].status">assessed</span><span v-else>assess</span>
                      </label>
                    </div>
                  </div>
                  <div v-show="assessments[className][index].status">
                    <div class="togglebutton">
                      <label>
                        <input type="checkbox" v-on:change="changeAssessment(index, $event)"><span class="toggle"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
          </div>
          <div class="row description">
            <h3>Description</h3>
            <hr />
            <p class="description">{{course.description}}</p>
          </div>
          <div class="row related">
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
//  import {mapState} from 'Vuex'

  function getClassName(context) {
    return context.course.department + context.course.number
  }

  export default {
    props: ['course'],
    computed: {
      assessments: {
        get () {
          return this.$store.getters.getAssessments()
        },
        set (assessment) {
          this.$store.dispatch('modifyAssessments', {className: getClassName(this), assessment})
        
      },
//      ...mapState({assessments: state => state.assessments}),
      name () {
        return this.course.department + ' ' + this.course.number
      },
      className () {
        return getClassName(this)
      },
      hasRightPane () {
        return this.course.requirements || this.course.recommended 
          || this.course.equivalencies
      },
    },
    methods: {
      expand (_entry) {
        return ('department' in _entry)?
           this.getName(_entry): 
           _entry.map(v => (v.constructor === Array) ? 
            this.expand(v) : 
            this.getName(v))
          .join(' or ')
      },
      getName (course) {
        return course.department + ' ' + course.number
      },
      toggleAssessment (index, event) {
        let className = getClassName(this)
        let id = {
          className: className,
          outcomeIndex: index
        }
        let assessment = this.assessments[className][index]
        event.target.checked?
          this.$store.dispatch('flagAssessment', id):
          this.$store.dispatch('clearAssessment', id)
        this.$set(`assessments.${className}.${index}`, this.assessments[className][index])
        console.log(this.assessments[className][index])
        event.target.value = event.target.value === "on"?"off":"on"
      },
      changeAssessment (index, event) {
        let id = {
          className: getClassName(this),
          outcomeIndex: index
        }
        event.target.value? 
          this.$store.dispatch('flagAssessment', id): 
          this.$store.dispatch('passAssessment', id)
      }
    },
    created () {
      this.course.outcomes.forEach((o, i) => {
        let id = {
          className: getClassName(this), 
          outcomeIndex: i
        }
        this.$store.dispatch('touchAssessment', id)
      })
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
input[type=radio] {
  opacity: 1 !important;
  width: unset !important;
  height: unset !important;
  z-index: unset !important;
}
.radio {
  display: inline;
}
.outcomes, .description {
  margin: 0 1px;
}
</style>