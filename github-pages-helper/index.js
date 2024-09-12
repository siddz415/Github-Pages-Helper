#!/usr/bin/env node

console.log('Executing host-helper...');

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Function to update the homepage field in package.json
function updateHomepageField(homepageUrl) {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.homepage = homepageUrl;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Function to create CNAME file for custom domain
function createCNAMEFile(customDomain) {
  fs.writeFileSync('CNAME', customDomain);
}

// Function to configure hosting
function configureHosting() {
  console.log('Starting configuration...');

  const questions = [
    {
      type: 'input',
      name: 'githubUsername',
      message: 'What is your GitHub username?',
    },
    {
      type: 'input',
      name: 'repositoryName',
      message: 'What is your repository name?',
    },
    {
      type: 'list',
      name: 'hostingType',
      message: 'Which hosting type do you want to use?',
      choices: ['GitHub Pages', 'Custom Domain'],
    },
    {
      type: 'input',
      name: 'customDomain',
      message: 'What is your custom domain?',
      when: (answers) => answers.hostingType === 'Custom Domain',
    },
  ];

  inquirer.prompt(questions)
    .then((answers) => {
      console.log('Answers received:', answers);

      const { githubUsername, repositoryName, hostingType, customDomain } = answers;

      // Determine the homepage URL based on hosting type
      let homepageUrl;
      if (hostingType === 'GitHub Pages') {
        homepageUrl = `https://${githubUsername}.github.io/${repositoryName}/`;
      } else {
        homepageUrl = `https://${customDomain}/`;
        createCNAMEFile(customDomain); // Create CNAME for custom domain
      }

      // Update the homepage field in package.json
      updateHomepageField(homepageUrl);

      console.log('Configuration complete! Ensure to push these changes to GitHub.');
    })
    .catch((error) => {
      console.error('Error during configuration:', error);
    });
}

// Convert import.meta.url to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current file path:', __filename);
console.log('Current directory:', __dirname);

// Execute the CLI function if run as a command
if (process.argv[1] === __filename) {
  configureHosting();
}