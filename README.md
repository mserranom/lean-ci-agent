start jenkins:

  docker build -t leanci_jenkins .
  docker run -p 8080:8080 -p 50000:50000  -v `pwd`/jenkins_home:/var/jenkins_home leanci_jenkins

  available at http://192.168.99.100:8080/


  start an agent:

  java -jar Downloads/slave.jar -jnlpUrl http://192.168.99.100:8080/computer/local_slave/slave-agent.jnlp
