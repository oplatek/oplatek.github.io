---
layout: post
title: Setting up Apache Spark for Python on OSX
author: Ondrej Platek
tags: Big data, Spark, Python, OSX, Yosemite
---

The good news first, I managed to install Spark for Python in less than 30 minutes with basic googling.[1][2]
If you do not want Google it yourself you may follow steps below:

* Verify your Java version

```sh
java -version
```

Mine version was, and worked fine for Spark 1.4.0 and OS X 10.10.4 (Yosemite)
```
java version "1.8.0_20"
Java(TM) SE Runtime Environment (build 1.8.0_20-b26)
Java HotSpot(TM) 64-Bit Server VM (build 25.20-b23, mixed mode)
```

* Install Homebrew if you do not have it

```sh
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" 
```

* Install Scala

```sh
brew install scala 
```

* Set environmental variables for Scala.
   _You should put these settings to `.bashrc` for permanent usage_

```sh
export JAVA_HOME=$(/usr/libexec/java_home) 
export SCALA_HOME=/usr/local/bin/scala  
export PATH=$PATH:$SCALA_HOME/bin 
```

* Download Spark from https://spark.apache.org/downloads.html

```sh
cd YOUR_FOLDER_WHERE_YOU_WANT_TO_INSTALL_SPARK # I install it into ~/Library
tar -xvzf spark*.tgz
cd spark-* 
```

* Build Apache Spark. May take some time.

```sh
sbt/sbt clean assembly
```

* Pyspark (Spark for Python) depends on `py4j` package so install it before launching Spark scripts with `SparkContext` from standard Python interpreter

```sh
pip install py4j   # sudo may be required
```

* Set up your environment.
   _You should put these settings to `.bashrc` for permanent usage_

```sh
export SPARK_HOME=$HOME/Library/spark-1.4.0
export PYTHONPATH=$SPARK_HOME/python:$PYTHONPATH
export PATH=$PATH:$SPARK_HOME/bin 
export IPYTHON=1
```
    - Note that `IPYTHON=1` is optional and its used only when launching interactive shell with `pyspark`.
    - Do not forget to `source ~/.bashrc` to activate the settings



Test time
---------
So lets download the official _word count_ example, and run the example using standard Python interpreter. Note we are redirecting tons of logging from Spark to `/dev/null` so one can see the results.

```sh
wget https://raw.githubusercontent.com/apache/spark/master/examples/src/main/python/wordcount.py
echo "TESTING TIME" > test.txt 
python wordcount.py  2> /dev/null
```

The expected output is:

```sh
TESTING: 1
TIME: 1
```

Alternatives
------------
You may want to play with `pyspark` interactively or as an interpreter.
See the [docs](https://spark.apache.org/docs/0.9.1/python-programming-guide.html)



References
----------
1. http://genomegeek.blogspot.cz/2014/11/how-to-install-apache-spark-on-mac-os-x.html
2. http://stackoverflow.com/questions/25205264/how-do-i-install-pyspark-for-use-in-standalone-scripts
