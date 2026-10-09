# Data USA — Ground-Up Next.js Rewrite

## Mission

Completely rebuild https://datausa.io using Next.js 16.4 and the latest stable D3plus release.

This is a **ground-up rewrite, not a migration or refactoring project**.

The existing application is built around Canon, a CMS, PostgreSQL-stored content and configurations, and extensive server-side rendering and cache generation. The current architecture requires approximately three days of pre-caching before a new version can be deployed.

The new application must eliminate that architectural complexity while preserving the site's identity, its data, SEO visibility, and essential functionality.

**The most important change: all editorial content, report definitions, page layouts, visualization configurations, and their associated JavaScript logic must live directly in the new Git repository as code, not in PostgreSQL or a CMS.**

The end product should be substantially simpler to understand, develop, test, deploy, and maintain.

---

## 1. Development Environment and Existing Application

Mandatory first step: Establish read-only access to the existing CMS PostgreSQL database using the environment variables available in the legacy project. Inspect the database schema, identify every table used for CMS content and visualization configuration, and extract the actual content for one representative geography report. Cross-reference these records with the existing Canon implementation and the running site at localhost:3300 before designing the replacement architecture.

I will provide the absolute path to the current application's source directory:

**Legacy code directory:** `/Users/zephyr/Projects/datausa/datausa-site`

The existing application is already running at:

**http://localhost:3300/**

The existing directory also contains environment variables with access to the PostgreSQL database used by the current application.

You have access to three important sources of information:

1. The existing local source code, which should be treated as the authoritative reference for existing business logic.
2. The PostgreSQL database, which contains current CMS content, report configurations, visualization definitions, and dimension information.
3. The application running at http://localhost:3300, which should be used to inspect and compare the existing visual design and behavior.

Do not rely exclusively on the public GitHub repository. The local source directory may contain newer code or configuration.

### Important instructions

- **Create a brand-new, independent Next.js project in a separate directory.**
- Do not rebuild the existing application in place.
- Do not import or depend on existing Canon packages or legacy application modules.
- Do not preserve the old component hierarchy or architecture simply because it exists.
- Do not modify the existing application or database without explicit authorization.
- Treat the existing database as read-only during discovery and content extraction.
- Reuse visual assets where appropriate, but build the actual application architecture and components from scratch.
- Never expose, commit, or copy database credentials or other environment secrets into the new repository.
- Run the new application at http://localhost:3301 during development, leaving the old application at port 3300 for comparison.

The old and new applications may run locally side by side for testing. They are **not intended to run in parallel in production**.

The new application will ultimately replace the existing production application.

---

## 1A. Mandatory Legacy CMS Database Discovery and Content Extraction

Before implementing the new application, connect to the existing PostgreSQL database and thoroughly inspect its CMS content and configuration structures.

The legacy application's local directory contains environment variables with the database connection information.

### Database connection

1. Inspect the legacy project's environment configuration to identify the correct PostgreSQL connection variables, without displaying or logging secret values.
2. Use the existing credentials to establish a read-only connection.
3. If connection information must be supplied manually, read it from `LEGACY_CMS_DATABASE_URL` in the new project's `.env.migration.local` file.
4. Ensure `.env.migration.local` is excluded from Git.
5. Never modify, delete, or migrate tables in the existing database.
6. Do not copy CMS credentials into the new application's production environment.

If database access is available only through an account with write permissions, use read-only transactions for discovery and extraction, and avoid any operation that changes the existing data.

### Database discovery

Inspect the PostgreSQL schemas and identify all tables and fields responsible for:

- CMS pages and editorial content.
- Report templates and section definitions.
- Visualization definitions and configurations.
- Serialized JSON and JavaScript functions.
- Chart queries, formatting, and options.
- Report-specific overrides.
- Page titles and SEO metadata.
- Relationships between reports, visualizations, and dimension members.
- Dimension records such as geographies, industries, occupations, and educational programs.

Do not assume table structures or relationships based on naming conventions. Inspect the actual schema, relevant records, and application queries.

For each relevant table, document its purpose, primary identifiers, important relationships, and approximate record counts.

### Inspect actual content

Extract representative records for every identified report type.

Pay particular attention to fields containing executable JavaScript, since these will need to be translated into TypeScript functions.

