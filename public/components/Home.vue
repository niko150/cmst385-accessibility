<template>
  <div id="container" class="outer container">
    <h1>CMST 385 - Accessibility</h1>
    <br />
    <h2>for EXCL 301 - supporting evidence for Demonstration of Learning: CMST 385</h2>
    <h2>Supporting Evidence of Accessibility</h2>
    <hr />
    <br />
    <p>The header here contains 3 links, navigating to the pages of the site. The tabindex attribute is set programatically to aid accessibility for users with needs for enhanced keyboard navigation. On the home screen (here), the home link will not recieve focus. On the other two pages it will. Other content loaded in the header above these links will not displace the classes and about links in the tab order. To see where the tab focus is currently, a toggle is provided.</p>
    <div class="togglebutton">
      <label>
        Show Focus
        <input type="checkbox" v-bind:checked="focus" v-on:change="toggleFocus()"><span class="toggle"></span>
      </label>
      <p><span style="font-style: italic">focus will render only with pressing tab after this is enabled.</span></p>
    </div>
    <br />
    <div>
    <router-link to='/about' id="about" class="btn-info">See what goes into accessibility at this site</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      focus: false
    }
  },
  methods: {
    toggleFocus() {
      const rule = ':focus { border: solid thin white}'
      this.focus = !this.focus
      focus? document.styleSheets[0].insertRule(rule, 0): CSSStyleSheer.deleteRule(0)
    }
  }
}
</script>

<style scoped>
#about {
  padding: 0.5rem;
  border-radius: 0.1rem;
  color: white;
}
#about:hover {
  color: floralwhite
}
h2 {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  display: block;
  -webkit-margin-before: 2.33em;
  -webkit-margin-after: 2.33em;
  -webkit-margin-start: 0px;
  -webkit-margin-end: 0px;
  font-weight: 500;
  font-size: 1rem;
  font-family: inherit;
  margin-bottom: 0.25rem;
  line-height: 1.1;
  color: inherit;
}

.togglebutton {
  vertical-align: middle;
}
.togglebutton,
.togglebutton label,
.togglebutton input,
.togglebutton .toggle {
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
.togglebutton label {
  cursor: pointer;
  color: rgba(0,0,0, 0.26);
}
.form-group.is-focused .togglebutton label {
  color: rgba(0,0,0, 0.26);
}
.form-group.is-focused .togglebutton label:hover,
.form-group.is-focused .togglebutton label:focus {
  color: rgba(0,0,0, .54);
}
fieldset[disabled] .form-group.is-focused .togglebutton label {
  color: rgba(0,0,0, 0.26);
}
.togglebutton label input[type=checkbox] {
  opacity: 0;
  width: 0;
  height: 0;
}
.togglebutton label .toggle {
  text-align: left;
}
.togglebutton label .toggle,
.togglebutton label input[type=checkbox][disabled] + .toggle {
  content: "";
  display: inline-block;
  width: 30px;
  height: 15px;
  background-color: rgba(80, 80, 80, 0.7);
  border-radius: 15px;
  margin-right: 15px;
  -webkit-transition: background 0.3s ease;
       -o-transition: background 0.3s ease;
          transition: background 0.3s ease;
  vertical-align: middle;
}
.togglebutton label .toggle:after {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: #F1F1F1;
  border-radius: 20px;
  position: relative;
  -webkit-box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.4);
          box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.4);
  left: -5px;
  top: -2px;
  -webkit-transition: left 0.3s ease, background 0.3s ease, -webkit-box-shadow 0.1s ease;
       -o-transition: left 0.3s ease, background 0.3s ease, box-shadow 0.1s ease;
          transition: left 0.3s ease, background 0.3s ease, box-shadow 0.1s ease;
}
.togglebutton label input[type=checkbox][disabled] + .toggle:after,
.togglebutton label input[type=checkbox][disabled]:checked + .toggle:after {
  background-color: #BDBDBD;
}
.togglebutton label input[type=checkbox] + .toggle:active:after,
.togglebutton label input[type=checkbox][disabled] + .toggle:active:after {
  -webkit-box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.4), 0 0 0 15px rgba(0, 0, 0, 0.1);
          box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.4), 0 0 0 15px rgba(0, 0, 0, 0.1);
}
.togglebutton label input[type=checkbox]:checked + .toggle:after {
  left: 15px;
}
.togglebutton label input[type=checkbox]:checked + .toggle {
  background-color: rgba(0, 150, 136, 0.5);
}
.togglebutton label input[type=checkbox]:checked + .toggle:after {
  background-color: #009688;
}
.togglebutton label input[type=checkbox]:checked + .toggle:active:after {
  -webkit-box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.4), 0 0 0 15px rgba(0, 150, 136, 0.1);
          box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.4), 0 0 0 15px rgba(0, 150, 136, 0.1);
}
</style>