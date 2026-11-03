# Instructions for AI assistants

This project keeps the record of a physical thing under the traceable-design standard.
For every task, follow `.claude/skills/traceable-design/SKILL.md`.

- Start each session with `python tools/tdr.py status` and read `STATUS.md` only.
- Look values up with `python tools/tdr.py get <id or key>`, or the MCP server `tdr` (`python tools/tdr.py mcp`).
- Before finishing a change, run `python tools/tdr.py check` and `python tools/tdr.py status`, and end the change description with its tier trailers.

## About this project

Fill these in when the project starts.

- Owner: Koji Fujisato (fujisato-koji)
- What the thing is: one go-kart for the owner's private land, driven mainly by a child and also by an adult, on paved ground, gravel, grass, packed snow, and fresh snow (D-001).
- Language of the record: English. The owner talks with the assistant in Japanese (D-002).
- Where the owner keeps private facts (outside this repository): a folder on the owner's computer next to this repository, named kart-private. Nothing private is needed yet.