Determine which configurations are common across report types, which are inherited, and which are unique to specific reports.

Inspect how the existing Canon application reads and interprets these records so that the extraction preserves their behavior.

### Build a one-time content export utility

Create a script that reads the relevant CMS tables and converts their contents into candidate version-controlled files for the new application.

The export utility should:

- Preserve original content, section ordering, and configuration semantics.
- Convert declarative configurations to TypeScript objects.
- Identify embedded JavaScript functions that require conversion to typed source code.
- Consolidate shared templates where possible.
- Preserve explicit exceptions and overrides.
- Produce a manifest of exported records and any unsupported configuration patterns.
- Validate that every relevant source record has been exported or explicitly accounted for.

Do not simply dump the entire database into one large JSON file and load that file at runtime.

The goal is a clean, understandable codebase of report templates, content modules, and visualization definitions.

### Database migration completion criteria

Before treating the migration as complete:

1. Account for all relevant CMS content records.
2. Verify that extracted configurations correctly reproduce representative reports.
3. Confirm that no editorial content is fetched from legacy CMS tables by the new application.
4. Confirm that dynamic data still comes from the existing Data USA APIs.
5. Verify that embedded JavaScript has been safely converted to source code, not dynamically evaluated.
6. Confirm that the new application can run without access to the legacy CMS database, except for a separately justified dimension-metadata connection.

### Relationship to the first milestone

Complete the necessary database discovery and content extraction for a representative geography report before beginning the first functional geography implementation.

The initial geography milestone must use **actual extracted CMS content and visualization configurations**, not hard-coded placeholder content or newly invented configurations.

Once the initial geography report has been validated, continue extracting and converting the remaining CMS content for the other report types.

The deployed application must never depend on the legacy CMS database for its editorial content or report configurations.

## 2. Required Technology Stack

Use:

- Next.js 16.4, App Router.
- React 19, using the version compatible with the selected Next.js release.
- TypeScript in strict mode.
- The latest compatible stable D3plus release, using modern `@d3plus/*` packages.
- `@d3plus/react` for interactive visualization components where appropriate.
- Native CSS or CSS Modules for styling.
- Native Next.js and React features wherever possible.
- Node.js on existing self-hosted virtual machines.
- PM2 for process management.
- Nginx as the reverse proxy.
- The existing Data USA APIs, including Tesseract.

Verify the currently published package versions and their compatibility before installing them. Pin validated versions and commit the lockfile.

Do not use:

- Canon Core.
- Canon CMS.
- Canon Vizbuilder.
- A replacement CMS.
- A general-purpose visualization builder.
- An ORM unless absolutely justified.
- Redux, Zustand, or other global state-management libraries without a demonstrated need.
- Tailwind, Bootstrap, Material UI, or other full UI frameworks.
- Unnecessary component abstractions or third-party utilities.
- The deprecated `d3plus-react` package.

Use the smallest practical dependency set.

A dependency is acceptable when it solves a meaningful problem more reliably or maintainably than a small custom implementation. Do not interpret the minimal-dependencies requirement as permission to reinvent complex, security-sensitive infrastructure.

---

## 3. Completely Eliminate CMS-Based Content Management

This is a fundamental architectural requirement.

The existing application stores substantial amounts of editorial content, configuration JSON, and JavaScript logic in PostgreSQL.

**The new application must not fetch editorial content or visualization configurations from PostgreSQL at runtime.**

Instead, extract the existing configurations and express them as version-controlled source files.

This includes:

- Report page definitions.
- Page titles and descriptions.
- Section ordering and grouping.
- Editorial text and introductory narratives.
- Header and KPI configurations.
- Visualization types and options.
- Data queries and their parameters.
- Chart-specific colors, labels, and formatting.
- Dynamic text-generation functions.
- Conditional rendering logic.
- Custom behavior for specialized report types.
- Metadata and SEO configuration.
- Static content pages.

### Content representation

Prefer a combination of:

- TypeScript modules for content involving JavaScript functions, calculations, or conditional logic.
- Structured TypeScript objects for report and section configurations.
- TSX components for content that requires custom rendering.
- Plain Markdown or JSON where the content is entirely declarative.

Avoid MDX unless it provides a clear benefit over simpler alternatives.

