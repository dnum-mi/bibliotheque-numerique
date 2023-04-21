# CI - Bibliothèque numérique


---
## Run Github Actions 


### Build and deploy

Mapping of Branch and Environments

| Branch    | Environment             | Hosting              |
|-----------|-------------------------|----------------------|
| Dev       | Integration             | OVH Preprod (4-8)    |
| Staging       | Staging (Qualification) | OVH Production (4-5) |
| Main | Production              | CloudPI              |

To run Build and deploy

- Tag your version in ```package.json``` ex: ```"version": "1.0.0",```
- Navigate to the repository "Bibliothèque numérique" on GitHub where the action is located.
- Click on the "Actions" tab.
- Select the workflow "Build and deploy to integration" (or: "staging", "production") to run from the list of available workflows.
- Click the "Run workflow" button in the top right corner.
- Choose the branch you want to run the workflow on, or leave the default branch selected.
- Click the "Run workflow" button to start the action.

Once the workflow has started, you can monitor its progress in the "Actions" tab. You'll see logs for each step of the workflow, along with any output or error messages. If the workflow completes successfully, you'll see a green checkmark next to it. If it fails, you'll see a red X and an error message indicating what went wrong.