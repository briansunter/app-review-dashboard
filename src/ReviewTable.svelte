<script>
 import Tabulator from 'tabulator-tables';
 import  'tabulator-tables/dist/css/tabulator.min.css'
 import { onMount } from 'svelte';
 import Mark from 'mark.js';

 let table;
 let mark;

 onMount(async () => {
   const tableOptions = {
     height:window.screen.height, tooltips: true,
     layout:"fitColumns",
     columns:[
       {title:"Title",width:150, formatter:'textarea'},
       {title:"Rating",width:75,align:'center'},
       {title:"Stars", field:"rating", formatter:"star", align:"center", width:100},
       {title:"Sentiment",width:100, align:'center'},
       {title:"Version",width:100, align:'center'},
       {title:"Content", formatter:'textarea'}]}

   table = new Tabulator("#items",tableOptions);
 });

 mark = new Mark("div.tabulator-cell");

 $: if(table) {
   table.setFilter("content", "like", tableSearch);

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
</style>
<div class="content">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header card-header-primary">
            <h4 class="card-title ">App Reviews</h4>
            <p class="card-category"> Recent Reviews for your app</p>
            <input bind:value={tableSearch} placeholder="Search Reviews..." >
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table sortable table-striped table-border" id="items">
                <thead class=" text-primary">
                  <th>Title</th><th>Rating</th><th>Stars</th><th>Sentiment</th><th>Version</th>
                  <th>Content</th>
                </thead>
                <tbody>
                  {#each reviews as review}
                  <tr>
                    <td>
                      {review.title}
                    </td>
                    <td>
                      {review.rating}
                    </td>
                    <td>
                      {review.rating}
                    </td>
                    <td>
                      {review.sentiment}
                    </td>
                    <td>
                      {review.version}
                    </td>
                    <td class="text-primary review-content" tabulator-formatter="textarea">
                      {review.content}
                    </td>
                  </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