Static text should remain easy to edit without requiring developers to understand React internals.

### Important: Existing JavaScript configurations

Some current database configurations contain JavaScript functions rather than just JSON.

Inspect these carefully.

Convert existing functions into normal, typed TypeScript functions defined in the repository.

Do not implement a new interpreter that executes JavaScript strings stored in configuration files.

Do not use `eval`, `new Function`, or other runtime code-evaluation approaches.

Where multiple configurations contain substantially similar functions, consolidate genuinely shared behavior into reusable utilities.

Do not create a complicated generic abstraction to accommodate every possible legacy configuration format.

### One-time content extraction

Create a migration utility that reads existing CMS records and exports them into candidate source files.

The extraction utility is for development/migration only.

The deployed application must not use the old CMS database tables.

Preserve the meaning, ordering, identifiers, and configuration semantics of extracted content.

Any code requiring manual conversion should be clearly identified and tracked.

Once the migration is complete, editing content in the new repository and deploying it should be the standard publishing workflow.

There is no need to build a CMS editing interface.

---

## 4. Distinguish Content from Data

This distinction is essential.

**Content and configuration belong in the Git repository. Data comes from the existing data infrastructure.**

For example:

Content and configuration:
- "Median Household Income"
- The section in which this chart appears.
- The description beneath the chart.
- Which API query supplies the chart.
- How chart colors, axes, and tooltips are configured.

These belong in code.

Data:
- The actual household income value.
- The latest available year.
- Time-series values.
- Geographic measurements.
- Industry, occupation, and education statistics.

These should continue to come from existing data APIs.

### Dimension metadata

The PostgreSQL database also contains dimension information, including geographies, industries, occupations, and other report entities.

Investigate whether the required dimension member information can be obtained through the existing APIs.

If not, retain a minimal, read-only PostgreSQL integration specifically for dimension metadata and identity resolution.

For example:
- Resolving a URL slug to the relevant dimension member.
- Finding the official name of an occupation.
- Retrieving hierarchical information for an industry.
- Resolving geography identifiers.

Do not use PostgreSQL to supply page layouts, narratives, visualization definitions, or other editorial configurations.

Do not duplicate millions of dimension records in TypeScript files merely to eliminate a simple database lookup.

The architecture must cleanly separate code-defined report templates from dynamic dimension members.

---

## 5. Report Template Architecture

Data USA contains many dynamically generated reports.

Do not create one manually maintained source file per report URL.

Instead, implement reusable templates by report type, with entity-specific overrides only where necessary.

For example, a geography report would be constructed from:

1. A geography report template defined in code.
2. The geography's identity and metadata.
3. Server-fetched KPI data.
4. Reusable chart definitions.
5. The report's available data from existing APIs.
6. Any exceptional content defined in the repository.

The same architecture should work for industries, occupations, education-related reports, and other supported report families.

### Suggested conceptual structure

The structure below is illustrative, not mandatory. Improve it if a simpler organization becomes apparent during implementation.

    src/
      app/
        page.tsx
        profile/
          [...segments]/
            page.tsx
        search/
        compare/

      components/
        layout/
        navigation/
        reports/
        visualizations/

      content/
        home.ts
        pages/
        reports/
          geography.ts
          industry.ts
          occupation.ts
          ...
        overrides/

      lib/
        api/
        dimensions/
        routing/
        seo/
        formatting/

      styles/

      scripts/
        extract-legacy-content.ts

Use direct TypeScript imports and a small typed registry to resolve report templates.

Avoid loading all report content and all visualization configurations into every request or client-side bundle.

### Report content functions

Support dynamically generated copy.

For example, a report's overview may need to describe its geography, latest population, and historical growth.

The textual template and formatting rules should be defined in source code.

The statistical values should be fetched from the existing API at request time or from an appropriate runtime cache.

Do not store copies of dynamic statistical values in source files.

Handle missing data, unavailable years, and suppressed values explicitly. Never substitute unverified or invented numbers.

---

## 6. Preserve the Existing Data API

The existing Data USA data API and Tesseract infrastructure should remain unchanged.

Do not rebuild Tesseract.

Do not migrate the data warehouse.

Do not redesign existing datasets or API contracts.

Inspect how the existing site constructs and submits API queries.

Create a small, typed interface around the existing API.

