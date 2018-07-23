# EYEWITNESS UI - PRODUCTION DOCKERFILE

# Use the official node base image and allow upgrades to any new minor version on redeploy.
FROM node:10
MAINTAINER Atchai <enquiries@atchai.com>
ENV NODE_ENV=production

# Prepare the software inside the container.
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y \
      vim \
      ntp \
    && rm -rf /var/lib/apt/lists/*
#      ^^ Keep the image size down by removing the packages list.

# Fix the time inside the container by starting the ntp service and setting the timezone.
RUN ntpd -gq && service ntp start
RUN echo Europe/London >/etc/timezone && dpkg-reconfigure -f noninteractive tzdata

# Copy GitHub SSH keys.
COPY ./ssl/id_eyewitness /root/.ssh/id_eyewitness
COPY ./ssl/id_eyewitness.pub /root/.ssh/id_eyewitness.pub
RUN chmod 600 /root/.ssh/id_eyewitness

# Setup SSH config.
RUN echo "Host *\n  IdentitiesOnly yes\n  StrictHostKeyChecking no\n  IdentityFile ~/.ssh/id_eyewitness" >> /root/.ssh/config

# Ensure we run commands inside the correct directory.
WORKDIR /src

# Install our depedencies.
COPY package.json /src/package.json
COPY package-lock.json /src/package-lock.json
COPY webpack.config.js /src/webpack.config.js
RUN npm install --dev

# Remove SSH keys (they aren't wanted in production).
RUN rm -f ./ssl/id_eyewitness /root/.ssh/id_eyewitness.pub

# Add all our application files.
COPY app /src/app

# Build the application frontend.
RUN npm run build

# Remove any non-production dependencies.
RUN npm install --production
RUN rm -f /src/webpack.config.js

# Run the application.
CMD ["npm", "run", "start-production"]
