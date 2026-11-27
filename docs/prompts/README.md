# Task prompts

Prompts written for an agent, or a person working with one, to run a review or a test of the site
on its own. Each is self-contained: give it to the agent as the task.

| Prompt | What it does | Changes code? |
|---|---|---|
| [`penn-vs-production.md`](penn-vs-production.md) | Compares about 700 reports on penn.datausa.io with datausa.io (data, cosmetic, visualizations) and produces a spreadsheet of differences with suggested actions. Sized to run over a weekend. | No: read-only |
| [`unused-generators.md`](unused-generators.md) | Finds generators, and generator outputs, that no page shows, with what each costs in Tesseract time and cache space. | No: analysis only |
| [`redis-stress-test.md`](redis-stress-test.md) | Builds a stress mode and a Redis monitor into the warm UI, then stress tests the cache behind penn and recommends settings. | Only the tools, on their own branch |

Details that shouldn't be public (server names, access) are left out: ask the team for them.