Responsibilities include:

- Building valid API requests.
- Handling dimension identifiers and filters.
- Fetching and parsing responses.
- Providing clear errors and empty-data states.
- Avoiding redundant requests.
- Supporting data downloads and exports.

Prefer fetching public chart data directly from the existing API when browser access is already supported and safe.

Use server-side requests for SEO-critical KPIs and overviews.

Introduce a Next.js API proxy or backend-for-frontend only where required for credentials, security, same-origin behavior, or meaningful performance improvements.

Do not build a proxy layer simply because the framework supports it.

---

## 7. Rendering Architecture: Server vs. Client

The new application should use a deliberate hybrid rendering strategy.

### Server-rendered elements

The following must be rendered by Next.js on the server:

- Report headings and titles.
- Header KPI statistics.
- Introductory descriptions.
- Important overview narratives.
- SEO metadata.
- Canonical URLs.
- Important internal navigation links.

These elements must be present in the server-generated HTML and accessible to search engines without client-side JavaScript execution.

This is a hard requirement.

Ensure SEO-critical content is not trapped behind client-only rendering, browser-side data fetching, or streaming boundaries that prevent it from appearing in the server response.

Use server components and server-side data fetching for these elements.

### Client-rendered elements

Use client components for:

- D3plus visualizations.
- Chart filters and selectors.
- Interactive comparisons.
- Hover interactions and tooltips.
- Dynamic chart controls.
- Interactive maps.
- Visualization exports.
- Other browser-dependent interactions.

Avoid rendering an entire report as a Client Component merely because the report contains charts.

Most of the page should remain server-rendered React, with individual interactive islands.

### Visualization loading

Investigate progressively loading charts as they approach the viewport.

Data USA reports can be long and contain many visualizations.

Ideally, opening a report should not immediately load every chart's JavaScript and fetch every chart's data.

Use dynamic imports, native browser APIs, and lightweight loading placeholders where appropriate.

Reserve layout space to avoid significant layout shifts.

Prioritize header content and above-the-fold interactions.

---

## 8. Eliminate Pre-Caching and Build-Time Page Generation

The current three-day pre-caching requirement must be eliminated entirely.

Do not reproduce it using Next.js static generation.

The site must support an arbitrary valid report URL loading on its first request after deployment, even if that report has never been visited before.

### Requirements

- Do not enumerate all profile routes through `generateStaticParams`.
- Do not statically generate tens of thousands of profiles during builds.
- Do not run deployment scripts that visit or warm every report.
- Do not require generating HTML files for individual report URLs.
- Do not require a warm in-memory cache for correct operation.
- Do not require rebuilding the application when new dimension members become available.
- Do not tie build duration to the number of report entities.

Use dynamic routes and runtime data fetching.

### Selective caching

Use the modern Next.js Cache Components model, including `use cache`, `cacheLife`, and `cacheTag`, where appropriate.

Cache reusable and expensive data, such as:

- Dimension lookups.
- Expensive KPI requests.
- Common API query results.
- Frequently requested report metadata.
- Expensive shared calculations.

Do not indiscriminately cache the entire report page.

Distinguish between:
- Immutable or version-controlled content.
- Slowly changing dimension metadata.
- Statistical data updated on scheduled releases.
- Frequently changing runtime information.

### Cache invalidation

The website receives both scheduled dataset updates and irregular content edits.

Handle these differently.

**Content changes:** Content lives in Git, so editorial changes will be published through normal code deployments. No full-page cache warming should be required.

**Data changes:** Cached API data should refresh through explicit invalidation, defined cache lifetimes, or another documented runtime strategy.

Build a clear approach to invalidating cached data after dataset releases without redeploying the application.

### Multiple PM2 processes

The application will run on self-hosted VMs and may use multiple PM2 workers or instances.

Do not assume a process-local in-memory cache is shared across them.

Assess Next.js persistent cache behavior and whether a shared cache handler is needed.

Start with the simplest correct architecture and introduce shared infrastructure only when justified by real deployment requirements.

---

## 9. D3plus Visualization Architecture

Use modern D3plus packages, especially `@d3plus/react`.

Do not retain Canon Vizbuilder.

Instead, create a small, typed system that associates a code-defined visualization configuration with a chart component.

