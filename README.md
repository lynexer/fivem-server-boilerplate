# FiveM Server Boilerplate
A lightweight FiveM server using `pnpm` to build and start FXServer

# Usage
1. Clone the repository:
    ```bash
    git clone https://github.com/lynexer/fivem-server-boilerplate.git
    cd fivem-server-boilerplate
    ```
2. Build the project:
    ```bash
    pnpm build
    ```
3. Get a FiveM license key:

    Visit [keymaster.fivem.net](https://keymaster.fivem.net/) to generate a key, then add it to your `server.cfg`:
    ```cfg
    sv_licenseKey "your-generated-key"
    ```
4. Start the server:
    ```bash
    pnpm start
    ```

# License
This project is licensed under the [MIT License](LICENSE)
