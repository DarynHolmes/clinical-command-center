

Use clean code, with good practices. 

A standard engineer would list all biomarkers in a simple table. For a Founding Engineer, I want you to think about Information Density.

Use docmentation/design.md as the design, only deviate when required.


This is for an interview, suggest pragmatic refactoring as we go.


Use eslint to ensure there are no type errors.

# UI Framework 

Nuxt 4 in SPA mode, to run in PocketBase's pb_public directory

## UI tools

- use Nuxt UI
    - with tailwind
    - use Nuxt UI's skeleton components when data is loading
    - reduce UI jumping (jank) as much as possible

- use Zod with Nuxt UI for form validation 

Note: 
Use Nuxt UI for the infrastructure and Tailwind for the insight.
Use Nuxt UI for: The Sidebar, Navigation, Modals for "Adding a Biomarker," and the primary Data Table container.
Use Plain Tailwind for: The custom "Diffing" logic, such as the specific red/green/amber highlights and custom sparklines that represent scientific trends.

Maintain light and dark mode implementations 

## Hosting

This will use PocketBase v0.36.1
This will be hosted on pockethost

## Notes

There is no need to run 
```sh
npm run dev 
```
It is being run in another terminal.

## Ignore

Ignore docmentation/notes.md
Those are todos and other side notes
