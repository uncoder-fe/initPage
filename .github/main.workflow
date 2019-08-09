# Trigger on push https://help.github.com/en/articles/workflow-syntax-for-github-actions
on: push
push:
  branches:    # Array of patterns that match refs/heads
  - master     # Push events on master branch
  - releases/* # Push events to branches matching refs/heads/releases/*
jobs:
  my_first_job:
    name: My first job
    runs-on: macOS-10.14
    steps:
      - name: My first step
          uses: 
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Install Dependencies
          run: npm install
