#!/usr/bin/fish
cd (dirname (status -f))/..
set -x BASE_URL "/idris2-quickdocs"
yarn build
pushd build
or exit 1
touch .nojekyll
git init
git remote add origin git@github.com:iacore/idris2-quickdocs.git
git add .
and git commit -m "Update"
and git push origin HEAD:gh-pages -f
