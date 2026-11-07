## MODIFIED Requirements

### Requirement: Writes
The command reads only the catalogue folder and the skill set's files and SHALL NOT connect to any host; Astro's Fonts API listens on loopback during the build. It SHALL write only inside the output folder. Astro's working copy, generated files and every cache (Astro `cacheDir` and Vite `cacheDir`) SHALL be under the staging folder. It SHALL NOT write in the catalogue folder, the skills folders, the installed stackledger package, the system temporary directory or the user's home folder.

#### Scenario: Sandboxed build
- **WHEN** the command runs with `--skills` under the Node.js permission model with read access to the catalogue folder, the skills folder and the package, write access only to `--out`, and `--allow-addons --allow-child-process --allow-worker`, with `--allow-net` where Node has it and a network trap preloaded
- **THEN** both sites are built with their Skills pages and no connection to a host other than loopback is attempted, and child processes, which the model does not restrict, are outside this check

#### Scenario: Network trap fires
- **WHEN** a script run under the same flags fetches `http://example.com`
- **THEN** it exits with a non-zero code and stderr holds the trap's marker, before any DNS lookup
