---
layout: post
title: Theano debugging settings
author: Ondrej Platek
tags:  Shell, Utilities
---

Purpose of this post is simple prepare copy paste settings for debugging Theano

```sh
THEANO_FLAGS="device=cpu,optimizer=None,exception_verbosity=high,compute_test_value=warn"
```

Pointers taken from http://deeplearning.net/software/theano/tutorial/debug_faq.html.

Consider using ``theano.printing.Print`` function.
Real deal for me is assigning demo values testing values to input variables ``x.tag.test_value = np.zeros(10,10)`` with ``compute_test_value=warn`` flag.
Obviously, ``eval`` is the simplest way to go.
