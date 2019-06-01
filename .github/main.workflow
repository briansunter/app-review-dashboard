workflow "Deploy" {
  on = "push"
  resolves = ["Deploy Github Pages"]
}

action "Deploy Github Pages" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  runs = "npm run deploy"
}
