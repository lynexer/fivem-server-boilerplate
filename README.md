# FiveM Server Boilerplate
A lightweight FiveM server using `pnpm` to build and start FXServer

# Usage
1. Clone the repository:
    ```bash
    git clone https://github.com/lynexer/fivem-server-boilerplate.git
    cd fivem-server-boilerplate
    ```
2. Choose your platform and build the server binaries:

    Interactive (recommended):
    ```bash
    pnpm build
    ```

    Or pick explicitly:
    ```bash
    pnpm build:legacy     # classic FXServer (FXServer.exe)
    pnpm build:enhanced   # FiveM for GTAV Enhanced (cfx-server.exe)
    ```

    Your choice is saved in `.server-platform`, so the next steps never need to
    know which platform you are using.

3. Get a FiveM license key:

    Visit [keymaster.fivem.net](https://keymaster.fivem.net/) to generate a key, then add it to your `server.cfg`:
    ```cfg
    sv_licenseKey "your-generated-key"
    ```
4. Start the server:
    ```bash
    pnpm start
    ```

    `pnpm start` launches the correct binary for your saved platform
    (`FXServer.exe` for legacy, `cfx-server.exe` for enhanced).

### Switching platforms

To switch between legacy and enhanced, just run the matching build command again:

```bash
pnpm build:enhanced
# or
pnpm build:legacy
```

This re-downloads the artifacts and updates the saved platform.


# License
This project is licensed under the [MIT License](LICENSE)
