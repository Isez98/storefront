module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "Features" },
            { type: "fix", section: "Bug Fixes" },
            { type: "docs", section: "Documentation" },
            { type: "style", section: "Styles" },
            { type: "refactor", section: "Code Refactoring" },
            { type: "perf", section: "Performance Improvements" },
            { type: "test", section: "Tests" },
            { type: "build", section: "Build System" },
            { type: "ci", section: "Continuous Integration" },
            { type: "chore", section: "Chores" },
          ],
        },
        writerOpts: {
          // Override the date formatting to prevent RangeError issues
          mainTemplate: `{{> header}}

{{#each commitGroups}}
{{#if title}}
### {{title}}

{{/if}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}

{{/each}}
{{> footer}}`,
          commitPartial: `* {{#if scope}}**{{scope}}:** {{/if}}{{#if subject}}{{subject}}{{else}}{{header}}{{/if}}

{{~!-- commit body --}} {{#if body}}{{body}}

{{/if}}
{{~!-- commit footer --}} {{#if footer}}{{footer}}

{{/if}}`,
          headerPartial: `{{#if isPatch}}
## {{#if @root.linkCompare}}[{{version}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/compare/{{previousTag}}...{{currentTag}}){{else}}{{version}}{{/if}} ({{date}})
{{else}}
# {{#if @root.linkCompare}}[{{version}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/compare/{{previousTag}}...{{currentTag}}){{else}}{{version}}{{/if}} ({{date}})
{{/if}}`,
          transform: (commit, context) => {
            // Handle invalid dates that cause RangeError
            const fixDate = (dateField) => {
              if (
                !dateField ||
                dateField === "" ||
                dateField === null ||
                dateField === undefined
              ) {
                return new Date().toISOString();
              }
              try {
                const date = new Date(dateField);
                if (isNaN(date.getTime())) {
                  return new Date().toISOString();
                }
                // Additional check: try to format the date to ensure it won't cause RangeError later
                date.toISOString();
                return dateField;
              } catch (error) {
                return new Date().toISOString();
              }
            };

            // Fix both committerDate and date fields
            if (commit.committerDate !== undefined) {
              commit.committerDate = fixDate(commit.committerDate);
            }
            if (commit.date !== undefined) {
              commit.date = fixDate(commit.date);
            }

            return commit;
          },
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
  preset: "conventionalcommits",
  releaseRules: [
    { type: "feat", release: "minor" },
    { type: "fix", release: "patch" },
    { type: "docs", release: "patch" },
    { type: "style", release: "patch" },
    { type: "refactor", release: "patch" },
    { type: "perf", release: "patch" },
    { type: "test", release: "patch" },
    { type: "chore", release: "patch" },
    { type: "ci", release: "patch" },
    { type: "build", release: "patch" },
    { breaking: true, release: "major" },
  ],
};
