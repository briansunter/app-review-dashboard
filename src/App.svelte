<script>
import Home from './Home.svelte';
import { Router, Route } from "svelte-routing";
</script>

<Router >
  <div>
    <Route path="/:appId" component={Home}></Route>
    <Route path="/app-review-dashboard/:appId" component={Home}></Route>
    <Route path="/" component={Home}></Route>
  </div>
</Router>
