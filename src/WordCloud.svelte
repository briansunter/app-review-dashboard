<script>
 import cloud from 'd3-cloud';
 import { select } from 'd3-selection';
 import { scaleLinear, scaleOrdinal } from 'd3-scale';
 import { schemePaired } from 'd3-scale-chromatic';
 import _ from 'lodash';
 import { onMount } from 'svelte';

 const color = scaleOrdinal(schemePaired);
 const screenWidth = window.innerWidth;
 const screenHeight = window.innerHeight;

 export let words;
 let lastWords = words;
 export let width  = screenWidth;
 export let height = screenHeight;

 onMount(async () => {
   calculateCloud(words);
});

 $: if(! _.isEqual(words, lastWords)) {
    lastWords = words;
    calculateCloud(words);
  }

 function drawCloud(input) {
   select("#cloud").selectAll("svg").remove();

   select("#cloud")
     .append("svg")
     .attr("width", width)
     .attr("height", height)
     .append("g")
     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
     .selectAll("text")
     .data(input)
     .enter().append("text")
     .style("font-size", function(d) { return d.size + "px"; })
     .style("font-family", "Impact")
     .attr("text-anchor", "middle")
     .attr("transform", function(d) {
       return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
     })
     .text(function(d) { return d.text; })
     .style("fill", function(d, i ) { return color(i); });
 }

 function calculateCloud(data) {
   const fontScale = scaleLinear()
     .domain([0, 100])
     .range([14, 200]);

   cloud()
     .size([width, height])
     .words(data)
     .padding(5)
     .rotate(function() { return ~~(Math.random() * 2) * 90; })
     .font("Impact")
     .fontSize(function(d) { return  fontScale(d.size);})
     .on("end", drawCloud).start();
 }
</script>

<div id="cloud"> </div>
