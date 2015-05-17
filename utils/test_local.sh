#!/bin/bash
set -e
port=5000

repo_root="$(git rev-parse --show-toplevel)"  
pushd $repo_root

bundle exec jekyll serve --port $port

popd
