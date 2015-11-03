---
layout: post
title: Theano debugging settings
author: Ondrej Platek
tags:  Shell, Utilities
---

Purpose of this post is simple prepare copy paste settings for debugging Theano

``
THEANO_FLAGS="device=cpu,optimizer=None,exception_verbosity=high"
`` 

Pointers taken from http://deeplearning.net/software/theano/tutorial/debug_faq.html.
I also create dummy input values and intermediate variable in the Theano graph and print the dimensions.
