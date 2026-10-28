## Summary

<!-- What changes and why. Use a Conventional Commits title (feat:, fix:, docs:...). -->

## Checklist

- [ ] `pnpm build`, `pnpm test`, `pnpm check:pdf` and `pnpm test:e2e` pass
- [ ] No network request to another domain, no analytics
- [ ] No new dependency, or it is justified below

For a new or changed template (see CONTRIBUTING.md, Template acceptance criteria):

- [ ] Renders correctly on A4 in the 7 languages, including Arabic right-to-left
- [ ] A long CV paginates cleanly over 2 pages
- [ ] Text is extractible (`pnpm check:pdf` passes, ATS checks included)
- [ ] Accent contrast is enough (4.5:1 on white for text), also with custom colors
- [ ] Fonts and images are local, no remote resource
- [ ] Screenshots from `out/` are attached

## Dependency justification

<!-- Only if a dependency is added. -->
