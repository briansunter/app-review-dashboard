workflow "Deploy" {
  on = "push"
  resolves = [
    "Deploy Github Pages",
    "GitHub Action for npm",
  ]
}

action "Deploy to gh-pages" {
  uses = "JamesIves/github-pages-deploy-action@master"
  env = {
    BRANCH = "gh-pages"
    BUILD_SCRIPT = "npm install && npm run build"
    FOLDER = "public"
  }
  secrets = ["ACCESS_TOKEN"]
  needs = ["master branch only"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  runs = "npm i; npm run build; npm run deploy;"
}
