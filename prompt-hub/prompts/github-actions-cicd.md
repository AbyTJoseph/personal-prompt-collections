---
title: GitHub Actions CI/CD Workflow
tags: [ci-cd, github-actions, devops, yaml]
collection: DevOps
createdAt: "2023-11-15T12:00:00Z"
updatedAt: "2023-11-15T12:00:00Z"
variables:
  - key: projectType
    label: Project Type
    type: select
    options: [Node.js, Python, React, Docker]
    required: true
---

Generate a YAML file for a GitHub Actions workflow that builds, tests, and deploys a {{projectType}} application.

# GitHub Actions CI/CD Workflow

A comprehensive workflow for continuous integration and deployment.

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to production
      run: |
        echo "Deploy to your preferred platform"
        # Add your deployment commands here
```

## Features

- Automated testing on push and pull requests
- Build verification before deployment
- Conditional deployment to production
- Artifact caching for faster builds
- Support for multiple environments
