# Eyewitness UI
User interface to allow admins to interact with their Eyewitness bot.

## Dependencies

#### Required
* Node.js (see the "engines" property in package.json for supported versions).
* Npm package manager.

#### Optional
* [Docker](https://www.docker.com/community-edition#/download) 17+ (for local testing)
* [Ngrok](https://ngrok.com/) (for local testing)
* MongoDB (if not using Docker for local testing)

## Local Development
When developing locally I like to use Docker (for environment encapsulation). I also use multiple terminal windows/tabs rather than starting all the Docker containers in one window as this makes it easier to read the application's terminal output.

### Install

1. Setup SSH keys registered with GitHub so that Docker will be able to fetch the `hippocamp` dependency from GitHub.
These should be saved to `./ssl/id_eyewitness` and `./ssl/id_eyewitness.pub`.

### Run
1. Start the [eyewitness bot](https://github.com/atchai/eyewitness) and dependencies.
2. Open an additional terminal tab, navigate into the folder for this project, and run `docker-compose up ui`.


## Deploying Eyewitness
See the [eyewitness](https://github.com/atchai/eyewitness) repo for instructions on how to deploy.
