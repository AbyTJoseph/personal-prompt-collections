---
title: Cursor unable to solve issue
tags:
  - Cursor
  - VibeCoding
  - Programming
createdAt: '2025-08-24T21:19:53.046Z'
updatedAt: '2025-08-24T21:19:53.047Z'
collection: Cursor
likes: 0
---
When Claude in Cursor can't solve your issue after a few tries follow this 2 step plan and fix it IMMEDIATELY:

"Package EVERYTHING about this issue into a markdown file and add it to the codebase? Im going to give this doc to ChatGPT to have it debug what the issue is. 

This markdown file should contain a clear explanation of the issue (current behavior vs expected behavior), code pointers for what we are currently doing, and any other information that will give GPT the FULL context on the issue, given it does not have access to the codebase. It should have all of the information it needs to make an accurate assessment and correction, as if it did have access to the entire codebase."

Then take the markdown file it made and paste that into ChatGPT-Thinking (or Pro if you have access to it) with this prompt:

"I'm facing an issue in my codebase and asked Cursor to write a comprehensive document explaining what is going wrong. Give me the fix for this in the form of a response that I can copy and paste into Cursor so it can follow your directions and fix this issue permanently. {{PASTED_DOC}}".