Support the visualization types actually used in Data USA, including their existing interactive behavior.

Audit every existing visualization type before determining the implementation scope.

### Preserve

- Core chart types.
- Color assignments.
- Data groupings.
- Formatting.
- Axes and legends.
- Tooltips.
- Interactive filtering.
- Time controls.
- Drilldowns.
- Navigation links.
- Download and export functionality.
- Comparison behavior.

Some minor UI improvements and simplifications are acceptable, particularly where they reduce code complexity or improve usability.

However, do not remove important functionality without identifying and documenting it.

### Minimize rendering overhead

Avoid unnecessary React rerenders and repeated D3plus instance initialization.

Reuse stable configurations and data where possible.

Load only the chart modules required by a particular report.

Keep large data arrays out of unrelated component state.

Do not pass every report's visualization definitions to the client.

Use the standard D3plus configuration APIs rather than writing a large compatibility framework around legacy Vizbuilder internals.

---

## 10. Visual Design Requirements

The new site should look recognizably the same as the current Data USA.

This is not an opportunity for a complete visual redesign.

Preserve the following:

- Branding.
- Typography.
- Color palette.
- Site navigation.
- Header structures.
- KPI presentation.
- Report layout.
- Section hierarchy.
- Chart appearance.
- Overall spacing and visual density.
- Desktop and mobile experiences.

Small refinements are acceptable if they simplify the implementation or improve usability.

Examples of acceptable changes include simplifying an overly complicated dropdown, improving a loading state, or replacing an obsolete UI pattern.

Do not make these decisions silently.

### Visual comparison

Use http://localhost:3300 as the reference.

Capture screenshots of representative pages at desktop and mobile viewport sizes.

Compare those screenshots against the new application at http://localhost:3301.

Develop a visual regression process that can detect major unexpected differences.

Inspect real page behavior, not just screenshots.

The new site must be demonstrably comparable to the old site before cutover.

---

## 11. Routing, Search, and SEO

Data USA receives significant search-engine traffic through its report pages.

Preserve existing URL structures and SEO behavior.

### Routing

Audit all existing route families.

Reproduce their paths and supported query parameters.

Ensure report routing works without enumerating every valid dimension member at build time.

Support appropriate redirects and 404 handling.

Do not break existing public URLs unnecessarily.

### SEO

Implement:

- Server-rendered report titles.
- Server-rendered header KPIs.
- Server-rendered overview text.
- Dynamic metadata.
- Canonical URLs.
- Open Graph metadata where appropriate.
- Existing structured data where useful.
- Internal linking.
- Correct HTTP status codes.
- Sitemap generation.
- Robots directives.

The sitemap must support the full report URL universe without requiring all report pages to be rendered.

For a large number of reports, investigate partitioned sitemap indexes generated from dimension metadata.

### Search

Preserve sitewide search functionality and its essential ranking and navigation behavior.

Inspect whether search currently relies on PostgreSQL, a dedicated index, or another service.

Prefer reusing an existing, appropriate data source.

Do not introduce Elasticsearch, Algolia, or other search infrastructure without a demonstrated requirement.

### Verification

Test the raw HTML returned from representative report URLs.

Confirm that important text, headers, KPI values, and metadata are present before client JavaScript executes.

Do not rely solely on visual browser tests to validate SEO.

---

## 12. External Dependencies and Integrations

Audit all existing integrations.

This may include:

- Analytics.
- Advertising.
- Consent management.
- Third-party embeds.
- Geocoding or search services.
- External fonts and assets.
- Monitoring and error reporting.
- Any other external scripts.

Classify each as required, optional, or obsolete.

Preserve required functionality, especially revenue-generating advertising integrations.

Remove unused or deprecated integrations.

Do not copy old tracking scripts into the new site without understanding their purpose.

Ensure required third-party scripts do not block critical content rendering and that consent-related behavior is preserved.

---

## 13. Deployment: Self-Hosted VMs, PM2, and Nginx

The deployment target is the existing self-hosted infrastructure.

Do not assume Vercel hosting.

Build a production-ready Node.js deployment strategy compatible with PM2 and Nginx.

Requirements:

