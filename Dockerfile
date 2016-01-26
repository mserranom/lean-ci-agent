FROM jenkins:1.625.3

USER root
RUN apt-get update -y && \
    apt-get install -y maven && \
    apt-get install -y nodejs && \
    apt-get install -y npm && \
    ln -s /usr/bin/nodejs /usr/bin/node
USER jenkins