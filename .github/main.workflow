workflow "Deploy" {
  on = "push"
  resolves = ["Deploy Github Pages"]
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