- Standard production Next.js build.
- Independent build and start commands.
- Environment variables supplied at runtime or build time as appropriate.
- Appropriate process management and health checks.
- Graceful restarts.
- Proper static asset handling.
- Nginx reverse proxy compatibility.
- No dependency on Canon services.
- No required CMS database connection.
- No cache-warming deployment step.

Evaluate Next.js standalone output for simplifying production deployment.

Document the required Node.js version, environment variables, PM2 configuration, Nginx changes, and any persistent cache directory requirements.

### Production cutover

The new codebase will replace the existing site.

Do not design a long-term dual-application production architecture.

Prepare a straightforward cutover procedure with a rollback option.

The existing implementation should remain available as a rollback artifact until the replacement is validated.

---

## 14. Performance Objectives

The project should materially improve the existing operational and runtime performance.

Primary goals:

1. Eliminate the three-day pre-caching process.
2. Keep builds independent of report count.
3. Improve the time required to load a report from a cold cache.
4. Reduce unnecessary API and database requests.
5. Reduce JavaScript bundle size.
6. Improve interactivity.
7. Minimize layout shifts.
8. Reduce server complexity and resource utilization.

Establish baseline measurements using the existing application.

Measure at least:

- Build duration.
- Cold and warm time to first byte.
- Largest Contentful Paint.
- Interaction to Next Paint.
- Cumulative Layout Shift.
- JavaScript transferred.
- Number of API requests.
- Time required for an initial chart to become usable.
- Server memory and CPU utilization.

Propose realistic performance budgets based on the measurements.

A cold request must load correctly even when no application cache has been populated.

Use caching to improve speed, not to compensate for an architecture that cannot serve uncached requests.

---

## 15. Implementation Process

Do not attempt to translate the existing application line by line.

Start by understanding what the current application does, then design the simplest implementation that reproduces those behaviors.

### Phase 1 — Discovery

Inspect the local source code, PostgreSQL database, and running site.

Produce:

- Complete route inventory.
- Report type inventory.
- CMS content schema.
- Visualization configuration inventory.
- JavaScript configuration patterns.
- Dimension lookup requirements.
- Existing API endpoints and query conventions.
- Reusable visual assets.
- External dependency inventory.
- Current build and cache process.
- Proposed new architecture.

Pay special attention to discovering hidden business rules and data transformations currently implemented inside Canon configuration objects.

### Phase 2 — First Milestone: Complete Geography Report

**The first development milestone is to fully reproduce one existing Data USA geography report using the new architecture, with zero CMS dependencies and zero pre-caching.**

Choose a representative geography report from the existing application at http://localhost:3300, such as Massachusetts, and reproduce it in the new application at http://localhost:3301.

This should be a complete, functional page, not just a visual prototype.

The milestone must demonstrate:

1. **Dynamic routing:** The geography is resolved from its URL without build-time page generation.

2. **Code-defined content:** All report sections, editorial content, visualization configurations, and JavaScript logic are loaded from the new repository, with no runtime queries to legacy CMS tables.

3. **Server-rendered SEO content:** The report heading, header KPIs, introductory narrative, and metadata are rendered server-side and available in the initial HTML.

4. **Live data integration:** Statistical values and chart datasets come from the existing Data USA APIs. PostgreSQL may be used for dimension identity resolution if necessary, but never for editorial content.

5. **Complete visualization support:** The report's existing visualizations must work using modern D3plus, including their filters, tooltips, selectors, and interactions.

6. **Visual parity:** Compare the new report directly against the existing version at localhost:3300. Preserve the overall appearance, layout, typography, colors, and data presentation. Minor UI simplifications are acceptable.

7. **No pre-caching:** The report must load successfully immediately after a fresh deployment, with no prior visits, page generation, or cache warming.

8. **Reusable architecture:** After implementing the first geography, verify that at least two additional geographies can load successfully through the same template, without adding geography-specific source files or rebuilding the application.

9. **Performance validation:** Measure initial page load, server response time, JavaScript bundle size, and chart loading. Compare against the existing implementation.

10. **Functional testing:** Verify navigation, chart interactions, links, responsive behavior, and SEO metadata.

#### Milestone acceptance criteria

This milestone is complete only when:

