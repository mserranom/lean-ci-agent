# https://hub.docker.com/_/jenkins/

FROM jenkins:1.642.1

USER root
RUN apt-get update -y && \
    apt-get install -y maven && \
    apt-get install -y nodejs && \
    apt-get install -y npm && \
    ln -s /usr/bin/nodejs /usr/bin/node
USER jenkins
