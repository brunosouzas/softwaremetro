## MODIFIED Requirements

### Requirement: Writes
The build reads only the catalogue folder and the skill set's files. The build connects to no host; Astro's Fonts API opens a server during the build, which stackledger binds to loopback (127.0.0.1). It SHALL write only inside the output folder, with Astro's working copy, generated files and every cache (Astro's and Vite's `cacheDir`) under the staging folder, and SHALL NOT write in the catalogue or skills folders, the installed package, the system temporary directory or the user's home folder.

#### Scenario: Sandboxed build
- **WHEN** the command runs with `--skills` under the Node.js permission model with read access to the catalogue folder, the skills folder and the package, write access only to `--out`, and `--allow-addons --allow-child-process --allow-worker`, with `--allow-net` where Node has it and a network trap preloaded that refuses any host other than loopback and reports every server the process opens
- **THEN** both sites are built with their Skills pages, no connection to a host other than loopback is attempted, no server listens on an address other than loopback, and child processes, which the model does not restrict, are outside this check

#### Scenario: Font server on loopback
- **WHEN** a build runs
- **THEN** every server the build opens listens on 127.0.0.1 and none remains open after the build
