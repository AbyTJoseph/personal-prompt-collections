---
title: Sample Prompt
tags: [example, test]
aliases: [example-prompt, test-prompt]
collection: Examples
model: gpt-4
temperature: 0.7
variables:
  - key: name
    label: Your Name
    type: string
    required: true
  - key: goal
    label: What is your goal?
    type: textarea
    required: true
  - key: experience
    label: Experience Level
    type: select
    options: [Beginner, Intermediate, Advanced]
createdAt: "2023-11-15T12:00:00Z"
updatedAt: "2023-11-15T12:00:00Z"
---

# {{name}}'s Custom Plan

Hello {{name}}! I'll help you achieve your goal:

> {{goal}}

Based on your {{experience}} experience level, here's a customized plan:

1. First step
2. Second step
3. Final step

Let me know if you need any clarification or have questions about this plan.

