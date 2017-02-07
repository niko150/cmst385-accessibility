<template>
  <div id="container" class="outer container">
    <h1>About This Accessibility Assessment</h1>
    <br />
    <section class="article">
      <p>For the purposes of this demonstration, I need to show assessing and conforming a page to a standard of accessibility. I've decided to create a page with data (classes) and a log-in feature. Additionally I wrote a backend api to administer the data. At this time it is not wired up with a front end (since it would not be publically visible). Additionally, the login feature is not added to the project. Here, the focus will be on the landing, about, and classes pages.</p>
      <p>The site design, showcasing UMUC classes, will draw inspiration from the actual UMUC page, style and palette, but will be very basic. I will confirm to material design, outside of color palette, to further restrict design choice (perhaps the client wants to produce a hybrid mobile/web app from this work).</p>
      <p>A traditional build process is called a "waterfall process". Assets are developed, then reviewed, and then shipped. This style of production is considered limiting in many contexts, including most web development teams. Instead, the typical practice may follow a design called "Kanban", or "Scrum", etc. In general, these are called "agile processes". Instead of whole assets, components, or daily work units, are built and reviewed separately, then composed. Each work unit is accomplished in "sprints". A process phase like assessment can then occur at each step along the way. Here, we will be looking at accessability at the end of each component.</p>
      <p>The first sprint, after some basic back-end preparation: The basic site with classes, a landing page, and the about page (empty at this phase). The chosen standard to compare against is the WCAG 2.0 standard, version "AAA". However, as the client specifies a color palette, we will be skipping all rules for high contrast.</p>
      <h2>Landing page</h2>
      <p>In this first review, full coverage is provided. In subsequent reviews, only highlights will be provided. Here is the outcome of the first measure with the tool:</p>
      <h3>Notifications</h3>
      <p>
        <ul>
          <li class="card">
            <div class="card-height-indicator"></div>
            <div class="card-content panel-primary">
              <div class="panel-body">
                <p>Check that the title element describes the document. (principle: <a href="https://www.w3.org/TR/WCAG20/#operable">Operable</a>, Technique: <a href="https://www.w3.org/TR/WCAG20-TECHS/H25">H25</a>)</p>
                <pre v-hightlightjs class="col-sm-8 col-sm-offset-2"><code class="html">...ossorigin=&quot;anonymous&quot;&gt;&lt;/script&gt;&lt;title&gt;CMST385-Accessibility - About&lt;/title&gt; &lt;style type=&quot;text/css&quot;&gt;a, a:...</code></pre>
              </div>
            </div>
          </li>
          <li class="card">
            <div class="card-height-indicator"></div>
            <div class="card-content panel-primary">
              <div class="panel-body">
                <p>Check that text of the link describes the purpose of the link. (principle: <a href="https://www.w3.org/TR/WCAG20/#operable">Operable</a>, Technique: <a href="https://www.w3.org/TR/WCAG20-TECHS/H30">H30</a>)</p>
                <pre v-hightlightjs class="col-sm-8 col-sm-offset-2"><code class="html">&lt;a href=&quot;/&quot; class=&quot;navbar-brand router-link-active&quot; data-v-d13097d6=&quot;&quot;&gt;CMST 385 - Accessibility&lt;/a&gt;</code></pre>
                <pre v-hightlightjs class="col-sm-8 col-sm-offset-2"><code class="html">&lt;a data-v-d13097d6=&quot;&quot; href=&quot;/classes&quot;&gt;Classes&lt;/a&gt;</code></pre>
                <pre v-hightlightjs class="col-sm-8 col-sm-offset-2"><code class="html">&lt;a data-v-d13097d6=&quot;&quot; href=&quot;/about&quot;&gt;About&lt;/a&gt;</code></pre>
                <pre v-hightlightjs class="col-sm-8 col-sm-offset-2"><code class="html">&lt;a href=&quot;/about&quot; class=&quot;btn-info&quot; id=&quot;about&quot;&gt;See what goes into accessibilit...&lt;/a&gt;</code></pre>
          </li>
        </ul>
      </p>
      <p>These notifications do not need to be acted upon, they are for review. In the event that the client was paying for an accessibility review you would promote this data for their consideration. Here, we just need to act on it. Our site plan would include things like design choices and words for elements in the page, therefore no change is needed for the links. I did need to modify the title element to reflect the current state of navigation. This was done by adding data to the front-end data store with the title, and then dynamically altering it at different routes on the page, like with the following for this page:</p>
      <pre v-highlightjs><code class="javascript">
        export default {
          data () {
            return {
              component: 'About'
            }
          },
          created () {
            $('title').text(this.$store.getters.title+' - '+this.component)
          }
        }
      </code></pre>
      <p>Review of this approach highlighted a problem: SEO optimization may use naive web crawlers that cannot read a dynamically set title. For this reason, the guidance half a decade ago or so was to generate that change in the back-end. However, modern web crawlers of search engine companies can now process the page javascript and css, rendering this issue mute. An organization I am a member and certified front end developer of, the non-profit FreeCodeCamp, has a survey article on the topic:<a href="https://medium.freecodecamp.com/seo-vs-react-is-it-neccessary-to-render-react-pages-in-the-backend-74ce5015c0c9#.7zaaoyh55">SEO vs. React: Web Crawlers are Smarter Than You Think</a> For this reason, simple DOM changes like the above suffice.</p>
      <h3>Errors</h3> 
      <p>There was only one non-contrast related Error: <i>The heading structure is not logically nested. This h6 element should be an h2 to be properly nested. (principle: <a href="https://www.w3.org/TR/WCAG20/#perceivable">Percievable</a>, Technique: <A href="https://www.w3.org/TR/WCAG20-TECHS/G131">G131</a>)</i> My code looked like the following:</p>
      <pre v-highlightjs><code class="html">    &lt;h1&gt;CMST 385 - Accessibility&lt;/h1&gt;
    &lt;br /&gt;
    &lt;h6&gt;for EXCL 301 - supporting evidence for Demonstration of Learning: CMST 385&lt;/h6&gt;
    &lt;h6&gt;Supporting Evidence of Accessibility&lt;/h6&gt;</code></pre>
    <p>This sort of markup is common when accessibility is not a concern, as at that point the sizing style rules for different header levels will determine which is chosen, rather than their heirarchy. Simply redefining sizing for the appropriate header at this page will suffice:</p>
    <pre v-highlightjs><code class="css">
      &lt;style scoped&gt;
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
      &lt;/style&gt;
    </code></pre>
    <h2>Classes page</h2>
      <h3>Notices</h3>
        <p>Outside of the title and link textual notifications of the form already covered, none were given. As these can be assumed to be a part of the specification, their inclusion is deemed valid regards the notice of Operability.</p>
      <h3>Warnings</h3>
        <p>There were warnings for links with <code>target="_blank"</code> that did not visually indicate that it would open in a new tab/window. This has been addressed using the unicode character for that: <span class="glyphicon">&#xe164;</span></p>
        <p>There were also warnings for incorrect heirarchical nesting of header elements again. These have been changed and the css copied over and scoped.</p>
        <p>There was also one warning related to an inaccessible anchor element. This did not effect the page (it is a rendering artifact and cannot be accessed).</p>
      <h3>Errors</h3>
        <p>Outside of contrast errors, none were given.</p>
    <h2>About page</h2>
      <h3>Notices</h3>
        <p>Outside of the title and link textual notifications of the form already covered, none were given. As these can be assumed to be a part of the specification, their inclusion is deemed valid regards the notice of Operability.</p>
      <h3>Warnings</h3>
        <p>On this page, The warnings about incorrect header heirarchy was followed more directly: I simply changed the header tags and did not rewrite the style, as the visual result was entirely pleasing. There was also a warning (Perceivable, H49) about semantic markup for the <code>i</code> tag in the Error in the first page review, above. This tag is used to visually distinguish (by means of font-style) the text in the inline span, which is the proper use of the text for visual readers. For non-visual readers, a change in voice tone may be used to highlight the difference. This separation by means of highlighting the text ensures clarity in the presentation to the audience, that the text is not a part of the writing but is a quotation from the accessibility specification. Therefore it was left in place as a valid use.</p>
      <h3>Errors</h3>
        <p>Outside of contrast errors and a single tag not part of the design and removed, none were given.</p>
    </section>
  </div>
</template>

<script>
export default {
  data () {
    return {
      component: 'About'
    }
  },
  created () {
    $('title').text(this.$store.getters.title+' - '+this.component)
  }
}
</script>

<style scoped>
</style>