<script>
 import Tabulator from 'tabulator-tables';
 import  'tabulator-tables/dist/css/tabulator.min.css'
 import { onMount } from 'svelte';
 import Mark from 'mark.js';

 let table;
 let mark;

 onMount(async () => {
   const tableOptions = {
     data:reviews,
     height:window.screen.height, tooltips: true,
     layout:"fitColumns",
     columns:[
       {title:"Title",width:150, formatter:'textarea', field:'title'},
       {title:"Rating",width:75,align:'center', field:'rating'},
       {title:"Stars", field:"rating", formatter:"star", align:"center", width:100,field:'rating'},
       {title:"Sentiment",width:100, align:'center',field: 'sentiment'},
       {title:"Version",width:100, align:'center', field: 'version'},
       {title:"Content", formatter:'textarea', field:'content',minWidth:300}]}

   table = new Tabulator("#items",tableOptions);
 });

 mark = new Mark("div.tabulator-cell");

 $: if(table){
   table.setData(reviews);
 }
 $: if(table) {
   table.setFilter("content", "like", tableSearch);
 }

 $: {
   mark.mark(tableSearch,{accuracy: 'complementary'});
 }

 export let reviews = [];

 let tableSearch = "";
</script>

<style>
 mark{
   background: orange;
   color: black;
 }
 .review-search {
   padding: 10pt;
   font-size:1.5em;
   margin: 5pt;
 }
</style>
<div class="content">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header card-header-primary">
            <h2 class="card-title">List</h2>
            <h3 class="card-category">Searchable and sortable reviews</h3>
            <input class="review-search" bind:value={tableSearch} placeholder="Search Reviews..." >
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table sortable table-striped table-border" id="items">
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