- A complete geography report can be viewed and interacted with in the new application.
- Its essential content and visualizations match the existing site.
- No Canon or CMS runtime dependencies are present.
- All editorial content and configurations originate from source code.
- SEO-critical content is available in server-generated HTML.
- Multiple geographies work through the same reusable template.
- A previously unvisited geography loads successfully from a cold start.
- No pre-caching or build-time report generation is necessary.

**Do not proceed with the systematic migration of other report types until this milestone has been successfully demonstrated and validated.**

Once this milestone is complete, use the validated architecture to implement industries, occupations, universities, and the remaining report families.

### Phase 3 — Extract and Migrate Content

Build the content extraction script.

Convert existing database content and configurations to code.

Consolidate shared report definitions and logic.

Create explicit overrides for report-specific exceptions.

Verify content completeness against the existing site.

### Phase 4 — Complete Report Templates

Implement all supported report families using shared components and code-defined configurations.

Verify that new dimension members can be accessed without a build.

### Phase 5 — Complete Visualizations

Implement the visualization registry and remaining chart types, filters, exports, selectors, and interactions.

Ensure charts load data efficiently.

### Phase 6 — Supporting Features

Implement the homepage, search, comparison, static pages, datasets, navigational elements, and other existing functionality.

Audit and integrate necessary external services.

### Phase 7 — Regression Testing

Automate representative comparisons between ports 3300 and 3301.

Test:

- Rendering and content.
- Data accuracy.
- Chart appearance.
- Visualization controls.
- URL routing.
- Metadata and SEO.
- Mobile responsiveness.
- Missing data behavior.
- Download functionality.
- Cold-load performance.

### Phase 8 — Deployment Preparation

Create and test production build scripts.

Prepare PM2 and Nginx configuration.

Document environment setup, cache behavior, deployment, and rollback.

Verify that a full deployment requires neither page generation nor cache warming.

---

## 16. Acceptance Criteria

The rewrite is complete when:

1. The new application is an independent Next.js 16.4 codebase.
2. No Canon packages or CMS runtime dependencies remain.
3. Editorial content and visualization configurations are stored in version-controlled source files.
4. PostgreSQL is not used to store or retrieve editorial content at runtime.
5. The existing Data USA APIs remain compatible and operational.
6. Report pages are rendered dynamically from reusable templates.
7. Header statistics, essential narratives, and SEO metadata are rendered server-side.
8. Interactive visualizations use modern D3plus packages.
9. Major user functionality and public URLs are preserved.
10. The design remains closely aligned with the existing site.
11. No report pre-caching or bulk static generation is required.
12. A valid, previously unvisited report loads successfully from a cold start.
13. Builds do not scale with the total number of report URLs.
14. Content updates can be published through normal Git-based deployments.
15. Data updates become visible through documented cache invalidation or expiration.
16. The application can run on the existing PM2/Nginx infrastructure.
17. Performance, SEO, and functional regression tests pass.
18. The result has substantially less architectural complexity than the original application.

Initial Definition of Done
The initial geography-report milestone must be successfully completed and validated before broad migration begins, establishing that the architecture supports code-defined content, live data, server-rendered SEO information, modern D3plus visualizations, and on-demand rendering without pre-caching.

---

## 17. Working Instructions for the Coding Agent

You are expected to inspect the existing application deeply enough to understand it, but **not to reproduce its legacy architecture**.

Prefer building a small, clean system that captures the core behavior over creating a generic platform capable of replicating every historical Canon feature.

Prioritize simplicity, performance, maintainability, and clarity.

Before writing major components, verify the actual configuration schemas and API response shapes rather than guessing.

Document any information that cannot be determined from the available source code, database, or running application.

When implementation details are unclear, inspect the existing site and code before asking for clarification.

Do not quietly drop features or content when their migration is difficult.

Do not introduce speculative requirements, abstractions, or infrastructure that the new application does not need.

Do not spend unnecessary effort preserving legacy code structure.

Provide concise progress summaries, record significant architectural decisions, and keep an explicit list of migration gaps.

After the initial audit and architecture proposal, proceed with the implementation rather than stopping at documentation, unless an actual blocker requires my decision.

**The ultimate goal is not simply to make Data USA run on Next.js. It is to replace a complicated CMS-driven, heavily pre-cached application with a clean, code-defined, dynamically rendered website that is faster to deploy, easier to maintain, and capable of serving every Data USA report on demand.**