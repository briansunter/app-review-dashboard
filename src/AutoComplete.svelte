<script>
 import autocomplete from 'autocompleter';
 import values from 'lodash/values';
 import groupBy from 'lodash/groupBy';
 import mapValues from 'lodash/mapValues';
 import { onMount } from 'svelte';
 import 'autocompleter/autocomplete.css';
 import { navigate } from "svelte-routing";

 let apps = {};
 export let selectedApp = () => null;

 onMount(() => {
   var input = document.getElementById("appSearch");
   autocomplete({
     input: input,
     fetch: async function(text, update) {
       text = text.toLowerCase();
       let formattedText = encodeURI(text);

       let res = await fetch(`https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?term=${formattedText}&entity=software`);
       let appsResponse = await res.json();

       let formattedApps = appsResponse.results.map(a=>
           ({id: a.trackId,
             name:a.trackName,
             link: a.trackViewUrl,
             currentVersionRatingCount: a.userRatingCountForCurrentVersion,
             currentVersionRating: a.averageUserRatingForCurrentVersion,
             appRating: a.averageUserRating,
             appRatingCount: a.userRatingCount,
             appPrice:a.formattedPrice}));

       let labelApps = values(formattedApps).map(a =>
           ({value: a.id,
             label: a.name,
             appRatingCount:a.appRatingCount}));

       update(labelApps);
     },
     onSelect: function(item) {
       input.value = item.label;
       navigate(`${item.value}`);
     }
   });
 });
</script>
<style>

 .autoComplete_results_list li {
font-size: 2rem;
 }
 .appSearch {
   width: 100%;
   padding: 10pt;
 }

</style>

<input id="appSearch" type="text" value="" class="appSearch" placeholder="Search for an App..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
