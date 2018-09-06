---
layout: post
title: Tweaks for running TensorFlow with GPU on OSX 10.11 
author: Ondrej Platek
tags: TensorFlow, GPU, OSX
---

Credit:todo TF issue
`cd usr/local/cuda/lib; ln -s libcuda.dylib libcuda.1.dylib`


Credit: https://github.com/arrayfire/arrayfire/issues/1384
https://developer.apple.com/download/more/  download Command line tools OS X 10.11 Xcode 7.2
sudo xcode-select --switch /Library/Developer/CommandLineTools

Get cuda-smi running 
`git clone https://github.com/phvu/cuda-smi.git; cd cuda-smi; ./compile.sh`
